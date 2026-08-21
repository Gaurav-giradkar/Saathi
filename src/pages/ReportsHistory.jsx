import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  CalendarDays,
  Download,
  Printer,
  ChevronRight,
  Activity,
  HeartPulse,
  Sparkles,
  Smile,
  Droplets,
  Dumbbell,
  Moon,
  Info,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'

import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import DayDetailModal from '../components/reports/DayDetailModal.jsx'
import { CycleLengthChart } from '../components/charts/TrendChart.jsx'

import {
  generateMonthlyAISummary,
  getMonthlyAISummary,
  getDailyAISummary,
  getReportsData,
} from '../data/api.js'

import { useApp } from '../context/AppContext.jsx'
import { MOOD_OPTIONS, PHASES } from '../data/mockData.js'

import {
  getAvailableReportMonths,
  filterLogsByMonth,
  calculateMonthlySnapshot,
  calculatePhaseDistribution,
  calculateCycleLengthSummary,
  calculateSymptomBreakdown,
  calculateBaseline,
  compareWithBaseline,
  detectPersonalPatterns,
  summarizeHelpfulRelief,
  generateMonthlySummary,
} from '../utils/reportAnalysis.js'

export default function ReportsHistory() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [periodRange, setPeriodRange] = useState('monthly') // 'monthly' | '3months' | '6months'
  const [symptomFilter, setSymptomFilter] = useState('All')
  const [selectedDayLog, setSelectedDayLog] = useState(null)
  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [monthlyAiSummary, setMonthlyAiSummary] = useState(null)
  const [generatingMonthly, setGeneratingMonthly] = useState(false)
  const [dailyAiSummary, setDailyAiSummary] = useState(null)
  const [loadingDailySummary, setLoadingDailySummary] = useState(true)

  const { showToast } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getReportsData()
      .then((res) => {
        setData(res || { cycleInfo: {}, history: [], logs: [], painTrend: [] })
      })
      .catch((err) => {
        console.error('Error fetching reports data:', err)
        setData({ cycleInfo: {}, history: [], logs: [], painTrend: [] })
        showToast('Using local history view.', 'info')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

    // Check for cached Monthly AI Summary (Strictly NO automatic generation on load)
    useEffect(() => {
      if (selectedMonth) {
        getMonthlyAISummary(selectedMonth)
          .then((res) => {
            console.log('[Reports] Loaded cached monthly AI summary for', selectedMonth, ':', {
              hasSummary: Boolean(res?.summary),
              keyPointsCount: res?.keyPoints?.length || 0,
            })
            setMonthlyAiSummary(res)
          })
          .catch(() => setMonthlyAiSummary(null))
      }
    }, [selectedMonth])

  // Load today's cached Daily AI Summary (no automatic Gemini generation here)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)

    setLoadingDailySummary(true)

    getDailyAISummary(today)
      .then((res) => {
        console.log('[Reports] Loaded cached daily AI summary:', {
          date: today,
          hasSummary: Boolean(res?.summary),
          keyPointsCount: res?.keyPoints?.length || 0,
        })

        setDailyAiSummary(res || null)
      })
      .catch((err) => {
        console.error('[Reports] Failed to load daily AI summary:', err)
        setDailyAiSummary(null)
      })
      .finally(() => {
        setLoadingDailySummary(false)
      })
  }, [])

  // User-triggered generator
  const handleGenerateMonthlySummary = async () => {
    setGeneratingMonthly(true)
    try {
      console.log('[Reports] Triggering monthly AI summary generation for', selectedMonth)
      const result = await generateMonthlyAISummary(selectedMonth, {
        cycle: data?.cycleInfo || {},
        entries: monthLogs,
        trends: {
          snapshot,
          symptomsBreakdown,
          comparison,
          patternsResult,
          reliefSummary,
        },
      })
      console.log('[Reports] Received generated monthly AI summary:', {
        month: selectedMonth,
        hasSummary: Boolean(result?.summary),
        keyPointsCount: result?.keyPoints?.length || 0,
        patternsCount: result?.patterns?.length || 0,
      })
      setMonthlyAiSummary(result)
      showToast('Monthly AI summary updated', 'success')
    } catch (err) {
      console.error('[Reports] Error generating monthly summary:', err)
      showToast('Could not generate AI summary. Showing local analysis.', 'error')
    } finally {
      setGeneratingMonthly(false)
    }
  }

  // Month options (at least 12 previous months)
  const availableMonths = useMemo(() => {
    return getAvailableReportMonths(new Date(), data?.logs || [], data?.history || [])
  }, [data])

  // Selected Month label (e.g., "August 2026")
  const currentMonthLabel = useMemo(() => {
    const found = availableMonths.find((m) => m.value === selectedMonth)
    if (found) return found.label
    const [y, m] = selectedMonth.split('-').map(Number)
    const dateObj = new Date(y, m - 1, 1)
    return dateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  }, [selectedMonth, availableMonths])

  // Filtered health logs for the selected month
  const monthLogs = useMemo(() => {
    return filterLogsByMonth(data?.logs || [], selectedMonth)
  }, [data, selectedMonth])

  const todayDate = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  )

  const todayLog = useMemo(
    () => (data?.logs || []).find((log) => log.date === todayDate),
    [data, todayDate]
  )
  // Monthly Snapshot metrics (6 compact cards)
  const snapshot = useMemo(() => {
    return calculateMonthlySnapshot(monthLogs, data?.cycleInfo || {}, data?.logs || [], selectedMonth)
  }, [monthLogs, data, selectedMonth])

  // Cycle at a glance phase timeline
  const phaseDist = useMemo(() => {
    return calculatePhaseDistribution(
      selectedMonth,
      data?.cycleInfo || {}
    )
  }, [selectedMonth, data])

  // Cycle length over time summary & chart data
  const cycleSummary = useMemo(() => {
    return calculateCycleLengthSummary(data?.history || [])
  }, [data])

  // Personal patterns detected from real data
  const patternsResult = useMemo(() => {
    return detectPersonalPatterns(data?.logs || [], data?.cycleInfo || {})
  }, [data])

  // Baseline and comparison
  const baseline = useMemo(() => {
    return calculateBaseline(data?.logs || [], selectedMonth, data?.history || [], data?.cycleInfo || {})
  }, [data, selectedMonth])

  const comparison = useMemo(() => {
    return compareWithBaseline(monthLogs, baseline, data?.cycleInfo || {})
  }, [monthLogs, baseline, data])

  // Symptom trends breakdown
  const symptomsBreakdown = useMemo(() => {
    return calculateSymptomBreakdown(monthLogs, symptomFilter)
  }, [monthLogs, symptomFilter])

  // Helpful relief summary
  const reliefSummary = useMemo(() => {
    return summarizeHelpfulRelief(monthLogs.length > 0 ? monthLogs : data?.logs || [])
  }, [monthLogs, data])

  // Saathi's Monthly Narrative Summary
  const monthlySummaryText = useMemo(() => {
    return generateMonthlySummary({
      monthLabel: currentMonthLabel,
      snapshot,
      symptomsBreakdown,
      comparison,
      patternsResult,
      reliefSummary,
    })
  }, [currentMonthLabel, snapshot, symptomsBreakdown, comparison, patternsResult, reliefSummary])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    showToast('Select "Save as PDF" in the destination menu.', 'info')
    window.print()
  }

  const handleDayClick = (log) => {
    setSelectedDayLog(log)
    setDayModalOpen(true)
  }

  if (loading && !data) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Generating your personal health report…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">

      {/* Print-only Header Banner */}
      <div className="print-only-header">
        <h1 className="font-display text-2xl font-bold text-ink-900">Saathi — Personal Health Report</h1>
        <p className="text-sm text-ink-500 mt-1">
          Report for <strong className="text-ink-800">{currentMonthLabel}</strong> • Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ==================================================
          1. PAGE HEADER
          ================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ink-100/60 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Reports & History
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Your cycle, wellbeing patterns, and personal insights.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 no-print">
          {/* Month Selector */}
          <div className="relative inline-block">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select report month"
              className="appearance-none bg-surface border border-ink-100/90 text-ink-800 font-semibold text-sm rounded-full pl-4 pr-9 py-2 shadow-xs hover:border-brand-coral/60 focus:outline-none focus:ring-4 focus:ring-rose-100 cursor-pointer transition"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
            className="!border-ink-200 !text-ink-700 hover:!bg-ink-100 hover:!text-ink-900"
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* ==================================================
          2. REPORT PERIOD SELECTOR
          ================================================== */}
      <div className="flex items-center gap-2 no-print">
        <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider mr-1">Period:</span>
        <div className="inline-flex p-1 bg-ink-100/60 rounded-full text-xs font-semibold text-ink-600">
          <button
            type="button"
            onClick={() => setPeriodRange('monthly')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              periodRange === 'monthly'
                ? 'bg-surface text-ink-900 shadow-xs font-bold'
                : 'hover:text-ink-800'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            disabled
            title="Multi-month period analytics coming in a future update"
            className="px-3.5 py-1.5 rounded-full text-ink-300 cursor-not-allowed opacity-60"
          >
            3 Months
          </button>
          <button
            type="button"
            disabled
            title="Multi-month period analytics coming in a future update"
            className="px-3.5 py-1.5 rounded-full text-ink-300 cursor-not-allowed opacity-60"
          >
            6 Months
          </button>
        </div>
        <span className="text-xs text-ink-400 ml-2 hidden sm:inline">
          Showing: <strong className="text-ink-700">{currentMonthLabel}</strong>
        </span>
      </div>

      {/* ==================================================
          3. MONTHLY SNAPSHOT (6 Compact Cards)
          ================================================== */}
      <section aria-labelledby="snapshot-heading">
        <h2 id="snapshot-heading" className="sr-only">Monthly Snapshot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

          {/* 1. Current Cycle */}
          <Card padded={false} className="p-3.5 sm:p-4 bg-surface flex flex-col justify-between border-rose-100/70 hover:border-rose-200 transition">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-500">
              Current Cycle
            </p>
            <p className="text-base sm:text-lg font-display font-bold text-ink-900 mt-1 truncate">
              {snapshot.currentCycle}
            </p>
          </Card>

          {/* 2. Cycle Length */}
          <Card padded={false} className="p-3.5 sm:p-4 bg-surface flex flex-col justify-between border-plum-100/70 hover:border-plum-200 transition">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-plum-500">
              Cycle Length
            </p>
            <p className="text-base sm:text-lg font-display font-bold text-ink-900 mt-1 truncate">
              {snapshot.cycleLength}
            </p>
          </Card>

          {/* 3. Period Length */}
          <Card padded={false} className="p-3.5 sm:p-4 bg-surface flex flex-col justify-between border-rose-100/70 hover:border-rose-200 transition">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-500">
              Period Length
            </p>
            <p className="text-base sm:text-lg font-display font-bold text-ink-900 mt-1 truncate">
              {snapshot.periodLength}
            </p>
          </Card>

          {/* 4. Logged Days */}
          <Card padded={false} className="p-3.5 sm:p-4 bg-surface flex flex-col justify-between border-teal-100/70 hover:border-teal-200 transition">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-600">
              Logged Days
            </p>
            <p className="text-base sm:text-lg font-display font-bold text-ink-900 mt-1 truncate">
              {snapshot.loggedDays}
            </p>
          </Card>

          {/* 5. Average Pain */}
          <Card padded={false} className="p-3.5 sm:p-4 bg-surface flex flex-col justify-between border-amber-100/70 hover:border-amber-200 transition">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600">
              Average Pain
            </p>
            <p className="text-base sm:text-lg font-display font-bold text-ink-900 mt-1 truncate">
              {snapshot.averagePain}
            </p>
          </Card>

          {/* 6. Most Common Symptom */}
          <Card padded={false} className="p-3.5 sm:p-4 bg-surface flex flex-col justify-between border-plum-100/70 hover:border-plum-200 transition">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-plum-500">
              Common Symptom
            </p>
            <p className="text-base sm:text-lg font-display font-bold text-ink-900 mt-1 truncate" title={snapshot.mostCommonSymptom}>
              {snapshot.mostCommonSymptom}
            </p>
          </Card>

        </div>
      </section>

      {/* ==================================================
          4. CYCLE AT A GLANCE (Horizontal Phase Timeline)
          ================================================== */}
      <Card className="!p-5 sm:!p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">
              Cycle at a glance
            </h2>
            <p className="text-ink-500 text-xs sm:text-sm mt-0.5">
              How {currentMonthLabel} fits into your cycle phases.
            </p>
          </div>

          {/* Phase Legend */}
          <div className="flex items-center flex-wrap gap-2.5 text-xs text-ink-600 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E85D75]" />
              Menstrual
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4FA89B]" />
              Follicular
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8A94A]" />
              Ovulation
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B5B95]" />
              Luteal
            </span>
          </div>
        </div>

        {phaseDist.hasCycleSetup ? (
          <div>
            {/* Timeline Segment Bar */}
            <div className="h-5 w-full rounded-full overflow-hidden flex bg-ink-100/60 shadow-inner">
              {phaseDist.timelineSegments.map((seg, idx) => (
                <div
                  key={`${seg.phaseKey}-${idx}`}
                  style={{
                    width: `${(seg.dayCount / phaseDist.daysInMonth) * 100}%`,
                    backgroundColor: seg.phaseMeta?.color || '#6B5B95',
                  }}
                  title={`${seg.phaseMeta?.label}: Days ${seg.startDay}–${seg.endDay} of ${currentMonthLabel} (Cycle Days ${seg.startCycleDay}–${seg.endCycleDay})`}
                  className="h-full transition-all hover:opacity-90 relative group"
                />
              ))}
            </div>

            {/* Phase distribution day breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-ink-100/70">

              <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100/80">
                <p className="text-[11px] font-semibold text-rose-700">
                  Menstrual
                </p>
                <p className="text-base font-bold text-ink-900 mt-0.5">
                  {phaseDist.phaseCounts.menstrual}{' '}
                  {phaseDist.phaseCounts.menstrual === 1 ? 'day' : 'days'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-100/80">
                <p className="text-[11px] font-semibold text-teal-700">
                  Follicular
                </p>
                <p className="text-base font-bold text-ink-900 mt-0.5">
                  {phaseDist.phaseCounts.follicular}{' '}
                  {phaseDist.phaseCounts.follicular === 1 ? 'day' : 'days'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100/80">
                <p className="text-[11px] font-semibold text-amber-700">
                  Ovulation
                </p>
                <p className="text-base font-bold text-ink-900 mt-0.5">
                  {phaseDist.phaseCounts.ovulation}{' '}
                  {phaseDist.phaseCounts.ovulation === 1 ? 'day' : 'days'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-plum-50/50 border border-plum-100/80">
                <p className="text-[11px] font-semibold text-plum-700">
                  Luteal
                </p>
                <p className="text-base font-bold text-ink-900 mt-0.5">
                  {phaseDist.phaseCounts.luteal}{' '}
                  {phaseDist.phaseCounts.luteal === 1 ? 'day' : 'days'}
                </p>
              </div>

            </div>

         
          </div>
        ) : (
          <div className="p-5 text-center text-xs text-ink-500 bg-ink-50/40 rounded-xl">
            Set up your cycle start date and cycle length to display your monthly phase timeline.
          </div>
        )}
      </Card>

      {/* ==================================================
          5. CYCLE LENGTH OVER TIME & YOUR PERSONAL PATTERNS
          ================================================== */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* 5. Cycle Length Over Time */}
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">
              Cycle length over time
            </h2>
            <p className="text-ink-500 text-xs sm:text-sm mt-0.5 mb-3">
              How your recent cycles compare.
            </p>

            <CycleLengthChart data={cycleSummary.chartData} />
          </div>

          <div className="mt-4 pt-3 border-t border-ink-100/70">
            <div className="flex items-start gap-2 text-xs text-ink-600">
              <Sparkles size={14} className="text-plum-500 shrink-0 mt-0.5" />
              <p className="font-medium">{cycleSummary.interpretation}</p>
            </div>
          </div>
        </Card>

        {/* 6. Your Personal Patterns */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-semibold text-ink-900 text-lg">
                Your personal patterns
              </h2>
              <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
                History Insights
              </span>
            </div>
            <p className="text-ink-500 text-xs sm:text-sm mb-3">
              Patterns Saathi has noticed from your tracking history.
            </p>

            {patternsResult.hasPatterns ? (
              <div className="space-y-2.5">
                {patternsResult.patterns.map((pat, idx) => {
                  const confBadges = {
                    'High': 'bg-teal-50 text-teal-700 border-teal-200',
                    'Moderate': 'bg-plum-50 text-plum-700 border-plum-200',
                    'Early pattern': 'bg-amber-50 text-amber-700 border-amber-200',
                  }
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-ink-100/90 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                          {pat.type}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${confBadges[pat.confidence] || 'bg-ink-50 text-ink-600'}`}>
                          {pat.confidence}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-ink-800 font-medium leading-snug">
                        "{pat.body}"
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-ink-50/40 rounded-xl">
                <p className="text-xs text-ink-500 font-medium leading-relaxed">
                  {patternsResult.message}
                </p>
                <p className="text-[11px] text-ink-400 mt-2">
                  Keep checking in daily to help Saathi uncover your wellbeing trends.
                </p>
              </div>
            )}
          </div>

          <p className="text-[11px] text-ink-400 mt-3">
            * Patterns are observational summaries from your logged history, not medical advice.
          </p>
        </Card>

      </div>

      {/* ==================================================
          7. THIS MONTH VS YOUR USUAL (Comparison Table)
          ================================================== */}
      <Card>
        <div className="mb-4">
          <h2 className="font-display font-semibold text-ink-900 text-lg">
            This month vs your usual
          </h2>
          <p className="text-ink-500 text-xs sm:text-sm mt-0.5">
            Comparing {currentMonthLabel} with your prior historical baseline.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-ink-100 text-xs font-semibold uppercase tracking-wider text-ink-400">
                <th className="pb-2.5 font-bold">Metric</th>
                <th className="pb-2.5 font-bold">Your Usual</th>
                <th className="pb-2.5 font-bold">This Month</th>
                <th className="pb-2.5 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100/70">
              {comparison.rows.map((row) => {
                const statusStyles = {
                  'Above usual': 'bg-plum-50 text-plum-700 border border-plum-200',
                  'Below usual': 'bg-teal-50 text-teal-700 border border-teal-200',
                  'Similar': 'bg-ink-50 text-ink-600 border border-ink-200/60',
                  'No baseline': 'bg-ink-50 text-ink-400 border border-ink-200/50',
                }
                return (
                  <tr key={row.metric} className="hover:bg-ink-50/40 transition-colors">
                    <td className="py-2.5 font-semibold text-ink-800">{row.metric}</td>
                    <td className="py-2.5 text-ink-600 font-medium">{row.usual}</td>
                    <td className="py-2.5 text-ink-900 font-bold">{row.thisMonth}</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status] || ''}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* What Changed subsection */}
        <div className="mt-4 pt-3.5 border-t border-ink-100 bg-rose-50/30 rounded-xl p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            What Changed
          </p>
          <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-medium">
            {comparison.whatChanged}
          </p>
        </div>
      </Card>

      {/* ==================================================
          8. SYMPTOM TRENDS & 10. WHAT HAS HELPED YOU
          ================================================== */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* 8. Symptom Trends */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="font-display font-semibold text-ink-900 text-lg">
                  Symptoms this month
                </h2>
                <p className="text-ink-500 text-xs sm:text-sm">
                  How often your symptoms appeared in {currentMonthLabel}.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1 bg-ink-100/60 p-0.5 rounded-full text-xs self-start no-print">
                {['All', 'Pain', 'Physical', 'Mood'].map((flt) => (
                  <button
                    key={flt}
                    type="button"
                    onClick={() => setSymptomFilter(flt)}
                    className={`px-2.5 py-1 rounded-full font-medium transition ${
                      symptomFilter === flt
                        ? 'bg-surface text-ink-900 shadow-xs font-bold'
                        : 'text-ink-500 hover:text-ink-800'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {symptomsBreakdown.symptoms.length > 0 ? (
              <div className="space-y-3 mt-4">
                {symptomsBreakdown.symptoms.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-ink-800">
                      <span className="capitalize">{item.name}</span>
                      <span className="text-ink-500">
                        {item.count} {item.count === 1 ? 'day' : 'days'} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-coral rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(8, item.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-ink-500 bg-ink-50/40 rounded-xl my-3">
                {monthLogs.length === 0
                  ? `No check-in logs recorded for ${currentMonthLabel}.`
                  : `No symptoms recorded under the "${symptomFilter}" category for this month.`}
              </div>
            )}
          </div>

          <p className="text-[11px] text-ink-400 mt-4">
            Percentage calculated over {symptomsBreakdown.totalLoggedDays} logged {symptomsBreakdown.totalLoggedDays === 1 ? 'day' : 'days'} this month.
          </p>
        </Card>

        {/* 10. What Has Helped You */}
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">
              What has helped you
            </h2>
            <p className="text-ink-500 text-xs sm:text-sm mt-0.5 mb-4">
              Things you have previously marked as helpful in your check-ins.
            </p>

            {reliefSummary.hasReliefData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reliefSummary.items.map((item) => (
                  <div
                    key={item.method}
                    className="p-3.5 rounded-xl bg-surface border border-ink-100/90 shadow-xs flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-plum-50 text-plum-600 flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink-900 truncate">
                        {item.method}
                      </p>
                      <p className="text-xs text-ink-500 font-medium mt-0.5">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            ) : (
              <div className="p-6 text-center text-xs text-ink-500 bg-ink-50/40 rounded-xl">
                {reliefSummary.message}
              </div>
            )}
          </div>

          <p className="text-[11px] text-ink-400 mt-4">
            * Relief items reflect logged habits and interventions from your check-ins.
          </p>
        </Card>

      </div>

      {/* ==================================================
    9. SAATHI'S DAILY SUMMARY
    ================================================== */}
    <Card className="!p-6 sm:!p-7 bg-gradient-to-br from-surface to-teal-50/20 border-teal-200/70 shadow-soft">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-soft">
          <Sparkles size={20} />
        </div>

        <div className="flex-1">
          <div className="mb-3">
            <h2 className="font-display font-bold text-ink-900 text-lg sm:text-xl">
              Saathi's daily summary
            </h2>

            <p className="text-ink-500 text-xs sm:text-sm mt-0.5">
              A personalized summary based on today's Health Tracker.
            </p>
          </div>

          {loadingDailySummary ? (
            <div className="py-7 flex flex-col items-center justify-center gap-2 text-center">
              <Sparkles size={22} className="text-teal-500 animate-pulse" />

              <p className="text-sm font-medium text-ink-700">
                Preparing today's summary…
              </p>

              <p className="text-xs text-ink-400">
                Saathi is analyzing today's check-in.
              </p>
            </div>
          ) : dailyAiSummary ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5">
                  Today's Summary
                </p>

                <p className="text-sm sm:text-base text-ink-800 leading-relaxed font-medium">
                  {dailyAiSummary.summary}
                </p>
              </div>

              {Array.isArray(dailyAiSummary.keyPoints) &&
                dailyAiSummary.keyPoints.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-1.5">
                      Today's Highlights
                    </p>

                    <ul className="space-y-1 text-xs sm:text-sm text-ink-700 list-disc list-inside">
                      {dailyAiSummary.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface border border-ink-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Pain
                  </p>
                  <p className="text-sm font-bold text-ink-900 mt-1">
                    {todayLog?.pain != null ? `${todayLog.pain}/10` : '—'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-ink-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Mood
                  </p>
                  <p className="text-sm font-bold text-ink-900 mt-1 truncate">
                    {(() => {
                      const moodMeta = MOOD_OPTIONS.find(
                        (m) =>
                          m.key ===
                          (todayLog?.mood || todayLog?.moods?.[0])?.toLowerCase()
                      )

                      return moodMeta
                        ? `${moodMeta.emoji} ${moodMeta.label}`
                        : todayLog?.moods?.[0] || '—'
                    })()}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-ink-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Sleep
                  </p>
                  <p className="text-sm font-bold text-ink-900 mt-1">
                    {todayLog?.sleep ? `${todayLog.sleep} hrs` : '—'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-ink-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Symptoms
                  </p>
                  <p className="text-sm font-bold text-ink-900 mt-1">
                    {todayLog
                      ? (todayLog.symptoms?.length || 0) +
                        (todayLog.otherSymptom ? 1 : 0)
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center bg-ink-50/40 rounded-xl">
              <p className="text-sm text-ink-600 font-medium">
                Today's AI summary is not available yet.
              </p>

              <p className="text-xs text-ink-400 mt-1">
                Complete and save today's Health Tracker to generate it.
              </p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-ink-100/70">
            <p className="text-[11px] text-ink-400 italic">
              * This summary is generated from today's logged observations.
            </p>
          </div>
        </div>
      </div>
    </Card>

      {/* ==================================================
          9. SYMPTOM HISTORY (Clickable Daily Log Rows)
          ================================================== */}
      <Card padded={false} className="overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-ink-100/80 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">
              Symptom history
            </h2>
            <p className="text-ink-500 text-xs sm:text-sm mt-0.5">
              Daily check-in logs for {currentMonthLabel}. Click a row to view full details.
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-500 bg-ink-100/70 px-2.5 py-1 rounded-full">
            {monthLogs.length} {monthLogs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {monthLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title={`No logs for ${currentMonthLabel}`}
              description="Daily check-ins logged for this month will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-ink-100/80">
            {monthLogs.map((log) => {
              const moodMeta = MOOD_OPTIONS.find(
                (m) => m.key === (log.mood || log.moods?.[0])?.toLowerCase()
              )
              const moodLabel = moodMeta ? `${moodMeta.emoji} ${moodMeta.label}` : (log.moods?.[0] || '—')
              const symptomsCount = (log.symptoms?.length || 0) + (log.otherSymptom ? 1 : 0)

              return (
                <div
                  key={log.date}
                  onClick={() => handleDayClick(log)}
                  className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap hover:bg-rose-50/30 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink-900 group-hover:text-rose-600 transition-colors">
                      {new Date(`${log.date}T00:00:00`).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {log.periodStatus && log.periodStatus !== 'none' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {log.periodStatus}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-ink-600 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-ink-400">Pain:</span>
                      <strong className="text-ink-800">{log.pain != null && log.pain !== '' ? `${log.pain}/10` : '—'}</strong>
                    </span>

                    <span className="hidden sm:inline-flex items-center gap-1">
                      <span className="text-ink-400">Mood:</span>
                      <strong className="text-ink-800">{moodLabel}</strong>
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <span className="text-ink-400">Symptoms:</span>
                      <strong className="text-ink-800">{symptomsCount}</strong>
                    </span>

                    {log.sleep && (
                      <span className="hidden md:inline-flex items-center gap-1">
                        <span className="text-ink-400">Sleep:</span>
                        <strong className="text-ink-800">{log.sleep}h</strong>
                      </span>
                    )}

                    <ChevronRight size={16} className="text-ink-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* ==================================================
          11. SAATHI'S MONTHLY SUMMARY (Highlighted Card)
          ================================================== */}
      <Card className="!p-6 sm:!p-7 bg-gradient-to-br from-surface to-rose-50/30 border-rose-200/80 shadow-soft">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-soft">
            <Sparkles size={20} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div>
                <h2 className="font-display font-bold text-ink-900 text-lg sm:text-xl">
                  Saathi's monthly summary
                </h2>
                <p className="text-ink-500 text-xs sm:text-sm mt-0.5">
                  A personalized summary for {currentMonthLabel}.
                </p>
              </div>

              <div className="no-print">
                {monthlyAiSummary ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    onClick={handleGenerateMonthlySummary}
                    disabled={generatingMonthly}
                  >
                    {generatingMonthly ? 'Regenerating…' : 'Regenerate Monthly Summary'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={handleGenerateMonthlySummary}
                    disabled={generatingMonthly}
                    className="!bg-rose-500 hover:!bg-rose-600 !text-white"
                  >
                    {generatingMonthly ? 'Generating…' : 'Generate Monthly Summary'}
                  </Button>
                )}
              </div>
            </div>

            {generatingMonthly ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-center animate-pulse">
                <Sparkles size={24} className="text-rose-500 animate-spin" />
                <p className="text-sm font-medium text-ink-700">
                  Generating AI monthly summary for {currentMonthLabel}…
                </p>
                <p className="text-xs text-ink-400">
                  Analyzing cycle patterns, comfort trends, and recorded check-ins.
                </p>
              </div>
            ) : monthlyAiSummary ? (
              <div className="text-sm sm:text-base text-ink-800 leading-relaxed mt-3 font-medium space-y-3">
                <p>{monthlyAiSummary.summary}</p>

                {Array.isArray(monthlyAiSummary.keyPoints) && monthlyAiSummary.keyPoints.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                      Key Highlights
                    </p>
                    <ul className="space-y-1 text-xs sm:text-sm text-ink-700 list-disc list-inside">
                      {monthlyAiSummary.keyPoints.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(monthlyAiSummary.patterns) && monthlyAiSummary.patterns.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">
                      Observed Patterns
                    </p>
                    <ul className="space-y-1 text-xs sm:text-sm text-ink-700 list-disc list-inside">
                      {monthlyAiSummary.patterns.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm sm:text-base text-ink-800 leading-relaxed mt-3 font-medium space-y-2">
                {monthlySummaryText.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-ink-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-ink-400 italic">
                * Saathi's summary is generated directly from your logged observations to assist you and your healthcare provider.
              </p>

              <Button
                variant="subtle"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/insights')}
                className="self-start sm:self-auto !text-rose-600 hover:!bg-rose-100/80 no-print"
              >
                Ask Saathi about this report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Day Detail Modal for Clicked Daily History Rows */}
      <DayDetailModal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        log={selectedDayLog}
        cycleInfo={data?.cycleInfo}
      />

    </div>
    
  )
}