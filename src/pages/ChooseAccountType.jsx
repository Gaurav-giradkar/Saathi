import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, Users, ArrowRight } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import { setAccountType } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'

const OPTIONS = [
  {
    key: 'user',
    icon: HeartPulse,
    title: 'Menstrual Health User',
    body: 'Track your cycle, log symptoms, and get personalized AI insights and recommendations.',
    accent: 'rose',
  },
  {
    key: 'supporter',
    icon: Users,
    title: 'Supporter',
    body: 'Connect with someone you care about and get guidance on how to support them, day to day.',
    accent: 'teal',
  },
]

export default function ChooseAccountType() {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshAuth } = useApp()

  const handleContinue = async () => {
    if (!selected) return
    setLoading(true)
    await setAccountType(selected)
    await refreshAuth()
    setLoading(false)
    navigate('/overview')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl animate-fadeIn">
        <div className="text-center mb-9">
          <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">I want to join as</h1>
          <p className="text-ink-500">You can always add a connection from either side.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {OPTIONS.map((opt) => {
            const isActive = selected === opt.key
            const ring = opt.accent === 'rose' ? 'ring-rose-400 border-rose-300' : 'ring-teal-400 border-teal-300'
            const iconBg = opt.accent === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-teal-50 text-teal-600'
            return (
              <Card
                key={opt.key}
                as="button"
                onClick={() => setSelected(opt.key)}
                className={`text-left transition-all duration-150 ${isActive ? `ring-2 ${ring}` : 'hover:shadow-lift'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
                  <opt.icon size={22} strokeWidth={2} />
                </div>
                <h3 className="font-display font-semibold text-ink-900 text-lg mb-1.5">{opt.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{opt.body}</p>
              </Card>
            )
          })}
        </div>
        <div className="flex justify-center">
          <Button size="lg" icon={ArrowRight} iconPosition="right" disabled={!selected || loading} onClick={handleContinue}>
            {loading ? 'Continuing…' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
