import React, { useMemo } from 'react'
import {
  Smile,
  Heart,
  Activity,
  Zap,
  Moon,
  Droplets,
  Dumbbell,
  Utensils,
  Sparkles,
  ShieldCheck,
  FileText,
} from 'lucide-react'

const CATEGORY_META = {
  period: {
    color: '#E05370',
    detailLabel: 'Menstrual Phase',
    badgeBg: 'bg-[#FDF2F4]',
    badgeText: 'text-[#C43F58]',
    badgeBorder: 'border-[#F8C2CD]',
  },
  postPeriod: {
    color: '#352E4E',
    detailLabel: 'Follicular Phase',
    badgeBg: 'bg-[#F5F2F9]',
    badgeText: 'text-[#443A61]',
    badgeBorder: 'border-[#E8E0F0]',
  },
  ovulation: {
    color: '#2D8A7B',
    detailLabel: 'Ovulation Phase',
    badgeBg: 'bg-[#EDF7F5]',
    badgeText: 'text-[#2F675E]',
    badgeBorder: 'border-[#9BD4C8]',
  },
  prePeriod: {
    color: '#F3BA5B',
    detailLabel: 'Luteal Phase',
    badgeBg: 'bg-[#FDF6EB]',
    badgeText: 'text-[#C88C31]',
    badgeBorder: 'border-[#FBEACB]',
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

function toISODateString(date) {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/* Subtle single botanical flower illustration matching reference design */
function FloralIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g opacity="0.85">
        <path
          d="M105 32 C108 18 124 16 130 28 C136 40 125 50 115 44 Z"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M115 44 C128 40 138 52 132 64 C125 74 112 66 110 52 Z"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M110 52 C116 66 104 78 92 72 C80 66 88 52 100 48 Z"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M100 48 C88 50 80 38 90 26 C100 16 108 28 105 38 Z"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <path
          d="M105 38 C112 24 125 24 126 36 C126 46 118 46 110 46 Z"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <circle cx="110" cy="46" r="4.5" fill="currentColor" fillOpacity="0.45" />
      </g>

      <path
        d="M110 50 Q106 90 76 138"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M100 80 Q82 72 70 60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M90 102 Q108 100 118 90"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      <ellipse cx="68" cy="58" rx="5" ry="3" transform="rotate(-30 68 58)" fill="currentColor" fillOpacity="0.35" />
      <ellipse cx="120" cy="88" rx="5" ry="3" transform="rotate(25 120 88)" fill="currentColor" fillOpacity="0.35" />
      <circle cx="130" cy="54" r="3" fill="currentColor" fillOpacity="0.35" />
    </svg>
  )
}

export default function SelectedDayPanel({
  selectedDate,
  cycleSetup = {},
  healthLogs = {},
}) {
  const activeDate = selectedDate || new Date()
  const activeCycleCategory = getCycleCategoryForDate(activeDate, cycleSetup)
  const activeCycleDay = getCycleDayForDate(activeDate, cycleSetup)
  const activeCategoryMeta = activeCycleCategory ? CATEGORY_META[activeCycleCategory] : null
  const activeISODate = toISODateString(activeDate)
  const activeLog = healthLogs[activeISODate] || null

  const formattedSelectedDate = activeDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Extract health metrics with tiered prominence (Primary vs Secondary)
  const healthDetails = useMemo(() => {
    if (!activeLog) return []
    const items = []

    // Primary Tier: Mood, Symptoms, Pain
    if (Array.isArray(activeLog.moods) && activeLog.moods.length > 0) {
      items.push({
        label: 'Mood',
        value: activeLog.moods.join(', '),
        icon: Smile,
        iconColor: 'text-[#F59E0B]',
        isPrimary: true,
      })
    } else if (activeLog.mood) {
      items.push({
        label: 'Mood',
        value: String(activeLog.mood).charAt(0).toUpperCase() + String(activeLog.mood).slice(1),
        icon: Smile,
        iconColor: 'text-[#F59E0B]',
        isPrimary: true,
      })
    }

    const symptomsList = [
      ...(Array.isArray(activeLog.symptoms) ? activeLog.symptoms : []),
      activeLog.otherSymptom,
    ].filter(Boolean).filter((s) => s !== 'None')
    if (symptomsList.length > 0) {
      items.push({
        label: 'Symptoms',
        value: symptomsList.join(', '),
        icon: Heart,
        iconColor: 'text-[#E05370]',
        isPrimary: true,
      })
    }

    if (activeLog.pain != null && activeLog.pain !== '') {
      const painDetails = [
        ...(Array.isArray(activeLog.painLocations) ? activeLog.painLocations : []),
        ...(Array.isArray(activeLog.painTypes) ? activeLog.painTypes : []),
      ].filter(Boolean)
      const painSuffix = painDetails.length > 0 ? ` (${painDetails.join(', ')})` : ''
      items.push({
        label: 'Pain',
        value: `${activeLog.pain} / 10${painSuffix}`,
        icon: Activity,
        iconColor: 'text-[#E05370]',
        isPrimary: true,
      })
    }

    // Secondary Tier: Energy, Sleep, Water, Exercise, Meals, Notes
    if (activeLog.energy) {
      items.push({
        label: 'Energy',
        value: activeLog.energy,
        icon: Zap,
        iconColor: 'text-[#2D8A7B]',
        isPrimary: false,
      })
    }

    if (activeLog.sleep != null && activeLog.sleep !== '') {
      const sleepQuality = activeLog.sleepQuality ? ` (${activeLog.sleepQuality})` : ''
      items.push({
        label: 'Sleep',
        value: `${activeLog.sleep} hrs${sleepQuality}`,
        icon: Moon,
        iconColor: 'text-[#6B5B95]',
        isPrimary: false,
      })
    }

    if (activeLog.waterLiters != null && activeLog.waterLiters !== '') {
      items.push({
        label: 'Water',
        value: `${activeLog.waterLiters} L`,
        icon: Droplets,
        iconColor: 'text-[#0EA5E9]',
        isPrimary: false,
      })
    } else if (activeLog.water != null && activeLog.water !== '') {
      items.push({
        label: 'Water',
        value: `${activeLog.water} glasses`,
        icon: Droplets,
        iconColor: 'text-[#0EA5E9]',
        isPrimary: false,
      })
    }

    const exerciseList = [
      ...(Array.isArray(activeLog.exerciseActivities) ? activeLog.exerciseActivities : []),
      activeLog.otherExercise,
    ].filter(Boolean).filter((e) => e !== 'None')
    if (exerciseList.length > 0) {
      const duration = activeLog.exerciseMinutes ? ` (${activeLog.exerciseMinutes} min)` : ''
      items.push({
        label: 'Exercise',
        value: `${exerciseList.join(', ')}${duration}`,
        icon: Dumbbell,
        iconColor: 'text-[#F59E0B]',
        isPrimary: false,
      })
    } else if (activeLog.exercise) {
      items.push({
        label: 'Exercise',
        value: activeLog.exercise,
        icon: Dumbbell,
        iconColor: 'text-[#F59E0B]',
        isPrimary: false,
      })
    }

    const mealsList = [
      ...(Array.isArray(activeLog.meals) ? activeLog.meals : []),
      activeLog.otherMeal,
    ].filter(Boolean)
    if (mealsList.length > 0) {
      items.push({
        label: 'Meals',
        value: mealsList.join(', '),
        icon: Utensils,
        iconColor: 'text-[#10B981]',
        isPrimary: false,
      })
    } else if (activeLog.diet) {
      items.push({
        label: 'Meals',
        value: activeLog.diet,
        icon: Utensils,
        iconColor: 'text-[#10B981]',
        isPrimary: false,
      })
    }

    if (Array.isArray(activeLog.cravings) && activeLog.cravings.length > 0) {
      const cleanCravings = activeLog.cravings.filter((c) => c !== 'None')
      if (cleanCravings.length > 0) {
        items.push({
          label: 'Cravings',
          value: cleanCravings.join(', '),
          icon: Utensils,
          iconColor: 'text-[#F59E0B]',
          isPrimary: false,
        })
      }
    }

    if (activeLog.periodStatus && activeLog.periodStatus !== 'none') {
      const flow = activeLog.bleeding ? ` (${activeLog.bleeding} flow)` : ''
      items.push({
        label: 'Period status',
        value: `${activeLog.periodStatus === 'period' ? 'Period' : 'Spotting'}${flow}`,
        icon: ShieldCheck,
        iconColor: 'text-[#E05370]',
        isPrimary: false,
      })
    }

    const reliefList = [
      ...(Array.isArray(activeLog.relief) ? activeLog.relief : []),
      activeLog.otherRelief,
    ].filter(Boolean).filter((r) => r !== 'None')
    if (reliefList.length > 0) {
      items.push({
        label: 'Relief used',
        value: reliefList.join(', '),
        icon: Sparkles,
        iconColor: 'text-[#8064A2]',
        isPrimary: false,
      })
    }

    if (activeLog.notes) {
      items.push({
        label: 'Notes',
        value: `"${activeLog.notes}"`,
        icon: FileText,
        iconColor: 'text-[#958A99]',
        isPrimary: false,
      })
    }

    return items
  }, [activeLog])

  return (
    <div className="bg-white rounded-2xl border border-[#EBE1ED] p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between h-full">
      {/* Single subtle botanical flower in the top-right corner */}
      <FloralIllustration className="absolute top-2 right-2 w-32 h-32 text-[#8064A2]/25 pointer-events-none select-none" />

      <div className="relative z-10">
        {/* Selected Day Header */}
        <div className="border-b border-[#EBE1ED]/80 pb-4 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#8064A2]">
            Selected Day
          </p>
          <h4 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-tight">
            {formattedSelectedDate}
          </h4>

          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            {activeCycleDay != null && (
              <span className="text-xs font-semibold text-[#C43F58] bg-[#FDF2F4] px-3.5 py-1 rounded-full border border-[#F8C2CD] shadow-2xs">
                Cycle Day {activeCycleDay}
              </span>
            )}
            {activeCategoryMeta && (
              <span
                className={`text-xs font-semibold px-3.5 py-1 rounded-full border shadow-2xs ${activeCategoryMeta.badgeBg} ${activeCategoryMeta.badgeText} ${activeCategoryMeta.badgeBorder}`}
              >
                {activeCategoryMeta.detailLabel}
              </span>
            )}
          </div>
        </div>

        {/* Health Metrics List with Tiered Hierarchy */}
        {healthDetails.length > 0 ? (
          <div className="divide-y divide-dotted divide-[#E8DDEB]">
            {healthDetails.map((item) => {
              const IconComponent = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-3 py-2.5 text-xs sm:text-sm"
                >
                  <div
                    className={`flex items-center gap-2.5 shrink-0 w-28 sm:w-32 ${
                      item.isPrimary ? 'text-ink-900 font-bold' : 'text-ink-700 font-medium'
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent
                        size={16}
                        className={`shrink-0 ${item.iconColor || 'text-ink-400'}`}
                      />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-right flex-1 break-words pl-3 leading-relaxed ${
                      item.isPrimary ? 'text-ink-900 font-medium' : 'text-ink-800 font-normal'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 px-4 text-center bg-[#FAF7FC]/80 rounded-xl my-2 border border-dashed border-[#E8DDEB]">
            <p className="text-xs sm:text-sm text-ink-700 font-semibold">
              No health entries recorded for this day.
            </p>
            <p className="text-[11px] sm:text-xs text-ink-400 mt-1">
              Log daily health to see mood, symptoms, sleep, and energy here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
