import React from 'react'
import { PHASES } from '../../data/mockData.js'

export default function PhaseBadge({ phaseKey, size = 'md' }) {
  const phase = PHASES[phaseKey] || PHASES.follicular
  const sizes = { sm: 'text-xs px-2.5 py-1', md: 'text-sm px-3 py-1.5' }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizes[size]}`}
      style={{ backgroundColor: phase.bg, color: phase.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: phase.color }} />
      {phase.label}
    </span>
  )
}
