import React, { useEffect, useState } from 'react'
import { Book, Heart, HandHeart, ShieldAlert, Lightbulb, PhoneCall } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import { getSupporterData } from '../data/api.js'
import { PHASES } from '../data/mockData.js'

const TIPS = [
  'Small, consistent gestures matter more than one big one — a check-in text often helps more than advice.',
  'Ask "what would help right now" rather than assuming — needs change cycle to cycle.',
  'Learning the four phases yourself means you\'ll notice patterns without needing to be told.',
]

export default function SupporterGuidance() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getSupporterData().then(setData)
  }, [])

  if (!data) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  const phaseKey = Object.keys(PHASES).find((k) => PHASES[k].label === data.shared.cyclePhase) || 'follicular'

  return (
    <div className="flex flex-col gap-6 animate-fadeIn max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Supporter guidance</h1>
          <p className="text-ink-500 text-sm mt-1">Tailored to {data.connectedUserName}'s current phase</p>
        </div>
        <PhaseBadge phaseKey={phaseKey} />
      </div>

      <Card className="flex items-start gap-3">
        <Book size={20} className="text-plum-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">Understand the phase</p>
          <p className="text-sm text-ink-700 leading-relaxed">{PHASES[phaseKey].desc}</p>
        </div>
      </Card>

      <Card className="flex items-start gap-3">
        <Heart size={20} className="text-rose-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">What she may feel</p>
          <p className="text-sm text-ink-700 leading-relaxed">{data.suggestion.feeling}</p>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-5">
        <Card className="bg-teal-50/60 border-teal-100">
          <div className="flex items-center gap-2 mb-3">
            <HandHeart size={18} className="text-teal-600" />
            <h3 className="font-display font-semibold text-ink-900">How you can help</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {data.suggestion.help.map((h, i) => (
              <li key={i} className="text-sm text-ink-700 flex gap-2"><span className="text-teal-500">•</span>{h}</li>
            ))}
          </ul>
        </Card>
        <Card className="bg-rose-50/60 border-rose-100">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={18} className="text-rose-500" />
            <h3 className="font-display font-semibold text-ink-900">Things to avoid</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {data.suggestion.avoid.map((a, i) => (
              <li key={i} className="text-sm text-ink-700 flex gap-2"><span className="text-rose-400">•</span>{a}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-amber-500" />
          <h3 className="font-display font-semibold text-ink-900">Tips & advice</h3>
        </div>
        <ul className="flex flex-col gap-2.5">
          {TIPS.map((t, i) => (
            <li key={i} className="text-sm text-ink-700 leading-relaxed flex gap-2"><span className="text-amber-500">•</span>{t}</li>
          ))}
        </ul>
      </Card>

      <Card className="flex items-start gap-3 bg-plum-50/60 border-plum-100">
        <PhoneCall size={18} className="text-plum-500 mt-0.5 shrink-0" />
        <p className="text-sm text-plum-700 leading-relaxed">
          If pain or symptoms ever seem severe or unusual, gently encourage a visit to a doctor — this platform
          doesn't diagnose medical conditions.
        </p>
      </Card>
    </div>
  )
}
