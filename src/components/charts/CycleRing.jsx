import React from 'react'
import { PHASES } from '../../data/mockData.js'

// Signature visual: a ring that maps the full cycle length around its
// circumference, colored by phase, with a marker for "today". This replaces
// a generic progress bar with something that actually encodes cycle shape.
export default function CycleRing({ cycleDay, cycleLength, periodLength, phaseKey, size = 200 }) {
  const strokeWidth = size * 0.09
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  const ovulationDay = cycleLength - 14
  const segments = []
  for (let d = 1; d <= cycleLength; d++) {
    let key = 'follicular'
    if (d <= periodLength) key = 'menstrual'
    else if (d >= ovulationDay - 1 && d <= ovulationDay + 1) key = 'ovulation'
    else if (d > ovulationDay + 1) key = 'luteal'
    segments.push(key)
  }

  const anglePerDay = 360 / cycleLength
  const markerAngle = (cycleDay - 0.5) * anglePerDay - 90
  const markerRad = (markerAngle * Math.PI) / 180
  const markerX = center + radius * Math.cos(markerRad)
  const markerY = center + radius * Math.sin(markerRad)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#F3EAEC" strokeWidth={strokeWidth} />
        {segments.map((key, i) => {
          const dash = circumference / cycleLength
          const gap = circumference - dash
          const offset = -i * dash
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={PHASES[key].color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash * 0.86} ${gap + dash * 0.14}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      {/* today marker */}
      <div
        className="absolute w-3.5 h-3.5 rounded-full bg-white border-[3px] shadow-md"
        style={{
          left: markerX - 7,
          top: markerY - 7,
          borderColor: PHASES[phaseKey]?.color || '#E85D75',
        }}
      />
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-display font-bold text-ink-900">{cycleDay}</span>
        <span className="text-[11px] font-medium text-ink-500 uppercase tracking-wide">Day of cycle</span>
      </div>
    </div>
  )
}
