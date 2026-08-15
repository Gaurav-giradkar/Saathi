import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const CATEGORY_META = {
  prePeriod: { color: '#E8A94A', label: 'Pre-Period' },
  period: { color: '#E85D75', label: 'Period Days' },
  postPeriod: { color: '#443A61', label: 'Post-Period' },
  ovulation: { color: '#3D8579', label: 'Peak Ovulation' },
}

function mod(n, m) {
  return ((n % m) + m) % m
}

export function getCycleCategoryForDate(date, cycleSetup) {
  const { lastPeriodStart, cycleLength, periodLength } = cycleSetup
  const start = new Date(lastPeriodStart)
  start.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const msPerDay = 1000 * 60 * 60 * 24
  const diffDays = Math.round((d - start) / msPerDay)
  const dayInCycle = mod(diffDays, cycleLength) + 1
  const ovulationDay = cycleLength - 14

  if (dayInCycle <= periodLength) return 'period'
  if (dayInCycle <= periodLength + 3) return 'postPeriod'
  if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) return 'ovulation'
  if (dayInCycle >= cycleLength - 1) return 'prePeriod'
  return null
}

export default function CycleCalendar({ cycleSetup, selectedDate, onSelectDay }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const weeks = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day))
    while (cells.length % 7 !== 0) cells.push(null)

    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [viewDate])

  const isToday = (d) => d && d.toDateString() === today.toDateString()
  const isSelected = (d) => d && selectedDate && d.toDateString() === selectedDate.toDateString()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-2 rounded-full hover:bg-ink-100 text-ink-600 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-display font-semibold text-ink-900 text-lg">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-2 rounded-full hover:bg-ink-100 text-ink-600 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-ink-400 uppercase py-1.5">
            {w}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {weeks.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-1">
            {row.map((d, di) => {
              if (!d) return <div key={di} />
              const category = getCycleCategoryForDate(d, cycleSetup)
              const meta = category ? CATEGORY_META[category] : null
              return (
                <div key={di} className="flex items-center justify-center aspect-square">
                  <button
                    type="button"
                    onClick={() => onSelectDay?.(d)}
                    className={[
                      'w-full h-full max-w-[38px] max-h-[38px] rounded-full flex items-center justify-center text-[13px] font-semibold transition-transform hover:scale-105',
                      isToday(d) ? 'ring-2 ring-offset-2 ring-ink-800' : '',
                      isSelected(d) ? 'ring-2 ring-offset-2 ring-brand-coral' : '',
                    ].join(' ')}
                    style={{
                      backgroundColor: meta ? meta.color : 'transparent',
                      color: meta ? '#FFFFFF' : '#453640',
                    }}
                  >
                    {d.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-ink-100">
        {Object.values(CATEGORY_META).map((m) => (
          <div key={m.label} className="flex items-center gap-1.5 text-xs text-ink-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  )
}
