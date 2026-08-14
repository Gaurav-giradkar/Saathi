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

  if (!cycle) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  const avgLength = Math.round(cycle.history.reduce((a, h) => a + h.length, 0) / cycle.history.length)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Cycle tracker</h1>
        <p className="text-ink-500 text-sm mt-1">A note: this is an estimation and your unique cycle may vary.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Cycle day" value={cycle.cycleDay} accent="rose" />
        <StatCard icon={Droplets} label="Period length" value={`${cycle.periodLength} days`} accent="plum" />
        <StatCard icon={Repeat} label="Avg. cycle length" value={`${avgLength} days`} accent="teal" />
        <StatCard icon={TrendingUp} label="Ovulation day" value={`Day ${cycle.ovulationDay}`} accent="amber" />
      </div>

      <Card>
        <CycleCalendar cycleSetup={cycle} />
      </Card>

      <Card>
        <h2 className="font-display font-semibold text-ink-900 text-lg mb-1">Cycle history</h2>
        <p className="text-sm text-ink-500 mb-4">Length of your last {cycle.history.length} cycles, in days.</p>
        <CycleLengthChart data={cycle.history} />
      </Card>
    </div>
  )
}
