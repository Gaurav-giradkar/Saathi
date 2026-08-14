import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseConfigured } from '../lib/firebase.js'
import * as api from '../data/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async (firebaseUser = auth?.currentUser) => {
    if (!firebaseUser) { setUser(null); setProfile(null); return null }
    const state = await api.getAuthState(firebaseUser.uid)
    setUser(firebaseUser); setProfile(state.profile || null); return state
  }
  useEffect(() => {
    if (!firebaseConfigured || !auth) { setLoading(false); return undefined }
    return onAuthStateChanged(auth, async (firebaseUser) => {
    try { await refreshProfile(firebaseUser) } finally { setLoading(false) }
    })
  }, [])
  const value = { user, profile, loading, refreshProfile, signIn: api.login, signUp: api.signup, signOut: api.logout, resetPassword: api.resetPassword }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context }
