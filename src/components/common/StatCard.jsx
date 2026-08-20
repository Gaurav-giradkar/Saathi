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
    <Card className="flex items-center gap-4">
      {Icon && (
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-xs font-bold text-ink-500 uppercase tracking-wide">
          {label}
        </p>

        <p className="text-xl font-display font-semibold text-ink-900 leading-tight truncate">
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