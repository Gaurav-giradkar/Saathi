import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'

import { generatePersonalizedRecommendations } from '../utils/recommendationEngine.js'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'

import {
  auth,
  db,
  firebaseConfigured,
  firebaseConfigError,
} from '../lib/firebase.js'

import {
  PHASES,
  INSIGHT_TEMPLATES,
  WELLNESS_CATEGORIES,
  SUPPORT_SUGGESTIONS,
  SYMPTOM_OPTIONS,
  SHARING_CATEGORIES,
  getPhaseForDay,
} from './mockData.js'

/* ==========================================================================
   GENERAL HELPERS
========================================================================== */

const todayISO = () => {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const requireFirebase = () => {
  if (!firebaseConfigured || !auth || !db) {
    throw new Error(firebaseConfigError)
  }
}

const requireUser = () => {
  requireFirebase()

  if (!auth.currentUser) {
    throw new Error('Please sign in to continue.')
  }

  return auth.currentUser
}

const normaliseError = (error) => {
  const code = error?.code || ''

  if (code.includes('invalid-email')) {
    return 'Enter a valid email address.'
  }

  if (
    code.includes('user-not-found') ||
    code.includes('wrong-password') ||
    code.includes('invalid-credential')
  ) {
    return 'Email or password is incorrect.'
  }

  if (code.includes('email-already-in-use')) {
    return 'An account already exists for this email.'
  }

  if (code.includes('weak-password')) {
    return 'Use a password with at least 6 characters.'
  }

  if (code.includes('network')) {
    return 'Unable to connect. Check your internet connection and try again.'
  }

  return error?.message || 'Something went wrong. Please try again.'
}

const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000

const getInviteExpiry = () =>
  Timestamp.fromMillis(Date.now() + INVITE_EXPIRY_MS)

const isInviteExpired = (invite) => {
  if (!invite?.expiresAt) return false

  try {
    return invite.expiresAt.toMillis() <= Date.now()
  } catch {
    return false
  }
}

/* ==========================================================================
   SHARED SUPPORTER PROJECTION
========================================================================== */

async function publishSharedProjection(ownerUid) {
  const owner = (
    await getDoc(
      doc(db, 'users', ownerUid),
    )
  ).data() || {}

  const permissions =
    owner.sharingPermissions || {}

  const cycle =
    computeCycleInfo(
      owner.cycleSetup,
    )

  const health =
    await getHealthData().catch(
      () => null,
    )

  const connections =
    await getDocs(
      query(
        collection(db, 'connections'),
        where(
          'ownerUid',
          '==',
          ownerUid,
        ),
        where(
          'status',
          '==',
          'active',
        ),
      ),
    )

  const shared = {
  permissions,

  cyclePhase: permissions.cyclePhase
    ? cycle.phase?.label || null
    : null,

  periodStatus: permissions.periodStatus
  ? health?.periodStatus || 'Not on period'
  : null,

  expectedPeriod: permissions.expectedPeriod
    ? cycle.nextPeriodDate
    : null,

  painLevel: permissions.painLevel
    ? health?.pain ?? null
    : null,

  symptoms: permissions.symptoms
    ? health?.symptoms || []
    : [],

  mood: permissions.mood
    ? health?.moods || health?.mood || null
    : null,

  dietNutrition: permissions.dietNutrition
    ? {
        meals: health?.meals || [],
        appetite: health?.appetite || '',
        cravings: health?.cravings || [],
        waterLiters: health?.waterLiters ?? null,
      }
    : null,

  sleep: permissions.sleep
    ? {
        duration: health?.sleep ?? null,
        quality: health?.sleepQuality || '',
        issues: health?.sleepIssues || [],
      }
    : null,

  medicalInfo: permissions.medicalInfo
    ? {
        notes: health?.notes || '',
        painLocations: health?.painLocations || [],
        painTypes: health?.painTypes || [],
        relief: health?.relief || [],
      }
    : null,

  energy: permissions.energy
    ? health?.energy || ''
    : null,

  updatedAt: serverTimestamp(),
}

  await Promise.all(
  connections.docs.map(async (connection) => {
    await updateDoc(
      doc(db, 'connections', connection.id),
      {
        sharing: permissions,
        updatedAt: serverTimestamp(),
      },
    )

    await setDoc(
      doc(
        db,
        'connections',
        connection.id,
        'shared',
        'currentStatus',
      ),
      shared,
    )
  }),
)
}
/* ==========================================================================
   CYCLE
========================================================================== */

export function computeCycleInfo(cycleSetup = {}) {
  const cycleLength = Number(cycleSetup.cycleLength || 28)
  const periodLength = Number(cycleSetup.periodLength || 5)
  const lastPeriodStart =
    cycleSetup.lastPeriodStart || todayISO()

  const start = new Date(`${lastPeriodStart}T00:00:00`)

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  let cycleDay =
    Math.floor((now - start) / 86400000) % cycleLength + 1

  if (cycleDay <= 0) {
    cycleDay += cycleLength
  }

  const phaseKey = getPhaseForDay(
    cycleDay,
    cycleLength,
    periodLength,
  )

  const next = new Date(now)

  next.setDate(
    next.getDate() +
      cycleLength -
      cycleDay +
      1,
  )

  return {
    cycleDay,
    cycleLength,
    periodLength,
    phaseKey,
    phase: PHASES[phaseKey],
    isOnPeriod: cycleDay <= periodLength,
    daysUntilNextPeriod:
      cycleLength - cycleDay + 1,
    nextPeriodDate: next
      .toISOString()
      .slice(0, 10),
    ovulationDay: cycleLength - 14,
  }
}

/* ==========================================================================
   AUTH
========================================================================== */

export async function login({ email, password }) {
  try {
    requireFirebase()

    return await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    )
  } catch (error) {
    throw new Error(
      error.message === firebaseConfigError
        ? error.message
        : normaliseError(error),
    )
  }
}

export async function signup({
  name,
  email,
  password,
}) {
  try {
    requireFirebase()

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )

    await credential.user.getIdToken()

    await setDoc(
      doc(db, 'users', credential.user.uid),
      {
        uid: credential.user.uid,
        name: name.trim(),
        email: credential.user.email,
        role: null,
        onboardingComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    )

    return credential
  } catch (error) {
    throw new Error(normaliseError(error))
  }
}

