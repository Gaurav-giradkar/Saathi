import {
  createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp,
  setDoc, updateDoc, where,
} from 'firebase/firestore'
import { auth, db, firebaseConfigured, firebaseConfigError } from '../lib/firebase.js'
import {
  PHASES, INSIGHT_TEMPLATES, WELLNESS_CATEGORIES, SUPPORT_SUGGESTIONS,
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
export async function saveHealthLog(date, entry) { const user = requireUser(); const data = { ...entry, date, updatedAt: serverTimestamp() }; await setDoc(doc(db, 'users', user.uid, 'healthEntries', date), data, { merge: true }); await publishSharedProjection(user.uid); return { ...entry, date } }
export async function getInsights() { const cycle = await getCycleData(); return { insights: INSIGHT_TEMPLATES.map((item, id) => ({ id, ...item })), painTrend: [], cycleInfo: cycle } }
export async function getRecommendations() { const cycle = await getCycleData(); return { phaseKey: cycle.phaseKey, categories: WELLNESS_CATEGORIES } }

export async function getSharingPermissions() { const data = await getUserData(); return data.sharingPermissions || SHARING_CATEGORIES.reduce((all, item) => ({ ...all, [item.key]: item.defaultOn ?? false }), {}) }
export async function updateSharingPermissions(key, value) { const user = requireUser(); const permissions = await getSharingPermissions(); permissions[key] = value; await setDoc(doc(db, 'users', user.uid), { sharingPermissions: permissions, updatedAt: serverTimestamp() }, { merge: true }); await publishSharedProjection(user.uid); return permissions }

const inviteCode = () => crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(-6).toUpperCase()
export async function generateInviteCode() { const user = requireUser(); const code = inviteCode(); const connection = doc(collection(db, 'connections')); await setDoc(connection, { ownerUid: user.uid, status: 'pending', inviteCode: code, sharing: await getSharingPermissions(), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }); return code }
export async function submitInviteCode(code) { const user = requireUser(); const result = await getDocs(query(collection(db, 'connections'), where('inviteCode', '==', code), where('status', '==', 'pending'), limit(1))); if (result.empty) throw new Error('That invitation is invalid or has expired.'); await updateDoc(result.docs[0].ref, { supporterUid: user.uid, updatedAt: serverTimestamp() }); return { status: 'pending' } }
export async function approveConnection() { const user = requireUser(); const result = await getDocs(query(collection(db, 'connections'), where('ownerUid', '==', user.uid), where('status', '==', 'pending'), limit(1))); if (result.empty) throw new Error('No pending connection request was found.'); await updateDoc(result.docs[0].ref, { status: 'active', approvedAt: serverTimestamp(), updatedAt: serverTimestamp() }); await publishSharedProjection(user.uid); return result.docs[0].data() }
export async function getConnectionStatus() { const user = requireUser(); const result = await getDocs(query(collection(db, 'connections'), where('ownerUid', '==', user.uid), limit(1))); const supporter = await getDocs(query(collection(db, 'connections'), where('supporterUid', '==', user.uid), limit(1))); const item = result.docs[0] || supporter.docs[0]; if (!item) return { status: 'none' }; const data = item.data(); const otherId = data.ownerUid === user.uid ? data.supporterUid : data.ownerUid; let connectedPersonName = ''; if (otherId) { const p = await getDoc(doc(db, 'users', otherId)); connectedPersonName = p.data()?.name || 'your connection' } return { ...data, status: data.status === 'active' ? 'connected' : 'pending', connectedPersonName, id: item.id } }
export async function disconnectSupporter() { const user = requireUser(); const status = await getConnectionStatus(); if (status.id && status.ownerUid === user.uid) await updateDoc(doc(db, 'connections', status.id), { status: 'revoked', revokedAt: serverTimestamp(), updatedAt: serverTimestamp() }) }
export async function getSupporterData() { const connection = await getConnectionStatus(); if (connection.status !== 'connected') return { connection, shared: null, permissions: {} }; const snapshot = await getDoc(doc(db, 'connections', connection.id, 'shared', 'currentStatus')); return { connection, connectedUserName: connection.connectedPersonName, shared: snapshot.exists() ? snapshot.data() : null, permissions: connection.sharing || {}, suggestion: SUPPORT_SUGGESTIONS.follicular } }
export async function getReportsData() { const cycleInfo = await getCycleData(); const logs = Object.values(await getHealthLogs()).sort((a,b) => b.date.localeCompare(a.date)); return { cycleInfo, history: cycleInfo.history, logs, painTrend: logs.slice().reverse().map((l) => ({ date: l.date, pain: l.pain })) } }
