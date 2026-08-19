import {
  createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp,
  setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore'
import { auth, db, firebaseConfigured, firebaseConfigError } from '../lib/firebase.js'
import {
  PHASES, INSIGHT_TEMPLATES, WELLNESS_CATEGORIES, SUPPORT_SUGGESTIONS, SYMPTOM_OPTIONS,
  SHARING_CATEGORIES, getPhaseForDay,
} from './mockData.js'

const todayISO = () => new Date().toISOString().slice(0, 10)
const requireFirebase = () => {
  if (!firebaseConfigured || !auth || !db) throw new Error(firebaseConfigError)
}
const requireUser = () => {
  requireFirebase()
  if (!auth.currentUser) throw new Error('Please sign in to continue.')
  return auth.currentUser
}
const normaliseError = (error) => {
  const code = error?.code || ''
  if (code.includes('invalid-email')) return 'Enter a valid email address.'
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) return 'Email or password is incorrect.'
  if (code.includes('email-already-in-use')) return 'An account already exists for this email.'
  if (code.includes('weak-password')) return 'Use a password with at least 6 characters.'
  if (code.includes('network')) return 'Unable to connect. Check your internet connection and try again.'
  return error?.message || 'Something went wrong. Please try again.'
}

async function publishSharedProjection(ownerUid) {
  const owner = (await getDoc(doc(db, 'users', ownerUid))).data() || {}
  const permissions = owner.sharingPermissions || {}
  const cycle = computeCycleInfo(owner.cycleSetup)
  const health = await getHealthData().catch(() => null)
  const connections = await getDocs(query(collection(db, 'connections'), where('ownerUid', '==', ownerUid), where('status', '==', 'active')))
  const shared = {
    cyclePhase: permissions.cyclePhase ? cycle.phase.label : null,
    periodStatus: permissions.periodStatus ? (cycle.isOnPeriod ? 'On period' : 'Not on period') : null,
    expectedPeriod: permissions.expectedPeriod ? cycle.nextPeriodDate : null,
    painLevel: permissions.painLevel ? (health?.pain ?? null) : null,
    symptoms: permissions.symptoms ? (health?.symptoms || []) : [],
    mood: permissions.mood ? (health?.mood ?? null) : null,
    energy: permissions.energy ? (health?.energy ?? null) : null,
    sleep: permissions.sleep ? (health?.sleep ?? null) : null,
    updatedAt: serverTimestamp(),
  }
  await Promise.all(connections.docs.map((connection) => setDoc(doc(db, 'connections', connection.id, 'shared', 'currentStatus'), shared)))
}

export function computeCycleInfo(cycleSetup = {}) {
  const cycleLength = Number(cycleSetup.cycleLength || 28)
  const periodLength = Number(cycleSetup.periodLength || 5)
  const lastPeriodStart = cycleSetup.lastPeriodStart || todayISO()
  const start = new Date(`${lastPeriodStart}T00:00:00`)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  let cycleDay = (Math.floor((now - start) / 86400000) % cycleLength) + 1
  if (cycleDay <= 0) cycleDay += cycleLength
  const phaseKey = getPhaseForDay(cycleDay, cycleLength, periodLength)
  const next = new Date(now); next.setDate(next.getDate() + cycleLength - cycleDay + 1)
  return { cycleDay, cycleLength, periodLength, phaseKey, phase: PHASES[phaseKey], isOnPeriod: cycleDay <= periodLength,
    daysUntilNextPeriod: cycleLength - cycleDay + 1, nextPeriodDate: next.toISOString().slice(0, 10), ovulationDay: cycleLength - 14 }
}