export async function logout() {
  requireFirebase()
  await firebaseSignOut(auth)
}

export async function resetPassword(email) {
  try {
    requireFirebase()

    await sendPasswordResetEmail(
      auth,
      email.trim(),
    )
  } catch (error) {
    throw new Error(
      error.message === firebaseConfigError
        ? error.message
        : normaliseError(error),
    )
  }
}

export async function getAuthState(
  uid = auth?.currentUser?.uid,
) {
  if (!uid) {
    return {
      loggedIn: false,
      accountType: null,
      onboarded: false,
    }
  }

  const snapshot = await getDoc(
    doc(db, 'users', uid),
  )

  const profile = snapshot.exists()
    ? snapshot.data()
    : {}

  return {
    loggedIn: true,
    accountType: profile.role || null,
    onboarded: Boolean(
      profile.onboardingComplete,
    ),
    profile,
  }
}

export async function setAccountType(role) {
  const user = requireUser()

  await setDoc(
    doc(db, 'users', user.uid),
    {
      uid: user.uid,
      email: user.email,
      role,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/* ==========================================================================
   USER SETUP
========================================================================== */

export async function saveUserSetup({
  profile,
  cycle,
}) {
  const user = requireUser()

  const setup = {
    ...cycle,
    periodLength: Number(
      cycle.periodLength,
    ),
    cycleLength: Number(
      cycle.cycleLength,
    ),
  }

  const sharingPermissions =
    SHARING_CATEGORIES.reduce(
      (all, item) => ({
        ...all,
        [item.key]:
          item.defaultOn ?? false,
      }),
      {},
    )

  await setDoc(
    doc(db, 'users', user.uid),
    {
      ...profile,
      uid: user.uid,
      email: user.email,
      role: 'user',
      cycleSetup: setup,
      sharingPermissions,
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  await setDoc(
    doc(
      db,
      'users',
      user.uid,
      'cycles',
      setup.lastPeriodStart,
    ),
    {
      startDate: setup.lastPeriodStart,
      cycleLength: setup.cycleLength,
      periodLength: setup.periodLength,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function saveSupporterSetup(data) {
  const user = requireUser()

  await setDoc(
    doc(db, 'users', user.uid),
    {
      ...data,
      uid: user.uid,
      email: user.email,
      role: 'supporter',
      onboardingComplete: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/* ==========================================================================
   USER / CYCLE DATA
========================================================================== */

export async function getUserData() {
  const user = requireUser()

  const snap = await getDoc(
    doc(db, 'users', user.uid),
  )

  const profile = snap.data() || {}

  return {
    ...profile,
    cycleInfo: computeCycleInfo(
      profile.cycleSetup,
    ),
  }
}

export async function getCycleData() {
  const user = requireUser()

  const profile = (
    await getDoc(
      doc(db, 'users', user.uid),
    )
  ).data() || {}

  const cycles = await getDocs(
    collection(
      db,
      'users',
      user.uid,
      'cycles',
    ),
  )

  const history = cycles.docs
    .map((d) => {
      const c = d.data()

      return {
        month:
          c.startDate?.slice(0, 7) ||
          d.id,
        length: Number(
          c.cycleLength || 28,
        ),
      }
    })
    .sort((a, b) =>
      a.month.localeCompare(b.month),
    )

  return {
    ...(profile.cycleSetup || {}),
    ...computeCycleInfo(
      profile.cycleSetup,
    ),
    history,
  }
}

export async function updateCycleSetup(
  partial,
) {
  const user = requireUser()

  const profile = (
    await getDoc(
      doc(db, 'users', user.uid),
    )
  ).data() || {}

  const cycleSetup = {
    ...(profile.cycleSetup || {}),
    ...partial,
  }

  await setDoc(
    doc(db, 'users', user.uid),
    {
      cycleSetup,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  await publishSharedProjection(user.uid)

  return cycleSetup
}

/* ==========================================================================
   HEALTH DATA
========================================================================== */

export async function getHealthLogs() {
  const user = requireUser()

  const snapshots = await getDocs(
    collection(
      db,
      'users',
      user.uid,
      'healthEntries',
    ),
  )

  return Object.fromEntries(
    snapshots.docs.map((entry) => [
      entry.id,
      entry.data(),
    ]),
  )
}

export async function getHealthData(
  date = todayISO(),
) {
  const user = requireUser()

  const snapshot = await getDoc(
    doc(
      db,
      'users',
      user.uid,
      'healthEntries',
      date,
    ),
  )

  return snapshot.exists()
    ? snapshot.data()
    : null
}

export async function getHealthHistory(days = 7) {
  const user = requireUser()

  const snapshots = await getDocs(
    collection(
      db,
      'users',
      user.uid,
      'healthEntries',
    ),
  )

  const entries = snapshots.docs
    .map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }))
    .sort((a, b) =>
      String(a.date || a.id).localeCompare(
        String(b.date || b.id),
      ),
    )

  return entries.slice(-days)
}

export async function getCustomSymptoms() {
  const user = requireUser()

  const snapshot = await getDoc(
    doc(db, 'users', user.uid),
  )

  return Array.isArray(
    snapshot.data()?.customSymptoms,
  )
    ? snapshot.data().customSymptoms
    : []
}

export async function addCustomSymptom(name) {
  const user = requireUser()

  const symptom = String(name || '')
    .trim()
    .replace(/\s+/g, ' ')

  if (!symptom) {
    throw new Error(
      'Enter a symptom name.',
    )
  }

  if (symptom.length > 120) {
    throw new Error(
      'Keep a custom symptom to 120 characters or fewer.',
    )
  }

  const profileRef = doc(
    db,
    'users',
    user.uid,
  )

  const snapshot =
    await getDoc(profileRef)

  const customSymptoms =
    Array.isArray(
      snapshot.data()?.customSymptoms,
    )
      ? snapshot.data().customSymptoms
      : []

  const knownSymptoms = [
    ...SYMPTOM_OPTIONS,
    ...customSymptoms,
  ]

  const existing = knownSymptoms.find(
    (item) =>
      item.toLowerCase() ===
      symptom.toLowerCase(),
  )

  if (existing) {
    return {
      symptom: existing,
      customSymptoms,
      added: false,
    }
  }

  const next = [
    ...customSymptoms,
    symptom,
  ]

  await setDoc(
    profileRef,
    {
      customSymptoms: next,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  return {
    symptom,
    customSymptoms: next,
    added: true,
  }
}

function normaliseHealthEntry(entry) {
  const customTextFields = [
    'otherSymptom',
    'otherPainLocation',
    'otherPainType',
    'otherExercise',
    'otherMeal',
    'otherCraving',
    'otherProtection',
    'otherProduct',
    'otherRelief',
  ]

  return customTextFields.reduce(
    (data, field) => ({
      ...data,
      [field]: String(
        data[field] || '',
      )
        .trim()
        .replace(/\s+/g, ' '),
    }),
    { ...entry },
  )
}

function validateHealthEntry(entry) {
  const numberInRange = (
    value,
    min,
    max,
    label,
  ) => {
    if (
      value == null ||
      value === ''
    ) {
      return
    }

    const number = Number(value)

    if (
      !Number.isFinite(number) ||
      number < min ||
      number > max
    ) {
      throw new Error(
        `${label} must be between ${min} and ${max}.`,
      )
    }
  }

  numberInRange(
    entry.pain,
    0,
    10,
    'Pain level',
  )

  numberInRange(
    entry.sleep,
    0,
    24,
    'Sleep duration',
  )

  numberInRange(
    entry.waterLiters,
    0,
    10,
    'Water intake',
  )

  numberInRange(
    entry.exerciseMinutes,
    0,
    1440,
    'Exercise duration',
  )

  const requiredOtherText = [
    [
      'exerciseActivities',
      'Other',
      'otherExercise',
      'Enter the other exercise.',
    ],
    [
      'meals',
      'Other',
      'otherMeal',
      'Enter the other meal or food.',
    ],
    [
      'cravings',
      'Other',
      'otherCraving',
      'Enter the other craving.',
    ],
    [
      'productOptions',
      'Other',
      'otherProduct',
      'Enter the other product used.',
    ],
    [
      'relief',
      'Other',
      'otherRelief',
      'Enter the other relief used.',
    ],
  ]

  requiredOtherText.forEach(
    ([
      selectionField,
      otherOption,
      textField,
      message,
    ]) => {
      if (
        Array.isArray(
          entry[selectionField],
        ) &&
        entry[selectionField].includes(
          otherOption,
        ) &&
        !entry[textField]
      ) {
        throw new Error(message)
      }
    },
  )
}

export async function saveHealthLog(
  date,
  entry,
) {
  const user = requireUser()

  console.log(
    'API RECEIVED:',
    entry,
  )

  const normalisedEntry =
    normaliseHealthEntry(entry)

  console.log(
    'API NORMALISED:',
    normalisedEntry,
  )

  validateHealthEntry(
    normalisedEntry,
  )

  const data = {
    ...normalisedEntry,
    date,
    updatedAt: serverTimestamp(),
  }

  console.log(
    'FIREBASE WRITE DATA:',
    data,
  )

  const ref = doc(
    db,
    'users',
    user.uid,
    'healthEntries',
    date,
  )

  console.log(
    'FIREBASE PROJECT:',
    import.meta.env
      .VITE_FIREBASE_PROJECT_ID,
  )

  console.log(
    'FIREBASE UID:',
    user.uid,
  )

  console.log(
    'FIREBASE PATH:',
    `users/${user.uid}/healthEntries/${date}`,
  )

  console.log(
    'FIREBASE DATA:',
    data,
  )

  await setDoc(ref, {
    ...data,
    __debugWrite: 'SAATHI_TEST',
    __debugTime:
      new Date().toISOString(),
  })

  console.log(
    'FIREBASE WRITE COMPLETE',
  )

  await publishSharedProjection(user.uid)

  // Asynchronously generate/refresh today's Daily AI summary without blocking health log save
  triggerDailySummaryGeneration(date, normalisedEntry).catch((err) => {
    console.warn('[AI Daily Summary Generation Non-Blocking Error]:', err?.message)
  })

  return {
    ...normalisedEntry,
    date,
  }
}

/* ==========================================================================
   AI HELPER & REPORT GENERATION FUNCTIONS
========================================================================== */

/**
 * Deterministic hash to detect if source health entry changed
 * Computed strictly from the exact normalized health entry saved to Firestore
 */
function computeHealthEntryHash(entry = {}) {
  const keys = [
    'periodStatus',
    'bleeding',
    'pain',
    'painLocations',
    'painTypes',
    'otherPainLocation',
    'otherPainType',
    'energy',
    'mood',
    'moods',
    'stress',
    'sleep',
    'sleepQuality',
    'waterLiters',
    'symptoms',
    'otherSymptom',
    'meals',
    'otherMeal',
    'appetite',
    'cravings',
    'otherCraving',
    'productOptions',
    'otherProduct',
    'relief',
    'otherRelief',
    'exerciseActivities',
    'exerciseMinutes',
    'exerciseIntensity',
    'otherExercise',
    'notes',
  ]
  const values = keys.map((k) => JSON.stringify(entry[k] ?? ''))
  return values.join('|')
}

/**
 * Trigger Daily AI summary generation asynchronously if data changed
 */
async function triggerDailySummaryGeneration(date, healthEntry) {
  try {
    const uid = auth?.currentUser?.uid || 'local_user'
    const currentHash = computeHealthEntryHash(healthEntry)
    const storageKey = `saathi_ai_daily_${uid}_${date}`

    // Check existing Firestore document if db is available
    if (db && auth?.currentUser) {
      try {
        const reportRef = doc(db, 'users', uid, 'aiReports', `daily-${date}`)
        const existingSnap = await getDoc(reportRef).catch(() => null)
        if (existingSnap && existingSnap.exists()) {
          const existingData = existingSnap.data()
          if (existingData.sourceHash === currentHash && existingData.summary) {
            console.log('[AI Daily Summary] Source data unchanged. Skipping regeneration.')
            return
          }
        }
      } catch (e) {
        // Continue to generate
      }
    } else {
      // Check localStorage for staleness
      try {
        const cachedRaw = localStorage.getItem(storageKey)
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw)
          if (cached.sourceHash === currentHash && cached.summary) {
            console.log('[AI Daily Summary] Local source data unchanged. Skipping regeneration.')
            return
          }
        }
      } catch (e) {}
    }

    const cycle = await getCycleData().catch(() => ({}))

    const res = await fetch('/api/ai/daily-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        cycle,
        health: healthEntry,
      }),
    })

    if (!res.ok) {
      throw new Error(`AI daily summary server returned HTTP ${res.status}`)
    }

    const aiResult = await res.json()
    const dataObj = aiResult?.data || aiResult || {}

    const docPayload = {
      date,

      report: dataObj.report || '',

      symptomAnalysis: Array.isArray(dataObj.symptomAnalysis)
        ? dataObj.symptomAnalysis
        : [],

      overallObservation: dataObj.overallObservation || '',

      focus: Array.isArray(dataObj.focus)
        ? dataObj.focus
        : [],

      source: dataObj.source === 'gemini'
        ? 'gemini'
        : 'fallback',

      sourceHash: currentHash,
      sourceUpdatedAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
    }

    console.log('[AI Daily Summary Generated Shape]:', {
      date,
      source: docPayload.source,
      hasSummary: Boolean(docPayload.summary),
      keyPointsCount: docPayload.keyPoints.length,
    })

    // Save to localStorage for instant local access
    try {
      localStorage.setItem(storageKey, JSON.stringify(docPayload))
    } catch (e) {}

    // Save to Firestore if user & db available
    if (db && auth?.currentUser) {
      try {
        const reportRef = doc(db, 'users', uid, 'aiReports', `daily-${date}`)
        await setDoc(reportRef, docPayload, { merge: true })
        console.log('[AI Daily Summary] Stored in Firestore successfully for', date)
      } catch (fsErr) {
        console.warn('[AI Daily Summary Firestore Write Error]:', fsErr?.message)
      }
    }
  } catch (error) {
    console.warn('[AI Daily Summary Async Error]:', error?.message)
    // Save safe fallback daily report so reports page always has access to today's summary
    try {
      const uid = auth?.currentUser?.uid || 'local_user'
      const currentHash = computeHealthEntryHash(healthEntry)
      const storageKey = `saathi_ai_daily_${uid}_${date}`
      const fallbackPayload = {
        date,

        summary:
          'Your health check-in has been recorded. Saathi will use your logged information to help you understand your wellbeing over time.',

        highlights: [
          healthEntry?.periodStatus
            ? `Period status: ${healthEntry.periodStatus}`
            : 'Check-in logged for today',

          healthEntry?.pain != null && healthEntry.pain !== ''
            ? `Pain level recorded: ${healthEntry.pain}/10`
            : 'Pain was not recorded',

          healthEntry?.energy
            ? `Energy level noted: ${healthEntry.energy}`
            : 'Energy was not recorded',

          healthEntry?.sleep
            ? `Sleep recorded: ${healthEntry.sleep} hours`
            : 'Sleep was not recorded',
        ],

        observations: [],

        focus: [
          'Continue tracking your wellbeing consistently.',
          'Pay attention to changes in sleep, energy, pain, and symptoms.',
        ],

        source: 'fallback',
        sourceHash: currentHash,
        sourceUpdatedAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(fallbackPayload))
      } catch (e) {}

      if (db && auth?.currentUser) {
        const reportRef = doc(db, 'users', uid, 'aiReports', `daily-${date}`)
        await setDoc(reportRef, fallbackPayload, { merge: true })
      }
    } catch (fallbackErr) {
      console.warn('[AI Daily Summary Fallback Write Warning]:', fallbackErr?.message)
    }
  }
}

/**
 * Get cached Daily AI Summary
 */
export async function getDailyAISummary(date) {
  const uid = auth?.currentUser?.uid || 'local_user'
  const storageKey = `saathi_ai_daily_${uid}_${date}`

  if (db && auth?.currentUser) {
    try {
      const reportRef = doc(db, 'users', uid, 'aiReports', `daily-${date}`)
      const snap = await getDoc(reportRef)
      if (snap.exists() && snap.data()?.summary) {
        const data = snap.data()
        try {
          localStorage.setItem(storageKey, JSON.stringify(data))
        } catch (e) {}
        return data
      }
    } catch (fsErr) {
      console.warn('[AI Daily Summary Firestore Read Warning]:', fsErr?.message)
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {}

  return null
}

/**
 * Get cached Monthly AI Summary
 */
export async function getMonthlyAISummary(month) {
  const uid = auth?.currentUser?.uid || 'local_user'
  const storageKey = `saathi_ai_monthly_${uid}_${month}`

  if (db && auth?.currentUser) {
    try {
      const reportRef = doc(db, 'users', uid, 'aiReports', `monthly-${month}`)
      const snap = await getDoc(reportRef)
      if (snap.exists() && snap.data()?.summary) {
        const data = snap.data()
        console.log('[AI Monthly Summary Loaded from Firestore]:', {
          month,
          hasSummary: Boolean(data.summary),
          keyPointsCount: data.keyPoints?.length || 0,
        })
        try {
          localStorage.setItem(storageKey, JSON.stringify(data))
        } catch (e) {}
        return data
      }
    } catch (fsErr) {
      console.warn('[AI Monthly Summary Firestore Read Warning]:', fsErr?.message)
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      console.log('[AI Monthly Summary Loaded from Local Storage]:', {
        month,
        hasSummary: Boolean(parsed.summary),
      })
      return parsed
    }
  } catch (e) {}

  return null
}

/**
 * Generate Monthly AI Summary explicitly upon user click
 */
export async function generateMonthlyAISummary(month, { cycle = {}, entries = [], trends = {} } = {}) {
  const uid = auth?.currentUser?.uid || 'local_user'
  const storageKey = `saathi_ai_monthly_${uid}_${month}`

  console.log('[AI Monthly Summary] Requesting generation for month:', month)

  const res = await fetch('/api/ai/monthly-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      month,
      cycle,
      entries,
      trends,
    }),
  })

  if (!res.ok) {
    throw new Error(`Failed to generate monthly summary: HTTP ${res.status}`)
  }

  const aiResult = await res.json()
  const dataObj = aiResult?.data || aiResult || {}

  const docPayload = {
    month,
    summary: dataObj.summary || '',
    keyPoints: Array.isArray(dataObj.keyPoints)
      ? dataObj.keyPoints
      : Array.isArray(dataObj.highlights)
      ? dataObj.highlights
      : [],
    patterns: Array.isArray(dataObj.patterns)
      ? dataObj.patterns
      : Array.isArray(dataObj.trends)
      ? dataObj.trends
      : [],
    notableChanges: Array.isArray(dataObj.notableChanges)
      ? dataObj.notableChanges
      : Array.isArray(dataObj.changes)
      ? dataObj.changes
      : [],
    generatedAt: new Date().toISOString(),
  }

  console.log('[AI Monthly Summary Response Shape]:', {
    month,
    hasSummary: Boolean(docPayload.summary),
    keyPointsCount: docPayload.keyPoints.length,
    patternsCount: docPayload.patterns.length,
    notableChangesCount: docPayload.notableChanges.length,
  })

  // Save to localStorage for instant local resilience
  try {
    localStorage.setItem(storageKey, JSON.stringify(docPayload))
  } catch (e) {}

  // Save to Firestore if available
  if (db && auth?.currentUser) {
    try {
      const reportRef = doc(db, 'users', uid, 'aiReports', `monthly-${month}`)
      await setDoc(reportRef, docPayload, { merge: true })
      console.log('[AI Monthly Summary] Persisted to Firestore successfully for', month)
    } catch (fsErr) {
      console.warn('[AI Monthly Summary Firestore Write Warning]:', fsErr?.message)
    }
  }

  return docPayload
}

/**
 * Send AI Chat message (User or Supporter)
 */
export async function sendAIChatMessage({ message, context = {}, role = 'user', permissions = {}, isConnected = false }) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      context,
      role,
      permissions,
      isConnected,
    }),
  })

  if (!res.ok) {
    throw new Error(`AI Chat service returned HTTP ${res.status}`)
  }

  return await res.json()
}

