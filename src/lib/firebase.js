import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Client configuration only. Never add an Admin SDK key to this application.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
export const firebaseConfigured = requiredKeys.every((key) => Boolean(config[key]))
export const firebaseConfigError = 'Firebase is not configured. Copy .env.example to .env.local, add your Firebase web app values, then restart Vite.'

// Keep public pages available when a local Firebase project has not been configured yet.
export const firebaseApp = firebaseConfigured ? (getApps().length ? getApps()[0] : initializeApp(config)) : null
export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const db = firebaseApp ? getFirestore(firebaseApp) : null
