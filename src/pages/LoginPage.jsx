import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Flower2 } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Card from '../components/common/Card.jsx'
import { login, resetPassword } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'
import { firebaseConfigured, firebaseConfigError } from '../lib/firebase.js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshAuth, showToast } = useApp()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      const auth = await refreshAuth()
      showToast('Welcome back!')
      if (!auth.accountType) navigate('/choose-account')
      else if (!auth.onboarded) navigate(auth.accountType === 'supporter' ? '/supporter-setup' : '/user-setup')
      else navigate(auth.accountType === 'supporter' ? '/supporter/dashboard' : '/dashboard')
    } catch (error) { showToast(error.message, 'error') } finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (!email) return showToast('Enter your email first, then select password reset.', 'info')
    try { await resetPassword(email); showToast('Password reset email sent.') } catch (error) { showToast(error.message, 'error') }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md animate-fadeIn">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center">
            <Flower2 size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-ink-900">Saathi</span>
        </Link>
        <Card className="!p-8">
          <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1.5 text-center">Welcome back</h1>
          <p className="text-sm text-ink-500 text-center mb-7">Log in to see today's insights</p>
          {!firebaseConfigured && <p role="alert" className="mb-5 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-600">{firebaseConfigError}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end -mt-1">
              <button type="button" onClick={handleReset} className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                Forgot password?
              </button>
            </div>
            <Button type="submit" size="lg" fullWidth disabled={loading || !firebaseConfigured}>
              {loading ? 'Logging in…' : 'Log In'}
            </Button>
          </form>
          <p className="text-sm text-ink-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-rose-600 hover:text-rose-700">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
