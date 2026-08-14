import React from 'react'

export default function HealthMetricCard({ icon: Icon, label, value, accent = 'rose', onClick, active = false }) {
  const accents = {
    rose: 'text-rose-500 bg-rose-50',
    teal: 'text-teal-600 bg-teal-50',
    amber: 'text-amber-600 bg-amber-50',
    plum: 'text-plum-500 bg-plum-50',
  }
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 flex-1 min-w-[84px] transition-all duration-150',
        active ? 'border-rose-300 bg-rose-50/60 shadow-soft' : 'border-ink-100 bg-white hover:border-ink-200',
        onClick ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${accents[accent]}`}>
        <Icon size={17} strokeWidth={2} />
      </div>
      <span className="text-[11px] font-medium text-ink-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </button>
  )
}
