import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, HeartPulse, Sparkles, Users2, ArrowRight } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import { useApp } from '../context/AppContext.jsx'

const ITEMS = [
  { icon: CalendarClock, text: 'Track your cycle' },
  { icon: HeartPulse, text: 'Understand your body' },
  { icon: Sparkles, text: 'Get personalized insights' },
  { icon: Users2, text: 'Connect with your loved ones' },
]

export default function QuickOverview() {
  const navigate = useNavigate()
  const { auth } = useApp()

  const handleContinue = () => {
    navigate(auth.accountType === 'supporter' ? '/supporter-setup' : '/user-setup')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg text-center animate-fadeIn">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full mb-5">
          Quick overview
        </span>
        <h1 className="font-display text-3xl font-semibold text-ink-900 mb-8">Here's what you can do</h1>
        <div className="flex flex-col gap-3 mb-10 text-left">
          {ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-surface border border-ink-100 rounded-2xl px-5 py-4 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <item.icon size={19} className="text-rose-500" />
              </div>
              <span className="font-medium text-ink-800">{item.text}</span>
            </div>
          ))}
        </div>
        <Button size="lg" icon={ArrowRight} iconPosition="right" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