/* ==========================================================================
   INSIGHTS / RECOMMENDATIONS
========================================================================== */

export async function getInsights() {
  const cycle = await getCycleData()

  return {
    insights:
      INSIGHT_TEMPLATES.map(
        (item, id) => ({
          id,
          ...item,
        }),
      ),
    painTrend: [],
    cycleInfo: cycle,
  }
}

export async function getRecommendations() {
  const user = requireUser()

  // Get the current data that recommendations depend on
  const [cycle, health] = await Promise.all([
    getCycleData(),
    getHealthData(),
  ])

  const healthData = health || {}

  /*
   * Create a deterministic source hash from:
   * - today's health data
   * - current cycle information
   *
   * If these haven't changed, the existing recommendations
   * can safely be reused.
   */
  const sourceHash = computeHealthEntryHash({
    ...healthData,
    __cycleDay: cycle?.cycleDay ?? '',
    __phaseKey: cycle?.phaseKey ?? '',
    __cycleLength: cycle?.cycleLength ?? '',
    __periodLength: cycle?.periodLength ?? '',
  })

  const reportRef = doc(
    db,
    'users',
    user.uid,
    'aiReports',
    'recommendations'
  )

  /*
   * ---------------------------------------------------------
   * 1. CHECK FIREBASE CACHE
   * ---------------------------------------------------------
   */

  try {
    const existingSnap = await getDoc(reportRef)

    if (existingSnap.exists()) {
      const existingData = existingSnap.data()

      if (
        existingData.sourceHash === sourceHash &&
        Array.isArray(existingData.categories) &&
        existingData.categories.length > 0
      ) {
        console.log(
          '[AI Recommendations] Source data unchanged. Using cached recommendations.'
        )

        return {
          phaseKey: cycle.phaseKey,
          categories: existingData.categories,
        }
      }
    }
  } catch (error) {
    console.warn(
      '[AI Recommendations] Firebase cache read failed:',
      error?.message
    )
  }

  /*
   * ---------------------------------------------------------
   * 2. DATA CHANGED → GENERATE NEW RECOMMENDATIONS
   * ---------------------------------------------------------
   */

  console.log(
    '[AI Recommendations] Health/cycle data changed. Generating new recommendations.'
  )

  const categoryConfigs = [
    {
      key: 'nutrition',
      icon: 'Apple',
      title: 'Nutrition',
      color: 'rose',
    },
    {
      key: 'exercise',
      icon: 'Dumbbell',
      title: 'Movement',
      color: 'plum',
    },
    {
      key: 'painManagement',
      icon: 'Thermometer',
      title: 'Pain Management',
      color: 'rose',
    },
    {
      key: 'selfCare',
      icon: 'Sparkles',
      title: 'Self-Care',
      color: 'teal',
    },
    {
      key: 'hygiene',
      icon: 'ShieldCheck',
      title: 'Menstrual Hygiene',
      color: 'teal',
    },
    {
      key: 'mentalWellness',
      icon: 'HeartHandshake',
      title: 'Mental Wellness',
      color: 'rose',
    },
  ]

  /*
   * Generate the six categories.
   *
   * This happens ONLY when the cached sourceHash does not
   * match the current health/cycle data.
   */
  const deterministic = generatePersonalizedRecommendations(
    healthData
  )

  const enrichedCategories = await Promise.all(
    categoryConfigs.map(async (cfg) => {
      const fallback = deterministic[cfg.key] || {}

      try {
        const res = await fetch('/api/ai/recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: cfg.key,
            healthData,
            cycleData: cycle,
          }),
        })

        if (res.ok) {
          const aiRec = await res.json()

          if (aiRec && aiRec.summary) {
            return {
              key: cfg.key,
              icon: cfg.icon,
              title: cfg.title,
              color: cfg.color,
              tip: aiRec.summary,
              insights:
                Array.isArray(aiRec.insights) &&
                aiRec.insights.length > 0
                  ? aiRec.insights
                  : fallback.insights || [],
              actions:
                Array.isArray(aiRec.actions) &&
                aiRec.actions.length > 0
                  ? aiRec.actions
                  : fallback.actions || [],
            }
          }
        }
      } catch (error) {
        console.warn(
          `[AI Recommendation] ${cfg.key} failed:`,
          error?.message
        )
      }

      return {
        key: cfg.key,
        icon: cfg.icon,
        title: cfg.title,
        color: cfg.color,
        tip: fallback.summary || '',
        insights: fallback.insights || [],
        actions: fallback.actions || [],
      }
    })
  )

  /*
   * ---------------------------------------------------------
   * 3. SAVE NEW RECOMMENDATIONS TO FIREBASE
   * ---------------------------------------------------------
   */

  const payload = {
    sourceHash,
    categories: enrichedCategories,
    phaseKey: cycle.phaseKey,
    generatedAt: new Date().toISOString(),
  }

  try {
    await setDoc(reportRef, payload, { merge: true })

    console.log(
      '[AI Recommendations] Saved to Firebase successfully.'
    )
  } catch (error) {
    console.warn(
      '[AI Recommendations] Firebase save failed:',
      error?.message
    )
  }

  return {
    phaseKey: cycle.phaseKey,
    categories: enrichedCategories,
  }
}

