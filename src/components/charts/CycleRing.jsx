import React from 'react'

export default function CycleRing({
  cycleDay,
  cycleLength,
  phaseKey,
  nextPeriodDate,
}) {
  const progress = Math.min(cycleDay / cycleLength, 1)
  const radius = 82
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  const phaseNames = {
    menstrual: 'Menstrual',
    follicular: 'Follicular',
    ovulation: 'Ovulation',
    luteal: 'Luteal',
  }

  const phase = phaseNames[phaseKey] || 'Current'

  return (
    <div className="w-full max-w-[320px] mx-auto">
      
      {/* Cycle Circle */}
      <div className="relative flex items-center justify-center">
        <svg
          width="210"
          height="210"
          viewBox="0 0 210 210"
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="105"
            cy="105"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="14"
          />

          {/* Progress circle */}
          <circle
            cx="105"
            cy="105"
            r={radius}
            fill="none"
            stroke="#d96b82"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        {/* Center text */}
        <div className="absolute text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Cycle Day
          </p>

          <p className="text-5xl font-semibold text-gray-900 mt-1">
            {cycleDay}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            of {cycleLength} days
          </p>
        </div>
      </div>

      {/* Phase */}
      <p className="w-full text-center text-lg font-semibold text-gray-900">
        {phase} phase
      </p>

<div className="mt-5 bg-rose-50 rounded-2xl px-6 py-4 text-center">
  <p className="text-sm uppercase tracking-wider text-rose-500 font-semibold">
    Next Period
  </p>

  <p className="text-2xl font-bold text-rose-700 mt-1">
    {new Date(nextPeriodDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })}
  </p>

      </div>
      
      </div>
  )
}