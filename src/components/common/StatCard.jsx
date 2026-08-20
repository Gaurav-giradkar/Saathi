import React from 'react'
import Card from './Card.jsx'

export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent = 'rose',
}) {
  const accents = {
    rose: 'bg-phase-menstrual-light text-phase-menstrual',
    teal: 'bg-phase-follicular-light text-phase-follicular',
    amber: 'bg-phase-ovulation-light text-phase-ovulation',
    plum: 'bg-phase-luteal-light text-phase-luteal',
  }

  return (
    <Card className="flex items-center gap-4 bg-white/95 rounded-2xl border border-ink-100/70 shadow-soft p-5">
      {Icon && (
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accents[accent]}`}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">
          {label}
        </p>

        <p className="text-2xl font-display font-bold text-ink-900 leading-tight truncate mt-0.5">
          {value}
        </p>

        {sublabel && (
          <p className="text-xs text-ink-500 mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
    </Card>
  )
}