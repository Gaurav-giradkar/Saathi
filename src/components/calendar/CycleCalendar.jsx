import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

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
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const weeks = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []

    for (let i = 0; i < startOffset; i += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day))
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    const rows = []
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7))
    }

    return rows
  }, [viewDate])

  const isToday = (d) => d && d.toDateString() === today.toDateString()
  const isSelected = (d) =>
    d && selectedDate && d.toDateString() === selectedDate.toDateString()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() =>
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
          }
          className="p-2 rounded-full hover:bg-ink-100 text-ink-600 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>

        <h3 className="font-display font-semibold text-ink-900 text-lg">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>

        <button
          type="button"
          onClick={() =>
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
          }
          className="p-2 rounded-full hover:bg-ink-100 text-ink-600 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((weekday, index) => (
          <div
            key={`${weekday}-${index}`}
            className="text-center text-[11px] font-semibold text-ink-400 uppercase py-1.5"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-0.5 max-w-3xl mx-auto">
          {weeks.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7 gap-0.5">
            {row.map((date, dayIndex) => {
              if (!date) {
                return <div key={dayIndex} className="aspect-square" aria-hidden="true" />
              }

              const category = getCycleCategoryForDate(date, cycleSetup)
              const meta = category ? CATEGORY_META[category] : null

              return (
                <div key={dayIndex} className="flex items-center justify-center aspect-square">
                  <button
                    type="button"
                    onClick={() => onSelectDay?.(date)}
                    aria-label={`Select ${date.toDateString()}`}
                    className={[
                      'w-full h-full max-w-[30px] max-h-[30px]',
                      'sm:max-w-[32px] sm:max-h-[32px]',
                      'lg:max-w-[34px] lg:max-h-[34px]',
                      'rounded-full flex items-center justify-center',
                      'text-[13px] sm:text-sm font-semibold transition-transform hover:scale-105',
                      isToday(date) ? 'ring-2 ring-offset-2 ring-ink-800' : '',
                      isSelected(date) ? 'ring-2 ring-offset-2 ring-brand-coral' : '',
                    ].join(' ')}
                    style={{
                      backgroundColor: meta ? meta.color : 'transparent',
                      color: meta ? '#ffffff' : '#453640',
                    }}
                  >
                    {date.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-ink-100">
        {Object.values(CATEGORY_META).map((meta) => (
          <div
            key={meta.label}
            className="flex items-center gap-1.5 text-xs text-ink-600 font-medium"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden="true"
            />
            {meta.label}
          </div>
        ))}
      </div>
    </div>
  )
}