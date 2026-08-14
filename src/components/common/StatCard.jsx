import React from 'react'
import Card from './Card.jsx'

export default function StatCard({ icon: Icon, label, value, sublabel, accent = 'rose' }) {
  const accents = {
    rose: 'bg-rose-50 text-rose-500',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    plum: 'bg-plum-50 text-plum-500',
  }
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-display font-semibold text-ink-900 leading-tight truncate">{value}</p>
        {sublabel && <p className="text-xs text-ink-500 mt-0.5">{sublabel}</p>}
      </div>
    </Card>
  )
}
