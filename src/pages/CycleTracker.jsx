import React, { useEffect, useState } from 'react'
import { CalendarDays, TrendingUp, Droplets, Repeat } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import CycleCalendar from '../components/calendar/CycleCalendar.jsx'
import { CycleLengthChart } from '../components/charts/TrendChart.jsx'
import { getCycleData } from '../data/api.js'

export default function CycleTracker() {
  const [cycle, setCycle] = useState(null)

  useEffect(() => {
    getCycleData().then(setCycle)
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

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          Cycle Tracker
        </h1>

        <p className="text-ink-500 text-sm mt-1">
          Cycle predictions are estimates and may vary from cycle to cycle.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Cycle Day"
          value={cycle.cycleDay}
          accent="rose"
          labelClassName="font-bold"
        />

        <StatCard
          icon={Droplets}
          label="Period Length"
          value={`${cycle.periodLength} days`}
          accent="plum"
          labelClassName="font-bold"
        />

        <StatCard
          icon={Repeat}
          label="Avg. Cycle Length"
          value={`${avgLength} days`}
          accent="teal"
          labelClassName="font-bold"
        />

        <StatCard
          icon={TrendingUp}
          label="Ovulation Day"
          value={`Day ${cycle.ovulationDay}`}
          accent="amber"
          labelClassName="font-bold"
        />
      </div>

      <div className="max-w-[780px]">
        <Card className="py-4">
          <CycleCalendar cycleSetup={cycle} />
        </Card>
      </div>
    </div>
  )
}