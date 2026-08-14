import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const AppContext = createContext(null)

let toastId = 0

export function AppProvider({ children }) {
  const { user, profile, loading, refreshProfile } = useAuth()
  const auth = { loggedIn: Boolean(user), accountType: profile?.role || null, onboarded: Boolean(profile?.onboardingComplete) }
  const [toasts, setToasts] = useState([])

  const refreshAuth = useCallback(async () => {
    const state = await refreshProfile()
    return state || { loggedIn: false, accountType: null, onboarded: false }
  }, [refreshProfile])

  const showToast = useCallback((message, variant = 'success') => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{ auth, authLoading: loading, refreshAuth, showToast, toasts, dismissToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