export async function login({ email, password }) {
  try { requireFirebase(); return await signInWithEmailAndPassword(auth, email.trim(), password) } catch (error) { throw new Error(error.message === firebaseConfigError ? error.message : normaliseError(error)) }
}
export async function signup({ name, email, password }) {
  try {
    requireFirebase()
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
    // Ensure Firestore receives the new account's authentication token for the
    // profile write immediately following account creation.
    await credential.user.getIdToken()
    await setDoc(doc(db, 'users', credential.user.uid), { uid: credential.user.uid, name: name.trim(), email: credential.user.email, role: null, onboardingComplete: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    return credential
  } catch (error) { throw new Error(normaliseError(error)) }
}
export async function logout() { requireFirebase(); await firebaseSignOut(auth) }
export async function resetPassword(email) { try { requireFirebase(); await sendPasswordResetEmail(auth, email.trim()) } catch (error) { throw new Error(error.message === firebaseConfigError ? error.message : normaliseError(error)) } }

export async function getAuthState(uid = auth?.currentUser?.uid) {
  if (!uid) return { loggedIn: false, accountType: null, onboarded: false }
  const snapshot = await getDoc(doc(db, 'users', uid))
  const profile = snapshot.exists() ? snapshot.data() : {}
  return { loggedIn: true, accountType: profile.role || null, onboarded: Boolean(profile.onboardingComplete), profile }
}
export async function setAccountType(role) {
  const user = requireUser()
  await setDoc(doc(db, 'users', user.uid), { uid: user.uid, email: user.email, role, updatedAt: serverTimestamp() }, { merge: true })
}
export async function saveUserSetup({ profile, cycle }) {
  const user = requireUser()
  const setup = { ...cycle, periodLength: Number(cycle.periodLength), cycleLength: Number(cycle.cycleLength) }
  const sharingPermissions = SHARING_CATEGORIES.reduce((all, item) => ({ ...all, [item.key]: item.defaultOn ?? false }), {})
  await setDoc(doc(db, 'users', user.uid), { ...profile, uid: user.uid, email: user.email, role: 'user', cycleSetup: setup, sharingPermissions, onboardingComplete: true, updatedAt: serverTimestamp() }, { merge: true })
  await setDoc(doc(db, 'users', user.uid, 'cycles', setup.lastPeriodStart), { startDate: setup.lastPeriodStart, cycleLength: setup.cycleLength, periodLength: setup.periodLength, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true })
}
export async function saveSupporterSetup(data) {
  const user = requireUser()
  await setDoc(doc(db, 'users', user.uid), { ...data, uid: user.uid, email: user.email, role: 'supporter', onboardingComplete: true, updatedAt: serverTimestamp() }, { merge: true })
}
export async function getUserData() {
  const user = requireUser(); const snap = await getDoc(doc(db, 'users', user.uid)); const profile = snap.data() || {}
  return { ...profile, cycleInfo: computeCycleInfo(profile.cycleSetup) }
}
export async function getCycleData() {
  const user = requireUser(); const profile = (await getDoc(doc(db, 'users', user.uid))).data() || {}
  const cycles = await getDocs(collection(db, 'users', user.uid, 'cycles'))
  const history = cycles.docs.map((d) => { const c = d.data(); return { month: c.startDate?.slice(0, 7) || d.id, length: Number(c.cycleLength || 28) } }).sort((a,b) => a.month.localeCompare(b.month))
  return { ...(profile.cycleSetup || {}), ...computeCycleInfo(profile.cycleSetup), history }
}
export async function updateCycleSetup(partial) {
  const user = requireUser(); const profile = (await getDoc(doc(db, 'users', user.uid))).data() || {}; const cycleSetup = { ...(profile.cycleSetup || {}), ...partial }
  await setDoc(doc(db, 'users', user.uid), { cycleSetup, updatedAt: serverTimestamp() }, { merge: true }); await publishSharedProjection(user.uid); return cycleSetup
}
export async function getHealthLogs() {
  const user = requireUser(); const snapshots = await getDocs(collection(db, 'users', user.uid, 'healthEntries'))
  return Object.fromEntries(snapshots.docs.map((entry) => [entry.id, entry.data()]))
}
export async function getHealthData(date = todayISO()) { const user = requireUser(); const snapshot = await getDoc(doc(db, 'users', user.uid, 'healthEntries', date)); return snapshot.exists() ? snapshot.data() : null }
export async function getCustomSymptoms() {
  const user = requireUser()
  const snapshot = await getDoc(doc(db, 'users', user.uid))
  return Array.isArray(snapshot.data()?.customSymptoms) ? snapshot.data().customSymptoms : []
}
export async function addCustomSymptom(name) {
  const user = requireUser()
  const symptom = String(name || '').trim().replace(/\s+/g, ' ')
  if (!symptom) throw new Error('Enter a symptom name.')
  if (symptom.length > 120) throw new Error('Keep a custom symptom to 120 characters or fewer.')
  const profileRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(profileRef)
  const customSymptoms = Array.isArray(snapshot.data()?.customSymptoms) ? snapshot.data().customSymptoms : []
  const knownSymptoms = [...SYMPTOM_OPTIONS, ...customSymptoms]
  const existing = knownSymptoms.find((item) => item.toLowerCase() === symptom.toLowerCase())
  if (existing) return { symptom: existing, customSymptoms, added: false }
  const next = [...customSymptoms, symptom]
  await setDoc(profileRef, { customSymptoms: next, updatedAt: serverTimestamp() }, { merge: true })
  return { symptom, customSymptoms: next, added: true }
}
function normaliseHealthEntry(entry) {
  const customTextFields = ['otherSymptom', 'otherPainLocation', 'otherPainType', 'otherExercise', 'otherMeal', 'otherCraving', 'otherProtection', 'otherProduct', 'otherRelief']
  return customTextFields.reduce((data, field) => ({ ...data, [field]: String(data[field] || '').trim().replace(/\s+/g, ' ') }), { ...entry })
}
function validateHealthEntry(entry) {
  const numberInRange = (value, min, max, label) => {
    if (value == null || value === '') return
    const number = Number(value)
    if (!Number.isFinite(number) || number < min || number > max) throw new Error(`${label} must be between ${min} and ${max}.`)
  }
  numberInRange(entry.pain, 0, 10, 'Pain level')
  numberInRange(entry.sleep, 0, 24, 'Sleep duration')
  numberInRange(entry.waterLiters, 0, 10, 'Water intake')
  numberInRange(entry.exerciseMinutes, 0, 1440, 'Exercise duration')
  const requiredOtherText = [
    ['exerciseActivities', 'Other', 'otherExercise', 'Enter the other exercise.'],
    ['meals', 'Other', 'otherMeal', 'Enter the other meal or food.'],
    ['cravings', 'Other', 'otherCraving', 'Enter the other craving.'],
    ['protectionUsed', 'Other', 'otherProtection', 'Enter the other protection used.'],
    ['productOptions', 'Other', 'otherProduct', 'Enter the other product used.'],
    ['relief', 'Other', 'otherRelief', 'Enter the other relief used.'],
  ]
  requiredOtherText.forEach(([selectionField, otherOption, textField, message]) => {
    if (Array.isArray(entry[selectionField]) && entry[selectionField].includes(otherOption) && !entry[textField]) throw new Error(message)
  })
}
export async function saveHealthLog(date, entry) { const normalisedEntry = normaliseHealthEntry(entry); validateHealthEntry(normalisedEntry); const user = requireUser(); const data = { ...normalisedEntry, date, updatedAt: serverTimestamp() }; await setDoc(doc(db, 'users', user.uid, 'healthEntries', date), data, { merge: true }); await publishSharedProjection(user.uid); return { ...normalisedEntry, date } }
export async function getInsights() { const cycle = await getCycleData(); return { insights: INSIGHT_TEMPLATES.map((item, id) => ({ id, ...item })), painTrend: [], cycleInfo: cycle } }
export async function getRecommendations() { const cycle = await getCycleData(); return { phaseKey: cycle.phaseKey, categories: WELLNESS_CATEGORIES } }

export async function getSharingPermissions() { const data = await getUserData(); return data.sharingPermissions || SHARING_CATEGORIES.reduce((all, item) => ({ ...all, [item.key]: item.defaultOn ?? false }), {}) }
export async function updateSharingPermissions(key, value) { const user = requireUser(); const permissions = await getSharingPermissions(); permissions[key] = value; await setDoc(doc(db, 'users', user.uid), { sharingPermissions: permissions, updatedAt: serverTimestamp() }, { merge: true }); await publishSharedProjection(user.uid); return permissions }

const inviteCode = () => crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(-6).toUpperCase()
export async function generateInviteCode() {
  const user = requireUser()

  const code = inviteCode()

  const connectionRef = doc(collection(db, 'connections'))
  const inviteRef = doc(db, 'inviteCodes', code)

  const batch = writeBatch(db)

  batch.set(connectionRef, {
    ownerUid: user.uid,
    supporterUid: null,
    status: 'pending',
    inviteCode: code,
    sharing: await getSharingPermissions(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  batch.set(inviteRef, {
    connectionId: connectionRef.id,
    status: 'pending',
    createdAt: serverTimestamp(),
  })

  await batch.commit()

  return code
}
export async function submitInviteCode(code) {
  const user = requireUser()

  const normalizedCode = String(code || '').trim().toUpperCase()

  if (!normalizedCode) {
    throw new Error('Enter an invitation code.')
  }

  const inviteRef = doc(db, 'inviteCodes', normalizedCode)
  const inviteSnap = await getDoc(inviteRef)

  if (!inviteSnap.exists()) {
    throw new Error('That invitation is invalid or has expired.')
  }

  const invite = inviteSnap.data()

  if (invite.status !== 'pending') {
    throw new Error('That invitation is no longer active.')
  }

  const connectionRef = doc(db, 'connections', invite.connectionId)
  const connectionSnap = await getDoc(connectionRef)

  if (!connectionSnap.exists()) {
    throw new Error('The connection could not be found.')
  }

  const connection = connectionSnap.data()

  if (connection.status !== 'pending') {
    throw new Error('That invitation is no longer active.')
  }

  if (connection.supporterUid) {
    throw new Error('This invitation has already been used.')
  }

  await updateDoc(connectionRef, {
    supporterUid: user.uid,
    updatedAt: serverTimestamp(),
  })

  return {
    status: 'pending',
    connectionId: connectionRef.id,
  }
}
export async function approveConnection() { const user = requireUser(); const result = await getDocs(query(collection(db, 'connections'), where('ownerUid', '==', user.uid), where('status', '==', 'pending'), limit(1))); if (result.empty) throw new Error('No pending connection request was found.'); await updateDoc(result.docs[0].ref, { status: 'active', approvedAt: serverTimestamp(), updatedAt: serverTimestamp() }); await publishSharedProjection(user.uid); return result.docs[0].data() }
export async function getConnectionStatus() {
  const user = requireUser()
  try {
    const result = await getDocs(query(collection(db, 'connections'), where('ownerUid', '==', user.uid), limit(1)))
    const supporter = await getDocs(query(collection(db, 'connections'), where('supporterUid', '==', user.uid), limit(1)))
    const item = result.docs[0] || supporter.docs[0]
    if (!item) return { status: 'none' }
    const data = item.data()
    // Revoked or unknown status → treat as not connected
    if (!data.status || data.status === 'revoked') return { status: 'none' }
    const otherId = data.ownerUid === user.uid ? data.supporterUid : data.ownerUid
    let connectedPersonName = ''
    if (otherId) { const p = await getDoc(doc(db, 'users', otherId)); connectedPersonName = p.data()?.name || 'your connection' }
    return { ...data, status: data.status === 'active' ? 'connected' : 'pending', connectedPersonName, id: item.id }
  } catch (err) {
    // Permission-denied errors happen when Firestore rules block collection queries.
    // Return 'none' so UI shows the connect flow rather than a hard error.
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      return { status: 'none' }
    }
    throw err
  }
}

export async function disconnectSupporter() { const user = requireUser(); const status = await getConnectionStatus(); if (status.id && status.ownerUid === user.uid) await updateDoc(doc(db, 'connections', status.id), { status: 'revoked', revokedAt: serverTimestamp(), updatedAt: serverTimestamp() }) }
export async function getSupporterData() {
  const connection = await getConnectionStatus()
  if (connection.status !== 'connected') return { connection, shared: null, permissions: {} }
  const snapshot = await getDoc(doc(db, 'connections', connection.id, 'shared', 'currentStatus'))
  const shared = snapshot.exists() ? snapshot.data() : null
  // Pick the most relevant support suggestion based on what is shared
  let suggestionKey = 'noDataShared'
  if (shared) {
    if (shared.painLevel && Number(shared.painLevel) >= 3) suggestionKey = 'painReported'
    else if (shared.periodStatus && shared.periodStatus.toLowerCase().includes('on period')) suggestionKey = 'periodActive'
    else if (shared.energy && Number(shared.energy) <= 3) suggestionKey = 'lowEnergyReported'
    else if (shared.cyclePhase || shared.expectedPeriod || shared.mood) suggestionKey = 'noDataShared'
  }
  return {
    connection,
    connectedUserName: connection.connectedPersonName,
    shared,
    permissions: connection.sharing || {},
    suggestion: SUPPORT_SUGGESTIONS[suggestionKey] || SUPPORT_SUGGESTIONS.noDataShared,
  }
}
export async function getReportsData() { const cycleInfo = await getCycleData(); const logs = Object.values(await getHealthLogs()).sort((a,b) => b.date.localeCompare(a.date)); return { cycleInfo, history: cycleInfo.history, logs, painTrend: logs.slice().reverse().map((l) => ({ date: l.date, pain: l.pain })) } }