/* ==========================================================================
   SHARING PERMISSIONS
========================================================================== */

export async function getSharingPermissions() {
  const data = await getUserData()

  const defaults = SHARING_CATEGORIES.reduce(
    (all, item) => ({
      ...all,
      [item.key]: item.defaultOn ?? false,
    }),
    {},
  )

  const permissions = {
    ...defaults,
    ...(data.sharingPermissions || {}),
  }

  // Locked permissions are always OFF.
  SHARING_CATEGORIES.forEach((item) => {
    if (item.locked) {
      permissions[item.key] = false
    }
  })

  return permissions
}

export async function updateSharingPermissions(key, value) {
  const user = requireUser()

  const category = SHARING_CATEGORIES.find(
    (item) => item.key === key,
  )

  if (!category) {
    throw new Error('Unknown sharing permission.')
  }

  const permissions =
    await getSharingPermissions()

  // Locked permission cannot be enabled.
  if (category.locked) {
    permissions[key] = false

    await setDoc(
      doc(db, 'users', user.uid),
      {
        sharingPermissions: permissions,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    await publishSharedProjection(user.uid)

    return permissions
  }

  permissions[key] = Boolean(value)

  await setDoc(
    doc(db, 'users', user.uid),
    {
      sharingPermissions: permissions,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  await publishSharedProjection(user.uid)

  return permissions
}

/* ==========================================================================
   SUPPORTER CONNECTIONS
========================================================================== */

const inviteCode = () =>
  crypto
    .getRandomValues(
      new Uint32Array(1),
    )[0]
    .toString(36)
    .slice(-6)
    .toUpperCase()

/* --------------------------------------------------------------------------
   Generate a NEW invitation every time.
   Each invite gets its own connection document.
--------------------------------------------------------------------------- */

export async function generateInviteCode() {
  console.trace('🔥 generateInviteCode CALLED')
  const user = requireUser()

  const code = inviteCode()

  let ownerName =
    user.displayName || 'Connection'

  try {
    const userDoc = await getDoc(
      doc(db, 'users', user.uid),
    )

    if (
      userDoc.exists() &&
      userDoc.data()?.name
    ) {
      ownerName =
        userDoc.data().name
    }
  } catch {
    // Ignore profile lookup failure.
  }

  const permissions =
    await getSharingPermissions().catch(
      () => ({}),
    )

  const connectionRef = doc(
    collection(db, 'connections'),
  )

  const expiresAt =
    getInviteExpiry()

  const batch = writeBatch(db)

  batch.set(connectionRef, {
    ownerUid: user.uid,
    ownerName,

    supporterUid: null,
    supporterName: null,
    supporterProfile: null,

    status: 'pending',
    inviteCode: code,
    sharing: permissions,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  batch.set(
    doc(db, 'inviteCodes', code),
    {
      connectionId: connectionRef.id,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt,
    },
  )

  await batch.commit()

  return code
}

/* --------------------------------------------------------------------------
   Supporter enters invitation code.
   Saves supporter profile before owner approval.
--------------------------------------------------------------------------- */

export async function submitInviteCode(code) {
  const user = requireUser()

  const normalizedCode = String(code || '')
    .trim()
    .toUpperCase()

  if (!normalizedCode) {
    throw new Error('Enter an invitation code.')
  }

  const inviteRef = doc(
    db,
    'inviteCodes',
    normalizedCode,
  )

  const inviteSnap = await getDoc(inviteRef).catch((err) => {
    if (err?.code === 'permission-denied') {
      throw new Error(
        'Unable to resolve invitation. Please verify the code or generate a fresh invitation.',
      )
    }

    throw err
  })

  if (!inviteSnap.exists()) {
    throw new Error(
      'That invitation code was not found or has expired. Please generate a new code.',
    )
  }

  const invite = inviteSnap.data()

  if (invite.status !== 'pending') {
    throw new Error(
      'That invitation is no longer active.',
    )
  }

  // 24-hour expiry
  if (isInviteExpired(invite)) {
    await updateDoc(inviteRef, {
      status: 'expired',
      expiredAt: serverTimestamp(),
    })

    if (invite.connectionId) {
      await updateDoc(
        doc(
          db,
          'connections',
          invite.connectionId,
        ),
        {
          status: 'expired',
          updatedAt: serverTimestamp(),
        },
      ).catch(() => {})
    }

    throw new Error(
      'This invitation code has expired. Please request a new code.',
    )
  }

  if (!invite.connectionId) {
    throw new Error(
      'This invitation is invalid.',
    )
  }

  const connectionRef = doc(
    db,
    'connections',
    invite.connectionId,
  )

  const connectionSnap = await getDoc(
    connectionRef,
  ).catch((err) => {
    if (err?.code === 'permission-denied') {
      throw new Error(
        'Permission denied reading connection. Please ensure a new invitation was generated.',
      )
    }

    throw err
  })

  if (!connectionSnap.exists()) {
    throw new Error(
      'The connection could not be found.',
    )
  }

  const connection = connectionSnap.data()

  if (connection.status !== 'pending') {
    throw new Error(
      'That invitation is no longer active.',
    )
  }

  if (connection.ownerUid === user.uid) {
    throw new Error(
      'You cannot connect to your own invitation code.',
    )
  }

  if (connection.supporterUid) {
    throw new Error(
      'This invitation has already been used.',
    )
  }

  /*
   * Get the full supporter profile.
   * SupporterSetup.jsx saves:
   * name
   * relationship
   * helpStyle
   * notifications
   */
  let supporterProfile = {
    uid: user.uid,
    name: user.displayName || 'Supporter',
    email: user.email || '',
    relationship: '',
    helpStyle: '',
    notifications: false,
    role: 'supporter',
  }

  try {
    const userDoc = await getDoc(
      doc(db, 'users', user.uid),
    )

    if (userDoc.exists()) {
      const profile = userDoc.data() || {}

      supporterProfile = {
        uid: user.uid,

        name:
          profile.name ||
          user.displayName ||
          'Supporter',

        email:
          profile.email ||
          user.email ||
          '',

        relationship:
          profile.relationship || '',

        helpStyle:
          profile.helpStyle || '',

        notifications:
          Boolean(profile.notifications),

        role:
          profile.role || 'supporter',
      }
    }
  } catch {
    // Keep basic authentication details if profile lookup fails.
  }

  /*
   * Save supporter details into the connection.
   * The owner can now see these details BEFORE approving.
   */
  await updateDoc(connectionRef, {
    supporterUid: user.uid,

    supporterName:
      supporterProfile.name,

    supporterProfile,

    updatedAt: serverTimestamp(),
  })

  return {
    status: 'pending',
    connectionId: connectionRef.id,
  }
}

/* --------------------------------------------------------------------------
   Approve a SPECIFIC connection.
--------------------------------------------------------------------------- */

export async function approveConnection(
  connectionId,
) {
  const user = requireUser()

  if (!connectionId) {
    throw new Error(
      'Connection ID is required.',
    )
  }

  const connectionRef = doc(
    db,
    'connections',
    connectionId,
  )

  const connectionSnap =
    await getDoc(connectionRef)

  if (!connectionSnap.exists()) {
    throw new Error(
      'Connection not found.',
    )
  }

  const connection =
    connectionSnap.data()

  if (
    connection.ownerUid !== user.uid
  ) {
    throw new Error(
      'You are not allowed to approve this connection.',
    )
  }

  if (
    connection.status !== 'pending'
  ) {
    throw new Error(
      'This connection is no longer pending.',
    )
  }

  if (!connection.supporterUid) {
    throw new Error(
      'No supporter has joined this invitation yet.',
    )
  }

  await updateDoc(connectionRef, {
    status: 'active',
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (connection.inviteCode) {
    await updateDoc(
      doc(
        db,
        'inviteCodes',
        connection.inviteCode,
      ),
      {
        status: 'approved',
        approvedAt:
          serverTimestamp(),
      },
    ).catch(() => {})
  }

  await publishSharedProjection(
    user.uid,
  )

  return {
    ...connection,
    status: 'active',
  }
}

/* --------------------------------------------------------------------------
   Get ALL connections for the current user.
--------------------------------------------------------------------------- */

export async function getConnectionStatus() {
  const user = requireUser()

  try {
    const ownerSnap =
      await getDocs(
        query(
          collection(
            db,
            'connections',
          ),
          where(
            'ownerUid',
            '==',
            user.uid,
          ),
        ),
      )

    const supporterSnap =
      await getDocs(
        query(
          collection(
            db,
            'connections',
          ),
          where(
            'supporterUid',
            '==',
            user.uid,
          ),
        ),
      )

    const docsById = new Map()

    ownerSnap.docs.forEach((d) => {
      docsById.set(d.id, {
        id: d.id,
        ...d.data(),
      })
    })

    supporterSnap.docs.forEach((d) => {
      docsById.set(d.id, {
        id: d.id,
        ...d.data(),
      })
    })

    const connections =
      Array.from(
        docsById.values(),
      )

    /* Automatically mark expired invitations when viewed. */
    await Promise.all(
      connections.map(
        async (connection) => {
          if (
            connection.status !==
            'pending' ||
            !connection.inviteCode
          ) {
            return
          }

          const inviteSnap =
            await getDoc(
              doc(
                db,
                'inviteCodes',
                connection.inviteCode,
              ),
            ).catch(() => null)

          if (
            !inviteSnap?.exists()
          ) {
            return
          }

          const invite =
            inviteSnap.data()

          if (
            invite.status ===
              'pending' &&
            isInviteExpired(invite)
          ) {
            await updateDoc(
              inviteSnap.ref,
              {
                status: 'expired',
                expiredAt:
                  serverTimestamp(),
              },
            ).catch(() => {})

            await updateDoc(
              doc(
                db,
                'connections',
                connection.id,
              ),
              {
                status: 'expired',
                updatedAt:
                  serverTimestamp(),
              },
            ).catch(() => {})

            connection.status =
              'expired'
          }
        },
      ),
    )

    const validConnections =
      connections.filter(
        (connection) =>
          connection.status ===
            'active' ||
          connection.status ===
            'pending',
      )

    /* Add display details where missing. */
    await Promise.all(
      validConnections.map(
        async (connection) => {
          const isOwner =
            connection.ownerUid ===
            user.uid

          const otherUid = isOwner
            ? connection.supporterUid
            : connection.ownerUid

          if (
            connection.supporterProfile
              ?.name ||
            connection.connectedPersonName
          ) {
            if (
              !connection.connectedPersonName
            ) {
              connection.connectedPersonName =
                isOwner
                  ? connection.supporterProfile?.name ||
                    connection.supporterName ||
                    'Supporter'
                  : connection.ownerName ||
                    'Connection'
            }

            return
          }

          if (!otherUid) {
            connection.connectedPersonName =
              isOwner
                ? connection.supporterName ||
                  'Supporter'
                : connection.ownerName ||
                  'Connection'

            return
          }

          try {
            const otherSnap =
              await getDoc(
                doc(
                  db,
                  'users',
                  otherUid,
                ),
              )

            if (
              otherSnap.exists()
            ) {
              const otherProfile =
                otherSnap.data() ||
                {}

              if (isOwner) {
                connection.supporterProfile =
                  connection.supporterProfile ||
                  {
                    uid: otherUid,
                    name:
                      otherProfile.name ||
                      connection.supporterName ||
                      'Supporter',
                    email:
                      otherProfile.email ||
                      '',
                  }

                connection.supporterName =
                  connection.supporterName ||
                  otherProfile.name ||
                  'Supporter'

                connection.connectedPersonName =
                  connection.supporterName
              } else {
                connection.connectedPersonName =
                  connection.ownerName ||
                  otherProfile.name ||
                  'Connection'
              }
            }
          } catch {
            connection.connectedPersonName =
              isOwner
                ? connection.supporterName ||
                  'Supporter'
                : connection.ownerName ||
                  'Connection'
          }
        },
      ),
    )

    const activeConnections =
      validConnections.filter(
        (connection) =>
          connection.status ===
          'active',
      )

    const pendingConnections =
      validConnections.filter(
        (connection) =>
          connection.status ===
          'pending',
      )

    return {
      status:
        validConnections.length ===
        0
          ? 'none'
          : activeConnections.length >
            0
            ? 'connected'
            : 'pending',

      connections:
        validConnections,

      activeConnections,
      pendingConnections,

      /* Backward-compatible fields */
      ...(validConnections[0] || {}),
    }
  } catch (err) {
    if (
      err?.code ===
        'permission-denied' ||
      err?.message?.includes(
        'permission',
      )
    ) {
      return {
        status: 'none',
        connections: [],
        activeConnections: [],
        pendingConnections: [],
      }
    }

    throw err
  }
}

/* --------------------------------------------------------------------------
   Disconnect a SPECIFIC connection.
--------------------------------------------------------------------------- */

export async function disconnectSupporter(
  connectionId,
) {
  const user = requireUser()

  if (!connectionId) {
    throw new Error(
      'Connection ID is required.',
    )
  }

  const connectionRef = doc(
    db,
    'connections',
    connectionId,
  )

  const connectionSnap =
    await getDoc(connectionRef)

  if (!connectionSnap.exists()) {
    throw new Error(
      'Connection not found.',
    )
  }

  const connection =
    connectionSnap.data()

  if (
    connection.ownerUid !==
      user.uid &&
    connection.supporterUid !==
      user.uid
  ) {
    throw new Error(
      'You are not allowed to modify this connection.',
    )
  }

  await updateDoc(connectionRef, {
    status: 'revoked',
    revokedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (connection.inviteCode) {
    await updateDoc(
      doc(
        db,
        'inviteCodes',
        connection.inviteCode,
      ),
      {
        status:
          connection.status ===
          'pending'
            ? 'revoked'
            : connection.status ===
                'active'
              ? 'approved'
              : connection.status,
        updatedAt:
          serverTimestamp(),
      },
    ).catch(() => {})
  }

  if (connection.ownerUid === user.uid) {
    await publishSharedProjection(
      user.uid,
    )
  } else {
    try {
      await publishSharedProjection(
        connection.ownerUid,
      )
    } catch {
      // Ignore projection failure on supporter disconnect.
    }
  }

  return {
    ...connection,
    status: 'revoked',
  }
}

/* ==========================================================================
   SUPPORTER DATA
========================================================================== */

export async function getSupporterData() {
  const status =
    await getConnectionStatus()

  const activeConnection =
    (
      status.activeConnections ||
      []
    )[0]

  if (!activeConnection) {
    return {
      connection: status,
      connectedUserName:
        status.connectedPersonName ||
        'Connection',
      shared: null,
      permissions: {},
      suggestion:
        SUPPORT_SUGGESTIONS.noDataShared,
    }
  }

  const snapshot =
    await getDoc(
      doc(
        db,
        'connections',
        activeConnection.id,
        'shared',
        'currentStatus',
      ),
    )

  const shared =
    snapshot.exists()
      ? snapshot.data()
      : null

  const permissions =
  shared?.permissions ||
  activeConnection.sharing ||
  {}

  let suggestionKey = 'noDataShared'

  if (shared) {
    if (
      permissions.painLevel &&
      shared.painLevel != null &&
      Number(shared.painLevel) >= 3
    ) {
      suggestionKey = 'painReported'
    } else if (
      permissions.periodStatus &&
      shared.periodStatus === 'On period'
    ) {
      suggestionKey = 'periodActive'
    } else if (
      permissions.periodStatus &&
      shared.periodStatus === 'Not on period'
    ) {
      suggestionKey = 'periodNotActive'
    } else if (
      permissions.energy &&
      shared.energy
    ) {
      const energy =
        String(shared.energy).toLowerCase()

      if (
        energy === 'very low' ||
        energy === 'low'
      ) {
        suggestionKey = 'lowEnergyReported'
      }
    }
  }

  const fallbackSuggestions = {
  periodNotActive: {
    feeling:
      'Their period is not currently active.',

    help: [
      'Continue your usual support and check in with them regularly.',
      'Ask how they are feeling instead of trying to guess.',
      'Offer practical help with food, chores, or errands when appropriate.',
      'Respect their preferred level of space and privacy.',
      'Listen first if they want to talk about their day.',
      'Support healthy routines such as rest, hydration, and regular meals.',
    ],

    avoid: [
      'Assuming they are experiencing pain or menstrual symptoms.',
      'Assuming you know how they feel based on their cycle.',
      'Pressuring them to talk when they want privacy.',
      'Making assumptions about their health from normal mood or energy changes.',
      'Offering menstrual or medical advice when they have not asked for it.',
      'Sharing their private health information with others.',
    ],
  },
}

const suggestion =
  SUPPORT_SUGGESTIONS[suggestionKey] ||
  fallbackSuggestions[suggestionKey] ||
  SUPPORT_SUGGESTIONS.noDataShared

  return {
    connection:
      activeConnection,

    connectedUserName:
      activeConnection
        .connectedPersonName ||
      activeConnection.ownerName ||
      'your connection',

    shared,

    permissions:
      shared?.permissions ||
      activeConnection.sharing ||
      {},

    suggestion: {
      feeling:
        suggestion?.feeling ||
        'Their period is not currently active.',

      help:
        Array.isArray(suggestion?.help)
          ? suggestion.help
          : [],

      avoid:
        Array.isArray(suggestion?.avoid)
          ? suggestion.avoid
          : [],
    },
  }
}

/* ==========================================================================
   REPORTS
========================================================================== */

export async function getReportsData() {
  const cycleInfo =
    await getCycleData()

  const logs = Object.values(
    await getHealthLogs(),
  ).sort((a, b) =>
    b.date.localeCompare(a.date),
  )

  return {
    cycleInfo,
    history: cycleInfo.history,
    logs,
    painTrend: logs
      .slice()
      .reverse()
      .map((l) => ({
        date: l.date,
        pain: l.pain,
      })),
  }
}