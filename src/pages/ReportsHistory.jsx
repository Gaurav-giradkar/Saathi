import React, { useEffect, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import StatCard from '../components/common/StatCard.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { FileText } from 'lucide-react'
import { CycleLengthChart, PainTrendChart } from '../components/charts/TrendChart.jsx'
import { getReportsData } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'
import { MOOD_OPTIONS } from '../data/mockData.js'

export default function ReportsHistory() {
  const [data, setData] = useState(null)
  const { showToast } = useApp()

  useEffect(() => {
    getReportsData().then(setData)
  }, [])

  if (!data) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Reports & history</h1>
          <p className="text-ink-500 text-sm mt-1">A downloadable summary of your cycle and health trends.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={() => showToast('Print dialog would open here', 'info')}>Print</Button>
          <Button size="sm" icon={Download} onClick={() => showToast('Report downloaded (demo)', 'success')}>Download PDF</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Current cycle day" value={data.cycleInfo.cycleDay} accent="rose" />
        <StatCard label="Avg. cycle length" value={`${Math.round(data.history.reduce((a, h) => a + h.length, 0) / data.history.length)} days`} accent="teal" />
        <StatCard label="Logged days" value={data.logs.length} accent="plum" />
      </div>

      <Card>
        <h2 className="font-display font-semibold text-ink-900 text-lg mb-1">Cycle length history</h2>
        <CycleLengthChart data={data.history} />
      </Card>

      <Card>
        <h2 className="font-display font-semibold text-ink-900 text-lg mb-1">Pain trend</h2>
        <PainTrendChart data={data.painTrend} />
      </Card>

      <Card padded={false}>
        <div className="px-5 sm:px-6 py-4 border-b border-ink-100">
          <h2 className="font-display font-semibold text-ink-900 text-lg">Symptom log</h2>
        </div>
        {data.logs.length === 0 ? (
          <EmptyState icon={FileText} title="No logs yet" description="Daily check-ins will appear here once you start tracking." />
        ) : (
          <div className="divide-y divide-ink-100">
            {data.logs.map((log) => {
              const mood = MOOD_OPTIONS.find((m) => m.key === log.mood)
              return (
                <div key={log.date} className="px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-medium text-ink-800">
                    {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <span>Pain {log.pain}/10</span>
                    <span>{mood ? `${mood.emoji} ${mood.label}` : '—'}</span>
                    <span>{log.symptoms?.length || 0} symptoms</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
