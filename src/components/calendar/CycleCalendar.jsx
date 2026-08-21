import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SelectedDayPanel from './SelectedDayPanel.jsx'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
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
  period: {
    color: '#E05370',
    label: 'Menstrual Phase',
    ringColor: '#E05370',
  },
  postPeriod: {
    color: '#352E4E',
    label: 'Follicular Phase',
    ringColor: '#352E4E',
  },
  ovulation: {
    color: '#2D8A7B',
    label: 'Ovulation',
    ringColor: '#2D8A7B',
  },
  prePeriod: {
    color: '#F3BA5B',
    label: 'Luteal Phase',
    ringColor: '#F3BA5B',
  },
}

function mod(n, m) {
  return ((n % m) + m) % m
}

export function getCycleCategoryForDate(date, cycleSetup = {}) {
  const { lastPeriodStart, cycleLength = 28, periodLength = 5 } = cycleSetup
  if (!lastPeriodStart) return null

  const start = new Date(`${lastPeriodStart}T00:00:00`)
  start.setHours(0, 0, 0, 0)

  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  const msPerDay = 1000 * 60 * 60 * 24
  const diffDays = Math.round((d - start) / msPerDay)

  const dayInCycle = mod(diffDays, Number(cycleLength)) + 1
  const ovulationDay = Number(cycleLength) - 14

  if (dayInCycle <= Number(periodLength)) return 'period'
  if (dayInCycle === ovulationDay) return 'ovulation'
  if (dayInCycle < ovulationDay) return 'postPeriod'
  return 'prePeriod'
}

export function getCycleDayForDate(date, cycleSetup = {}) {
  const { lastPeriodStart, cycleLength = 28 } = cycleSetup
  if (!lastPeriodStart) return null

  const start = new Date(`${lastPeriodStart}T00:00:00`)
  start.setHours(0, 0, 0, 0)

  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  const msPerDay = 1000 * 60 * 60 * 24
  const diffDays = Math.round((d - start) / msPerDay)
  return mod(diffDays, Number(cycleLength)) + 1
}


export default function CycleCalendar({
  cycleSetup,
  selectedDate: controlledSelectedDate,
  onSelectDay,
  healthLogs = {},
}) {
  const today = new Date()
  const [internalSelectedDate, setInternalSelectedDate] = useState(() => new Date())
  const selectedDate = controlledSelectedDate !== undefined ? controlledSelectedDate : internalSelectedDate

  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
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

  const handleSelectDate = (date) => {
    if (controlledSelectedDate === undefined) {
      setInternalSelectedDate(date)
    }
    onSelectDay?.(date)
  }

  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

        {/* ==================================================
            LEFT COLUMN: CALENDAR & PHASE LEGEND (~58% on lg)
            ================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4 lg:pr-6 lg:border-r lg:border-[#EFE5EE]">
          {/* Month & Navigation Header */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() =>
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
              }
              className="w-10 h-10 rounded-full border border-ink-100/90 bg-white shadow-2xs flex items-center justify-center text-ink-600 hover:text-ink-900 hover:bg-ink-50 active:scale-95 transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <h3 className="font-display font-bold text-ink-900 text-xl sm:text-2xl tracking-tight text-center flex items-center justify-center gap-2.5">
              <span className="text-[#8064A2]/50 text-sm hidden sm:inline select-none"></span>
              <span>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
              <span className="text-[#8064A2]/50 text-sm hidden sm:inline select-none"></span>
            </h3>

            <button
              type="button"
              onClick={() =>
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
              }
              className="w-10 h-10 rounded-full border border-ink-100/90 bg-white shadow-2xs flex items-center justify-center text-ink-600 hover:text-ink-900 hover:bg-ink-50 active:scale-95 transition-all"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Enclosed Calendar Table Card */}
          <div className="rounded-2xl bg-white/90">
            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 bg-[#FAF7FC]">
              {WEEKDAYS.map((weekday, index) => (
                <div
                  key={`${weekday}-${index}`}
                  className="text-center text-[11px] sm:text-xs font-bold tracking-wider text-[#958A99] uppercase py-3.5 border-r border-[#EBE1ED]/60 last:border-r-0"
                >
                  {weekday}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div>
              {weeks.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7">
                  {row.map((date, dayIndex) => {
                    if (!date) {
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[50px] sm:min-h-[56px] md:min-h-[60px] flex items-center justify-center p-1 sm:p-1.5 bg-white/40"
                          aria-hidden="true"
                        />
                      )
                    }

                    const category = getCycleCategoryForDate(date, cycleSetup)
                    const meta = category ? CATEGORY_META[category] : null
                    const selected = isSelected(date)
                    const todayDate = isToday(date)

                    return (
                      <div
                        key={dayIndex}
                        className="min-h-[64px] sm:min-h-[72px] md:min-h-[78px] flex items-center justify-center p-1"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectDate(date)}
                          aria-label={`Select ${date.toDateString()}`}
                          className={[
                            'w-8 h-8 sm:w-9 sm:h-9',
                            'rounded-full flex items-center justify-center relative',
                            'text-xs sm:text-sm font-bold transition-all duration-150',
                            'hover:scale-105 active:scale-95',
                            meta ? 'shadow-2xs' : 'hover:bg-ink-100/60',
                            selected
                              ? 'ring-2 ring-offset-[3px] ring-offset-white shadow-xs scale-105 z-10'
                              : todayDate
                              ? 'ring-2 ring-offset-1 ring-ink-300'
                              : '',
                          ].join(' ')}
                          style={{
                            backgroundColor: meta ? meta.color : 'transparent',
                            color: meta ? '#ffffff' : '#4A3654',
                            ...(selected && meta ? { '--tw-ring-color': meta.ringColor } : {}),
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
          </div>

          {/* Phase Legend (Fixed directly below calendar table) */}
          <div className="border border-[#EBE1ED] rounded-2xl px-5 sm:px-6 py-3 bg-white/80 shadow-2xs flex flex-wrap items-center justify-around gap-3 text-xs text-ink-600 font-medium">
            {Object.values(CATEGORY_META).map((meta) => (
              <div
                key={meta.label}
                className="flex items-center gap-2"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                <span>{meta.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================
            RIGHT COLUMN: SELECTED DAY PANEL (~42% on lg)
            ================================================== */}
        <div className="lg:col-span-5 flex flex-col h-full lg:pl-1">
          <SelectedDayPanel
            selectedDate={selectedDate}
            cycleSetup={cycleSetup}
            healthLogs={healthLogs}
          />
        </div>

      </div>

     
    </div>
  )
}