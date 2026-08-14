import React from 'react'
import { Sparkles, TrendingUp, CalendarClock, AlertCircle } from 'lucide-react'
import Card from './Card.jsx'

const TYPE_META = {
  pattern: { icon: Sparkles, color: 'text-plum-500 bg-plum-50', tag: 'Pattern' },
  trend: { icon: TrendingUp, color: 'text-teal-600 bg-teal-50', tag: 'Trend' },
  prediction: { icon: CalendarClock, color: 'text-rose-500 bg-rose-50', tag: 'Prediction' },
  alert: { icon: AlertCircle, color: 'text-amber-600 bg-amber-50', tag: 'Alert' },
}

export default function InsightCard({ type = 'pattern', title, body }) {
  const meta = TYPE_META[type] || TYPE_META.pattern
  const Icon = meta.icon
  return (
    <Card hover className="flex gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.color.split(' ')[0]}`}>{meta.tag}</span>
        <h4 className="font-display font-semibold text-ink-900 text-sm mt-0.5">{title}</h4>
        <p className="text-sm text-ink-500 mt-1 leading-relaxed">{body}</p>
      </div>
    </Card>
  )
}
