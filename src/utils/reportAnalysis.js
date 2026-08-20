// ---------------------------------------------------------------------------
// reportAnalysis.js
// Deterministic analysis utility for Saathi's Monthly Personal Health Report.
//
// Pure analytical functions: NO React state, NO direct Firebase queries.
// Operates on provided user health logs and cycle history.
// ---------------------------------------------------------------------------

import { getPhaseForDay, PHASES } from '../data/mockData.js'

// Explicit symptom classification dictionary
export const SYMPTOM_CATEGORY_MAP = {
  // Pain
  'Cramps': 'pain',
  'Headache': 'pain',
  'Migraine': 'pain',
  'Backache': 'pain',
  'Pelvic pain': 'pain',
  'Breast pain': 'pain',
  'Muscle aches': 'pain',
  'Joint pain': 'pain',
  'Stomach pain': 'pain',

  // Physical
  'Bloating': 'physical',
  'Fatigue': 'physical',
  'Weakness': 'physical',
  'Nausea': 'physical',
  'Dizziness': 'physical',
  'Breast tenderness': 'physical',
  'Acne': 'physical',
  'Constipation': 'physical',
  'Diarrhea': 'physical',
  'Gas': 'physical',
  'Hot flashes': 'physical',
  'Chills': 'physical',
  'Heavy bleeding': 'physical',
  'Light bleeding': 'physical',
  'Spotting': 'physical',
  'Clots': 'physical',
  'Vaginal dryness': 'physical',
  'Increased discharge': 'physical',
  'Unusual discharge': 'physical',
  'Sore throat': 'physical',
  'Fever': 'physical',
  'Cold symptoms': 'physical',

  // Mood
  'Mood swings': 'mood',
  'Irritability': 'mood',
  'Anxiety': 'mood',
  'Low mood': 'mood',
  'Stress': 'mood',
  'Restlessness': 'mood',
  'Emotional sensitivity': 'mood',
  'Brain fog': 'mood',
  'Overwhelmed': 'mood',
  'Sadness': 'mood',
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * Generates at least the past 12 months going backward from currentDate.
 * Also includes any older months present in user's logs or cycle history.
 */
export function getAvailableReportMonths(currentDate = new Date(), logs = [], history = []) {
  const months = []
  const seen = new Set()

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-indexed

  // Past 12 months from currentDate
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${yyyy}-${mm}`
    if (!seen.has(key)) {
      seen.add(key)
      months.push({
        value: key,
        label: `${MONTH_NAMES[d.getMonth()]} ${yyyy}`,
        year: yyyy,
        month: d.getMonth() + 1,
      })
    }
  }

  // Include any extra historical months from logs or cycle history
  const extraDates = [
    ...logs.map((l) => l.date?.slice(0, 7)),
    ...history.map((h) => h.month || h.startDate?.slice(0, 7)),
  ].filter(Boolean)

  extraDates.forEach((key) => {
    if (/^\d{4}-\d{2}$/.test(key) && !seen.has(key)) {
      seen.add(key)
      const [y, m] = key.split('-').map(Number)
      months.push({
        value: key,
        label: `${MONTH_NAMES[m - 1]} ${y}`,
        year: y,
        month: m,
      })
    }
  })

  // Sort descending (newest first)
  return months.sort((a, b) => b.value.localeCompare(a.value))
}

/**
 * Filters logs strictly for the selected month string 'YYYY-MM'.
 */
export function filterLogsByMonth(logs = [], selectedMonthKey) {
  if (!selectedMonthKey || !Array.isArray(logs)) return []
  return logs
    .filter((log) => log && typeof log.date === 'string' && log.date.startsWith(selectedMonthKey))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculates the 6 compact snapshot metrics for the selected month.
 */
export function calculateMonthlySnapshot(logsForMonth = [], cycleInfo = {}, allLogs = [], selectedMonthKey) {
  const isCurrentMonth = selectedMonthKey === new Date().toISOString().slice(0, 7)

  // 1. Current Cycle Day
  let currentCycle = 'Not enough data'
  if (isCurrentMonth && cycleInfo?.cycleDay != null) {
    currentCycle = `Day ${cycleInfo.cycleDay}`
  } else if (cycleInfo?.lastPeriodStart && cycleInfo?.cycleLength && selectedMonthKey) {
    const [y, m] = selectedMonthKey.split('-').map(Number)
    const endOfMonth = new Date(y, m, 0)
    const start = new Date(`${cycleInfo.lastPeriodStart}T00:00:00`)
    const diffDays = Math.floor((endOfMonth - start) / 86400000)
    if (!isNaN(diffDays)) {
      const day = ((diffDays % cycleInfo.cycleLength) + cycleInfo.cycleLength) % cycleInfo.cycleLength + 1
      currentCycle = `Day ${day}`
    }
  }

  // 2. Cycle Length
  const cycleLength = cycleInfo?.cycleLength ? `${cycleInfo.cycleLength} days` : 'Not enough data'

  // 3. Period Length
  const periodLength = cycleInfo?.periodLength ? `${cycleInfo.periodLength} days` : 'Not enough data'

  // 4. Logged Days
  const loggedDays = logsForMonth.length > 0 ? `${logsForMonth.length} days` : '0 days'

  // 5. Average Pain
  const painEntries = logsForMonth.filter((l) => l.pain != null && l.pain !== '')
  let averagePain = 'Not enough data'
  let rawAvgPain = null
  if (painEntries.length > 0) {
    const totalPain = painEntries.reduce((acc, l) => acc + Number(l.pain), 0)
    rawAvgPain = totalPain / painEntries.length
    averagePain = `${rawAvgPain.toFixed(1)} / 10`
  }

  // 6. Most Common Symptom
  const symptomCounts = {}
  logsForMonth.forEach((log) => {
    if (Array.isArray(log.symptoms)) {
      log.symptoms.forEach((s) => {
        if (s && s !== 'None') {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1
        }
      })
    }
    if (log.otherSymptom) {
      symptomCounts[log.otherSymptom] = (symptomCounts[log.otherSymptom] || 0) + 1
    }
  })

  let mostCommonSymptom = 'Not enough data'
  let mostCommonCount = 0
  const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])
  if (sortedSymptoms.length > 0) {
    mostCommonSymptom = sortedSymptoms[0][0]
    mostCommonCount = sortedSymptoms[0][1]
  } else if (logsForMonth.length > 0) {
    mostCommonSymptom = 'None logged'
  }

  return {
    currentCycle,
    cycleLength,
    periodLength,
    loggedDays,
    loggedDaysCount: logsForMonth.length,
    averagePain,
    rawAvgPain,
    mostCommonSymptom,
    mostCommonCount,
  }
}

/**
 * Calculates the cycle phase distribution for the calendar days in selected month.
 * Handles cycle crossing month boundaries correctly.
 */
export function calculatePhaseDistribution(selectedMonthKey, cycleSetup = {}) {
  if (!selectedMonthKey) return { daysInMonth: 0, phaseCounts: {}, timelineSegments: [], monthDays: [] }

  const [year, month] = selectedMonthKey.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()

  const cycleLength = Number(cycleSetup.cycleLength || 28)
  const periodLength = Number(cycleSetup.periodLength || 5)
  const lastPeriodStart = cycleSetup.lastPeriodStart

  const phaseCounts = {
    menstrual: 0,
    follicular: 0,
    ovulation: 0,
    luteal: 0,
  }

  const monthDays = []

  if (!lastPeriodStart) {
    return {
      daysInMonth,
      phaseCounts,
      timelineSegments: [],
      monthDays: [],
      hasCycleSetup: false,
    }
  }

  const startDate = new Date(`${lastPeriodStart}T00:00:00`)
  startDate.setHours(0, 0, 0, 0)

  for (let day = 1; day <= daysInMonth; day++) {
    const current = new Date(year, month - 1, day)
    current.setHours(0, 0, 0, 0)
    const diffMs = current - startDate
    const diffDays = Math.round(diffMs / 86400000)
    let cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1
    const ovulationDay = cycleLength - 14

    let phaseKey

    if (cycleDay <= periodLength) {
      phaseKey = 'menstrual'
    } else if (cycleDay === ovulationDay) {
      phaseKey = 'ovulation'
    } else if (cycleDay < ovulationDay) {
      phaseKey = 'follicular'
    } else {
      phaseKey = 'luteal'
    }

    if (phaseCounts[phaseKey] !== undefined) {
      phaseCounts[phaseKey]++
    }

    monthDays.push({
      day,
      dateStr: `${selectedMonthKey}-${String(day).padStart(2, '0')}`,
      cycleDay,
      phaseKey,
      phaseMeta: PHASES[phaseKey] || { label: phaseKey, color: '#A6949F', bg: '#F5F2F9' },
    })
  }

  // Build compressed horizontal timeline segments (continuous phase spans)
  const timelineSegments = []
  if (monthDays.length > 0) {
    let currentSegment = {
      phaseKey: monthDays[0].phaseKey,
      phaseMeta: monthDays[0].phaseMeta,
      startDay: monthDays[0].day,
      endDay: monthDays[0].day,
      startCycleDay: monthDays[0].cycleDay,
      endCycleDay: monthDays[0].cycleDay,
      dayCount: 1,
    }

    for (let i = 1; i < monthDays.length; i++) {
      const d = monthDays[i]
      if (d.phaseKey === currentSegment.phaseKey) {
        currentSegment.endDay = d.day
        currentSegment.endCycleDay = d.cycleDay
        currentSegment.dayCount++
      } else {
        timelineSegments.push(currentSegment)
        currentSegment = {
          phaseKey: d.phaseKey,
          phaseMeta: d.phaseMeta,
          startDay: d.day,
          endDay: d.day,
          startCycleDay: d.cycleDay,
          endCycleDay: d.cycleDay,
          dayCount: 1,
        }
      }
    }
    timelineSegments.push(currentSegment)
  }

  return {
    daysInMonth,
    phaseCounts,
    timelineSegments,
    monthDays,
    hasCycleSetup: true,
  }
}

/**
 * Calculates cycle length summary and generated interpretation.
 * Never generates conclusions from a single cycle.
 */
export function calculateCycleLengthSummary(history = []) {
  const validHistory = (history || []).filter((h) => Number.isFinite(Number(h.length)) && Number(h.length) > 0)

  if (validHistory.length >= 2) {
    const lengths = validHistory.map((h) => Number(h.length))
    const min = Math.min(...lengths)
    const max = Math.max(...lengths)
    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)

    let interpretation = ''
    if (min === max) {
      interpretation = `Your recent cycles have all stayed consistent at ${min} days.`
    } else {
      interpretation = `Your recent cycles have stayed between ${min} and ${max} days (average ${avg} days).`
    }

    return {
      hasSufficientData: true,
      min,
      max,
      avg,
      count: validHistory.length,
      interpretation,
      chartData: validHistory.map((h) => ({
        month: h.month || (h.startDate ? h.startDate.slice(0, 7) : 'Cycle'),
        length: Number(h.length),
      })),
    }
  }

  if (validHistory.length === 1) {
    return {
      hasSufficientData: false,
      count: 1,
      interpretation: 'More cycle history is needed to identify a reliable range (1 cycle recorded).',
      chartData: validHistory.map((h) => ({
        month: h.month || (h.startDate ? h.startDate.slice(0, 7) : 'Cycle'),
        length: Number(h.length),
      })),
    }
  }

  return {
    hasSufficientData: false,
    count: 0,
    interpretation: 'More cycle history is needed to identify a reliable range.',
    chartData: [],
  }
}

/**
 * Categorizes and calculates frequency and percentage for all symptoms in the month.
 */
export function calculateSymptomBreakdown(
  logsForMonth = [],
  activeFilter = 'All'
) {
  const totalLoggedDays = logsForMonth.length

  if (totalLoggedDays === 0) {
    return {
      symptoms: [],
      totalLoggedDays: 0,
    }
  }

  const counts = {}

  logsForMonth.forEach((log) => {
    const seenInDay = new Set()

    // -------------------------
    // MOOD
    // -------------------------
    if (activeFilter === 'Mood' || activeFilter === 'All') {
      const moods = Array.isArray(log.moods) ? log.moods : []

      moods.forEach((mood) => {
        if (!mood || mood === 'None') return

        const key = `mood:${mood}`

        if (!seenInDay.has(key)) {
          seenInDay.add(key)
          counts[mood] = (counts[mood] || 0) + 1
        }
      })
    }

    // -------------------------
    // PAIN
    // -------------------------
    if (activeFilter === 'Pain' || activeFilter === 'All') {
      if (
        log.pain !== null &&
        log.pain !== undefined &&
        log.pain !== '' &&
        Number(log.pain) > 0
      ) {
        const key = 'pain'

        if (!seenInDay.has(key)) {
          seenInDay.add(key)
          counts.Pain = (counts.Pain || 0) + 1
        }
      }

      if (Array.isArray(log.painTypes)) {
        log.painTypes.forEach((painType) => {
          if (!painType || painType === 'None') return

          const key = `painType:${painType}`

          if (!seenInDay.has(key)) {
            seenInDay.add(key)
            counts[painType] = (counts[painType] || 0) + 1
          }
        })
      }
    }

    // -------------------------
    // PHYSICAL SYMPTOMS
    // -------------------------
    if (activeFilter === 'Physical' || activeFilter === 'All') {
      if (Array.isArray(log.symptoms)) {
        log.symptoms.forEach((symptom) => {
          if (!symptom || symptom === 'None') return

          const category =
            SYMPTOM_CATEGORY_MAP[symptom] || 'physical'

          if (category !== 'physical') return

          if (!seenInDay.has(symptom)) {
            seenInDay.add(symptom)
            counts[symptom] = (counts[symptom] || 0) + 1
          }
        })
      }

      if (
        log.otherSymptom &&
        !seenInDay.has(`other:${log.otherSymptom}`)
      ) {
        seenInDay.add(`other:${log.otherSymptom}`)
        counts[log.otherSymptom] =
          (counts[log.otherSymptom] || 0) + 1
      }
    }
  })

  const list = Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round(
        (count / totalLoggedDays) * 100
      ),
      category:
        activeFilter === 'Mood'
          ? 'mood'
          : activeFilter === 'Pain'
            ? 'pain'
            : 'physical',
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.name.localeCompare(b.name)
    )

  return {
    symptoms: list,
    totalLoggedDays,
  }
}

/**
 * Calculates historical baseline using only data BEFORE the selected month.
 * Does not include the current month's values in its own baseline.
 */

const ENERGY_SCORE_MAP = {
  'very low': 1,
  'low': 2,
  'below average': 2.5,
  'medium': 3,
  'above average': 3.5,
  'high': 4,
  'very high': 5,
}

function parseEnergyScore(energyStr) {
  if (!energyStr) return null

  return (
    ENERGY_SCORE_MAP[
      String(energyStr).trim().toLowerCase()
    ] ?? null
  )
}

function formatEnergyLabel(score) {
  if (score == null) return '—'
  if (score <= 1.5) return 'Very Low'
  if (score <= 2.4) return 'Low'
  if (score <= 3.4) return 'Medium'
  if (score <= 4.4) return 'High'
  return 'Very High'
}

export function calculateBaseline(allLogs = [], selectedMonthKey, cycleHistory = [], cycleSetup = {}) {
  if (!selectedMonthKey || !Array.isArray(allLogs)) {
    return { hasBaseline: false, reason: 'No historical data' }
  }

  const priorLogs = allLogs.filter((l) => l.date && l.date < `${selectedMonthKey}-01`)

  if (priorLogs.length < 3) {
    return {
      hasBaseline: false,
      priorLogCount: priorLogs.length,
      reason: 'Baseline not available yet (requires at least 3 historical logs prior to this month).',
    }
  }

  // Sleep baseline
  const sleepLogs = priorLogs.filter((l) => l.sleep != null && l.sleep !== '')
  const avgSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((acc, l) => acc + Number(l.sleep), 0) / sleepLogs.length
    : null

  // Pain baseline
  const painLogs = priorLogs.filter((l) => l.pain != null && l.pain !== '')
  const avgPain = painLogs.length > 0
    ? painLogs.reduce((acc, l) => acc + Number(l.pain), 0) / painLogs.length
    : null

  // Energy baseline
  const energyLogs = priorLogs.map((l) => parseEnergyScore(l.energy)).filter((v) => v !== null)
  const avgEnergyScore = energyLogs.length > 0
    ? energyLogs.reduce((acc, v) => acc + v, 0) / energyLogs.length
    : null

  // Water baseline
  const waterLogs = priorLogs.filter((l) => l.waterLiters != null && l.waterLiters !== '')
  const avgWater = waterLogs.length > 0
    ? waterLogs.reduce((acc, l) => acc + Number(l.waterLiters), 0) / waterLogs.length
    : null

  // Exercise baseline (minutes)
  const exerciseLogs = priorLogs.filter((l) => l.exerciseMinutes != null && l.exerciseMinutes !== '')
  const avgExercise = exerciseLogs.length > 0
    ? exerciseLogs.reduce((acc, l) => acc + Number(l.exerciseMinutes), 0) / exerciseLogs.length
    : null

  // Cycle length baseline
  const priorCycles = (cycleHistory || []).filter((c) => c.month && c.month < selectedMonthKey)
  const avgCycleLength = priorCycles.length > 0
    ? Math.round(priorCycles.reduce((acc, c) => acc + Number(c.length), 0) / priorCycles.length)
    : (cycleSetup.cycleLength ? Number(cycleSetup.cycleLength) : null)

  return {
    hasBaseline: true,
    priorLogCount: priorLogs.length,
    avgSleep,
    avgPain,
    avgEnergyScore,
    avgWater,
    avgExercise,
    avgCycleLength,
  }
}

/**
 * Compares selected month averages with historical baseline.
 * Generates non-alarming status and deterministic "What changed" explanation.
 */
export function compareWithBaseline(monthLogs = [], baseline = {}, cycleSetup = {}) {
  // Compute month averages
  const sleepLogs = monthLogs.filter((l) => l.sleep != null && l.sleep !== '')
  const mSleep = sleepLogs.length > 0
    ? sleepLogs.reduce((acc, l) => acc + Number(l.sleep), 0) / sleepLogs.length
    : null

  const painLogs = monthLogs.filter((l) => l.pain != null && l.pain !== '')
  const mPain = painLogs.length > 0
    ? painLogs.reduce((acc, l) => acc + Number(l.pain), 0) / painLogs.length
    : null

  const energyLogs = monthLogs.map((l) => parseEnergyScore(l.energy)).filter((v) => v !== null)
  const mEnergyScore = energyLogs.length > 0
    ? energyLogs.reduce((acc, v) => acc + v, 0) / energyLogs.length
    : null

  const waterLogs = monthLogs.filter((l) => l.waterLiters != null && l.waterLiters !== '')
  const mWater = waterLogs.length > 0
    ? waterLogs.reduce((acc, l) => acc + Number(l.waterLiters), 0) / waterLogs.length
    : null

  const exerciseLogs = monthLogs.filter((l) => l.exerciseMinutes != null && l.exerciseMinutes !== '')
  const mExercise = exerciseLogs.length > 0
    ? exerciseLogs.reduce((acc, l) => acc + Number(l.exerciseMinutes), 0) / exerciseLogs.length
    : null

  const mCycleLength = cycleSetup.cycleLength ? Number(cycleSetup.cycleLength) : null

  if (!baseline.hasBaseline) {
    return {
      hasBaseline: false,
      rows: [
        { metric: 'Sleep', usual: '—', thisMonth: mSleep != null ? `${mSleep.toFixed(1)}h` : '—', status: 'No baseline' },
        { metric: 'Pain', usual: '—', thisMonth: mPain != null ? `${mPain.toFixed(1)}` : '—', status: 'No baseline' },
        { metric: 'Energy', usual: '—', thisMonth: mEnergyScore != null ? formatEnergyLabel(mEnergyScore) : '—', status: 'No baseline' },
        { metric: 'Water', usual: '—', thisMonth: mWater != null ? `${mWater.toFixed(1)} L` : '—', status: 'No baseline' },
        { metric: 'Exercise', usual: '—', thisMonth: mExercise != null ? `${Math.round(mExercise)} min` : '—', status: 'No baseline' },
        { metric: 'Cycle length', usual: '—', thisMonth: mCycleLength != null ? `${mCycleLength} days` : '—', status: 'No baseline' },
      ],
      whatChanged: 'More history is needed to compare this month with your usual pattern. Keep logging daily check-ins to build your personal baseline.',
    }
  }

  const getStatus = (diff, threshold = 0.5, reverseGood = false) => {
    if (diff == null || isNaN(diff)) return 'Similar'
    if (Math.abs(diff) < threshold) return 'Similar'
    return diff > 0 ? 'Above usual' : 'Below usual'
  }

  const sleepDiff = mSleep != null && baseline.avgSleep != null ? mSleep - baseline.avgSleep : null
  const painDiff = mPain != null && baseline.avgPain != null ? mPain - baseline.avgPain : null
  const energyDiff = mEnergyScore != null && baseline.avgEnergyScore != null ? mEnergyScore - baseline.avgEnergyScore : null
  const waterDiff = mWater != null && baseline.avgWater != null ? mWater - baseline.avgWater : null
  const exerciseDiff = mExercise != null && baseline.avgExercise != null ? mExercise - baseline.avgExercise : null
  const cycleDiff = mCycleLength != null && baseline.avgCycleLength != null ? mCycleLength - baseline.avgCycleLength : null

  const rows = [
    {
      metric: 'Sleep',
      usual: baseline.avgSleep != null ? `${baseline.avgSleep.toFixed(1)}h` : '—',
      thisMonth: mSleep != null ? `${mSleep.toFixed(1)}h` : '—',
      status: getStatus(sleepDiff, 0.4),
      diff: sleepDiff,
    },
    {
      metric: 'Pain',
      usual: baseline.avgPain != null ? `${baseline.avgPain.toFixed(1)}` : '—',
      thisMonth: mPain != null ? `${mPain.toFixed(1)}` : '—',
      status: getStatus(painDiff, 0.4),
      diff: painDiff,
    },
    {
      metric: 'Energy',
      usual: baseline.avgEnergyScore != null ? formatEnergyLabel(baseline.avgEnergyScore) : '—',
      thisMonth: mEnergyScore != null ? formatEnergyLabel(mEnergyScore) : '—',
      status: getStatus(energyDiff, 0.5),
      diff: energyDiff,
    },
    {
      metric: 'Water',
      usual: baseline.avgWater != null ? `${baseline.avgWater.toFixed(1)} L` : '—',
      thisMonth: mWater != null ? `${mWater.toFixed(1)} L` : '—',
      status: getStatus(waterDiff, 0.3),
      diff: waterDiff,
    },
    {
      metric: 'Exercise',
      usual: baseline.avgExercise != null ? `${Math.round(baseline.avgExercise)} min` : '—',
      thisMonth: mExercise != null ? `${Math.round(mExercise)} min` : '—',
      status: getStatus(exerciseDiff, 10),
      diff: exerciseDiff,
    },
    {
      metric: 'Cycle length',
      usual: baseline.avgCycleLength != null ? `${baseline.avgCycleLength} days` : '—',
      thisMonth: mCycleLength != null ? `${mCycleLength} days` : '—',
      status: getStatus(cycleDiff, 2),
      diff: cycleDiff,
    },
  ]

  // Deterministic summary of what changed
  const changes = []
  if (sleepDiff != null && Math.abs(sleepDiff) >= 0.4) {
    changes.push(
      sleepDiff < 0
        ? `Your average sleep this month is ${Math.abs(sleepDiff).toFixed(1)} hours below your recent baseline`
        : `Your average sleep this month is ${sleepDiff.toFixed(1)} hours above your recent baseline`
    )
  }
  if (painDiff != null && Math.abs(painDiff) >= 0.4) {
    changes.push(
      painDiff > 0
        ? 'while your average reported pain was slightly higher than usual'
        : 'while your average reported pain was lower than usual'
    )
  }
  if (energyDiff != null && Math.abs(energyDiff) >= 0.6) {
    changes.push(
      energyDiff < 0
        ? 'and lower energy was logged more frequently'
        : 'with generally higher energy reported across entries'
    )
  }
  if (waterDiff != null && Math.abs(waterDiff) >= 0.4) {
    changes.push(
      waterDiff < 0
        ? 'Daily water intake was slightly lower than your usual baseline.'
        : 'Daily water intake was higher than your usual baseline.'
    )
  }

  let whatChanged = ''
  if (changes.length === 0) {
    whatChanged = 'Your logged metrics this month remained consistent with your usual baseline, with no major variations observed.'
  } else {
    whatChanged = `${changes.join(', ')}.`
  }

  return {
    hasBaseline: true,
    rows,
    whatChanged,
  }
}

/**
 * Detects real personal patterns from actual user tracking history.
 * Never fabricates patterns. Assigns confidence indicators.
 */
export function detectPersonalPatterns(allLogs = [], cycleSetup = {}) {
  if (!Array.isArray(allLogs) || allLogs.length < 3) {
    return {
      hasPatterns: false,
      message: 'More tracking is needed before Saathi can identify a reliable personal pattern.',
      patterns: [],
    }
  }

  const cycleLength = Number(cycleSetup.cycleLength || 28)
  const periodLength = Number(cycleSetup.periodLength || 5)
  const lastPeriodStart = cycleSetup.lastPeriodStart
  const patterns = []

  // 1. Symptom pattern: Cramps in early menstrual phase
  const logsWithPhase = allLogs.map((log) => {
    let phaseKey = null
    let cycleDay = null
    if (lastPeriodStart && log.date) {
      const start = new Date(`${lastPeriodStart}T00:00:00`)
      const cur = new Date(`${log.date}T00:00:00`)
      const diff = Math.floor((cur - start) / 86400000)
      if (!isNaN(diff)) {
        cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1
        phaseKey = getPhaseForDay(cycleDay, cycleLength, periodLength)
      }
    }
    return { ...log, phaseKey, cycleDay }
  })

  // Cramps check
  const crampLogs = logsWithPhase.filter((l) => Array.isArray(l.symptoms) && l.symptoms.includes('Cramps'))
  if (crampLogs.length >= 2) {
    const earlyMenstrualCramps = crampLogs.filter((l) => l.cycleDay != null && l.cycleDay <= 2)
    if (earlyMenstrualCramps.length >= 2 && earlyMenstrualCramps.length / crampLogs.length >= 0.5) {
      patterns.push({
        type: 'SYMPTOMS',
        title: 'Cramps & Menstrual Phase',
        body: 'Cramps appeared most often during your first two menstrual days.',
        confidence: crampLogs.length >= 6 ? 'High' : crampLogs.length >= 3 ? 'Moderate' : 'Early pattern',
      })
    } else {
      patterns.push({
        type: 'SYMPTOMS',
        title: 'Recurring Symptom',
        body: `Cramps were logged across ${crampLogs.length} entries as your most frequent symptom.`,
        confidence: crampLogs.length >= 5 ? 'High' : 'Moderate',
      })
    }
  } else {
    // Check most frequent symptom
    const symMap = {}
    logsWithPhase.forEach((l) => {
      if (Array.isArray(l.symptoms)) {
        l.symptoms.forEach((s) => {
          if (s && s !== 'None') symMap[s] = (symMap[s] || 0) + 1
        })
      }
    })
    const topSym = Object.entries(symMap).sort((a, b) => b[1] - a[1])[0]
    if (topSym && topSym[1] >= 3) {
      patterns.push({
        type: 'SYMPTOMS',
        title: `${topSym[0]} Frequency`,
        body: `${topSym[0]} appeared in ${topSym[1]} of your logged check-ins.`,
        confidence: topSym[1] >= 6 ? 'High' : 'Moderate',
      })
    }
  }

  // 2. Energy & Sleep correlation
  const validSleepEnergyLogs = logsWithPhase.filter(
    (l) => l.sleep != null && l.sleep !== '' && l.energy
  )
  if (validSleepEnergyLogs.length >= 4) {
    const avgSleepAll = validSleepEnergyLogs.reduce((acc, l) => acc + Number(l.sleep), 0) / validSleepEnergyLogs.length
    const lowEnergyLogs = validSleepEnergyLogs.filter((l) => ['very low', 'low'].includes(String(l.energy).toLowerCase()))
    const lowEnergyShorterSleep = lowEnergyLogs.filter((l) => Number(l.sleep) < avgSleepAll)

    if (lowEnergyLogs.length >= 2 && lowEnergyShorterSleep.length / lowEnergyLogs.length >= 0.6) {
      patterns.push({
        type: 'ENERGY',
        title: 'Energy & Sleep Baseline',
        body: 'Lower energy was more frequently logged on days with shorter sleep than your usual baseline.',
        confidence: lowEnergyLogs.length >= 5 ? 'High' : 'Moderate',
      })
    } else {
      // Check follicular energy
      const follicularLogs = validSleepEnergyLogs.filter((l) => l.phaseKey === 'follicular')
      const highEnergyFollicular = follicularLogs.filter((l) => ['high', 'very high', 'above average'].includes(String(l.energy).toLowerCase()))
      if (follicularLogs.length >= 2 && highEnergyFollicular.length / follicularLogs.length >= 0.5) {
        patterns.push({
          type: 'ENERGY',
          title: 'Follicular Energy',
          body: 'Your energy tends to be higher during your follicular phase.',
          confidence: 'Moderate',
        })
      }
    }
  }

  // 3. Sleep pattern
  const sleepLogs = allLogs.filter((l) => l.sleep != null && l.sleep !== '')
  if (sleepLogs.length >= 3) {
    const avgSleep = (sleepLogs.reduce((acc, l) => acc + Number(l.sleep), 0) / sleepLogs.length).toFixed(1)
    patterns.push({
      type: 'SLEEP',
      title: 'Sleep Baseline',
      body: `Your logged sleep has averaged ${avgSleep} hours across your tracked days.`,
      confidence: sleepLogs.length >= 10 ? 'High' : 'Moderate',
    })
  }

  // 4. Mood stability pattern
  const moodLogs = allLogs.filter((l) => l.mood || (Array.isArray(l.moods) && l.moods.length > 0))
  if (moodLogs.length >= 3) {
    const calmGoodMoods = moodLogs.filter((l) => {
      const m = (l.mood || l.moods?.[0] || '').toLowerCase()
      return ['good', 'great', 'calm', 'happy', 'okay', 'neutral'].includes(m)
    })
    if (calmGoodMoods.length / moodLogs.length >= 0.7) {
      patterns.push({
        type: 'MOOD',
        title: 'Mood Consistency',
        body: 'Your logged mood has remained relatively stable across recent entries.',
        confidence: moodLogs.length >= 8 ? 'High' : 'Moderate',
      })
    } else {
      patterns.push({
        type: 'MOOD',
        title: 'Mood Tracking',
        body: `You have recorded mood on ${moodLogs.length} check-ins, helping build your emotional wellbeing timeline.`,
        confidence: 'Early pattern',
      })
    }
  }

  if (patterns.length === 0) {
    return {
      hasPatterns: false,
      message: 'More tracking is needed before Saathi can identify a reliable personal pattern.',
      patterns: [],
    }
  }

  return {
    hasPatterns: true,
    patterns: patterns.slice(0, 4),
  }
}

/**
 * Summarizes recorded relief methods from the `relief` field in health logs.
 * Adheres strictly to phrasing: "Logged as helpful X times" without claiming false causation.
 */
export function summarizeHelpfulRelief(logs = []) {
  const reliefCounts = {}

  logs.forEach((log) => {
    if (Array.isArray(log.relief)) {
      log.relief.forEach((item) => {
        if (item && item !== 'None' && item !== 'Other') {
          reliefCounts[item] = (reliefCounts[item] || 0) + 1
        }
      })
    }
    if (log.otherRelief) {
      reliefCounts[log.otherRelief] = (reliefCounts[log.otherRelief] || 0) + 1
    }
  })

  const entries = Object.entries(reliefCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([method, count]) => ({
      method,
      count,
      label: count === 1 ? 'Logged 1 time' : `Logged on ${count} days`,
    }))

  if (entries.length === 0) {
    return {
      hasReliefData: false,
      message: 'No helpful patterns recorded yet.',
      items: [],
    }
  }

  return {
    hasReliefData: true,
    items: entries.slice(0, 4),
  }
}

/**
 * Generates a concise deterministic monthly summary synthesizing key metrics.
 * Strictly non-diagnostic, non-causal, factual.
 */
export function generateMonthlySummary({
  monthLabel,
  snapshot,
  symptomsBreakdown,
  comparison,
  patternsResult,
  reliefSummary,
}) {
  const { loggedDaysCount, averagePain, rawAvgPain } = snapshot
  const totalLogged = loggedDaysCount || 0

  if (totalLogged === 0) {
    return `No check-ins were recorded for ${monthLabel}. Log daily health check-ins during your cycle to generate a personalized monthly summary.`
  }

  const sentences = []

  // Cycle stability sentence
  sentences.push(`You logged ${totalLogged} ${totalLogged === 1 ? 'day' : 'days'} of health data in ${monthLabel}.`)

  // Symptom sentence
  if (symptomsBreakdown?.symptoms?.length > 0) {
    const top = symptomsBreakdown.symptoms[0]
    sentences.push(`${top.name} was your most frequently logged symptom (${top.count} ${top.count === 1 ? 'day' : 'days'}).`)
  }

  // Baseline / changes sentence
  if (comparison?.hasBaseline && comparison.whatChanged && comparison.whatChanged !== 'Your logged metrics this month remained consistent with your usual baseline, with no major variations observed.') {
    sentences.push(comparison.whatChanged)
  } else if (rawAvgPain != null) {
    sentences.push(`Your average reported pain for the month was ${averagePain}.`)
  }

  // Relief sentence
  if (reliefSummary?.hasReliefData && reliefSummary.items.length > 0) {
    const topRelief = reliefSummary.items[0]
    sentences.push(`${topRelief.method} was noted as a helpful relief method on ${topRelief.count} ${topRelief.count === 1 ? 'day' : 'days'}.`)
  }

  return sentences
}
