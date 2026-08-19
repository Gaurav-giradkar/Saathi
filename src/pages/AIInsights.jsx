import React, { useEffect, useState } from 'react'
import { Sparkles, CalendarClock } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import InsightCard from '../components/common/InsightCard.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import { PainTrendChart } from '../components/charts/TrendChart.jsx'
import { getInsights } from '../data/api.js'

export default function AIInsights() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getInsights().then(setData)
  }, [])

  if (!data) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Saathi AI</h1>
          <p className="text-ink-500 text-sm mt-1">Generated from your logged patterns — always demo data here.</p>
        </div>
      
      </div>

      <Card className="flex items-center gap-4 bg-rose-50/60 border-rose-100">
        <div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
          <CalendarClock size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Cycle prediction</p>
          <p className="text-sm text-ink-800 font-medium">
            Next period expected in {data.cycleInfo.daysUntilNextPeriod} days, around{' '}
            {new Date(data.cycleInfo.nextPeriodDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-plum-500" />
          <h2 className="font-display font-semibold text-ink-900 text-lg">Personalized insights</h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">Patterns, trends, and anomalies detected from your check-ins.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.insights.map((ins) => (
            <InsightCard key={ins.id} type={ins.type} title={ins.title} body={ins.body} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display font-semibold text-ink-900 text-lg mb-1">Pain trend across recent cycles</h2>
        <p className="text-sm text-ink-500 mb-4">Average reported pain, cycle over cycle.</p>
        <PainTrendChart data={data.painTrend} />
      </Card>
    </div>
  )
}
