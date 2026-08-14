import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function ProtectedRoute({ children, requireOnboarded = false, role }) {
  const { auth, authLoading } = useApp()

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-ink-400 text-sm">Loading…</div>
  }
  if (!auth.loggedIn) return <Navigate to="/login" replace />
  if (requireOnboarded && !auth.onboarded) {
    return <Navigate to={auth.accountType === 'supporter' ? '/supporter-setup' : '/user-setup'} replace />
  }
  if (role && auth.accountType !== role) return <Navigate to={auth.accountType === 'supporter' ? '/supporter/dashboard' : '/dashboard'} replace />
  return children
}
