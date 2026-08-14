import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Flower2 } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Card from '../components/common/Card.jsx'
import { signup } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'
import { firebaseConfigured, firebaseConfigError } from '../lib/firebase.js'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshAuth, showToast } = useApp()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await signup({ name, email, password }); await refreshAuth(); showToast('Account created'); navigate('/choose-account') }
    catch (error) { showToast(error.message, 'error') } finally { setLoading(false) }
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
          <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1.5 text-center">Create your account</h1>
          <p className="text-sm text-ink-500 text-center mb-7">Two minutes, then you're set up</p>
          {!firebaseConfigured && <p role="alert" className="mb-5 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-600">{firebaseConfigError}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              icon={User}
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="At least 6 characters"
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" size="lg" fullWidth disabled={loading || !firebaseConfigured}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>
          <p className="text-sm text-ink-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
