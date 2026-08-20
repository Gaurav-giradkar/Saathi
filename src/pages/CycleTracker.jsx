import React, { useEffect, useState } from 'react'
import { CalendarDays, TrendingUp, Droplets, Repeat } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import CycleCalendar from '../components/calendar/CycleCalendar.jsx'
import { getCycleData, getHealthLogs } from '../data/api.js'

export default function CycleTracker() {
  const [cycle, setCycle] = useState(null)
  const [healthLogs, setHealthLogs] = useState({})

  useEffect(() => {
    getCycleData().then(setCycle)
    getHealthLogs().then(setHealthLogs).catch(() => setHealthLogs({}))
  }, [])

  if (!cycle) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading…
      </div>
    )
  }

  const avgLength = Math.round(
    cycle.history.reduce((a, h) => a + h.length, 0) /
    cycle.history.length
  )

  const currentPhaseLabel =
    cycle.phase?.label ||
    (cycle.phaseKey
      ? String(cycle.phaseKey).charAt(0).toUpperCase() + String(cycle.phaseKey).slice(1)
      : null)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
            Cycle Tracker
          </h1>

          <p className="text-ink-500 text-sm mt-1">
            Cycle predictions are estimates and may vary from cycle to cycle.
          </p>
        </div>

      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Cycle Day"
          value={cycle.cycleDay}
          sublabel="Current cycle"
          accent="rose"
        />

        <StatCard
          icon={Droplets}
          label="Period Length"
          value={`${cycle.periodLength} days`}
          sublabel="Recorded duration"
          accent="plum"
        />

        <StatCard
          icon={Repeat}
          label="Avg. Cycle Length"
          value={`${avgLength} days`}
          sublabel="Cycle average"
          accent="teal"
        />

        <StatCard
          icon={TrendingUp}
          label="Ovulation Day"
          value={`Day ${cycle.ovulationDay}`}
          sublabel="Estimated"
          accent="amber"
        />
      </div>

      <div className="w-full">
        <Card className="!p-6 sm:!p-8 rounded-3xl overflow-hidden relative border border-ink-100/80 bg-white/95 shadow-soft">
          <CycleCalendar cycleSetup={cycle} healthLogs={healthLogs} />
        </Card>
      </div>
    </div>
  )
}