import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock, Sparkles, Frown, Smile, Zap, Moon, Droplets, ArrowRight, ClipboardPlus,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import HealthMetricCard from '../components/common/HealthMetricCard.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import InsightCard from '../components/common/InsightCard.jsx'
import RecommendationCard from '../components/common/RecommendationCard.jsx'
import CycleRing from '../components/charts/CycleRing.jsx'
import Button from '../components/common/Button.jsx'
import {
  getUserData, getCycleData, getInsights, getRecommendations, getHealthData,
} from '../data/api.js'
import { MOOD_OPTIONS } from '../data/mockData.js'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const [cycle, setCycle] = useState(null)
  const [insights, setInsights] = useState(null)
  const [recs, setRecs] = useState(null)
  const [todayLog, setTodayLog] = useState(null)

  useEffect(() => {
    getUserData().then(setUser)
    getCycleData().then(setCycle)
    getInsights().then(setInsights)
    getRecommendations().then(setRecs)
    getHealthData().then(setTodayLog)
  }, [])

  if (!user || !cycle) {
    return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading your dashboard…</div>
  }

  const moodMeta = MOOD_OPTIONS.find((m) => m.key === todayLog?.mood)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Hello, {user.name || 'there'} 👋
          </h1>
          <p className="text-ink-500 text-sm mt-1">Here's where things stand today.</p>
        </div>
        <PhaseBadge phaseKey={cycle.phaseKey} />
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <Card className="flex flex-col items-center justify-center !p-8">
          <CycleRing
            cycleDay={cycle.cycleDay}
            cycleLength={cycle.cycleLength}
            periodLength={cycle.periodLength}
            phaseKey={cycle.phaseKey}
          />
          <p className="text-sm text-ink-600 font-medium mt-4">{cycle.phase.label} phase</p>
          <p className="text-xs text-ink-400 mt-1 text-center max-w-[220px]">{cycle.phase.desc}</p>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <StatCard icon={CalendarClock} label="Cycle Day" value={cycle.cycleDay} sublabel={`of ${cycle.cycleLength}-day cycle`} accent="rose" />
          <StatCard icon={Droplets} label="Next Period" value={`In ${cycle.daysUntilNextPeriod} days`} sublabel={formatDate(cycle.nextPeriodDate)} accent="plum" />
          <Card className="sm:col-span-2 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-0.5">Today's insight</p>
              <p className="text-sm text-ink-800 font-medium leading-relaxed">
                {insights?.insights?.[0]?.body || 'Your energy levels may improve — a good day for light exercise.'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink-900 text-lg">Quick health check</h2>
          <Link to="/daily-health" className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
            Log today <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <HealthMetricCard icon={Frown} label="Pain" value={todayLog?.pain ? `${todayLog.pain}/10` : '—'} accent="rose" />
          <HealthMetricCard icon={Smile} label="Mood" value={moodMeta ? `${moodMeta.emoji} ${moodMeta.label}` : '—'} accent="amber" />
          <HealthMetricCard icon={Zap} label="Energy" value={todayLog?.energy || '—'} accent="plum" />
          <HealthMetricCard icon={Moon} label="Sleep" value={todayLog?.sleep ? `${todayLog.sleep} hrs` : '—'} accent="teal" />
          <HealthMetricCard icon={Droplets} label="Water" value={todayLog?.water ? `${todayLog.water} glasses` : '—'} accent="rose" />
        </div>
        {!todayLog && (
          <div className="mt-4 flex items-center gap-2 bg-rose-50 rounded-xl px-4 py-3">
            <ClipboardPlus size={16} className="text-rose-500 shrink-0" />
            <p className="text-sm text-rose-700">You haven't logged anything today yet.</p>
            <Link to="/daily-health" className="ml-auto">
              <Button size="sm" variant="subtle">Log now</Button>
            </Link>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900 text-lg">AI insights</h2>
            <Link to="/insights" className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {insights?.insights?.slice(0, 2).map((ins) => (
              <InsightCard key={ins.id} type={ins.type} title={ins.title} body={ins.body} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900 text-lg">Recommended for you</h2>
            <Link to="/wellness" className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recs?.categories?.slice(0, 2).map((c) => (
              <RecommendationCard key={c.key} icon={c.icon} title={c.title} tip={c.tip} color={c.color} />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display font-semibold text-ink-900 text-lg mb-3">Recent symptoms</h2>
        {user.commonSymptoms?.length ? (
          <div className="flex flex-wrap gap-2">
            {user.commonSymptoms.map((s) => (
              <span key={s} className="text-sm font-medium bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-500">No symptoms logged yet. Log a daily check-in to build your history.</p>
        )}
      </Card>
    </div>
  )
}
