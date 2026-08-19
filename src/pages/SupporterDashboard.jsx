import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Droplets, CalendarClock, ThermometerSun, Smile, HandHeart, ShieldAlert, ArrowRight, Users } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { getSupporterData } from '../data/api.js'
import { MOOD_OPTIONS } from '../data/mockData.js'

export default function SupporterDashboard() {
  const [data, setData] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    getSupporterData()
      .then(setData)
      .catch((err) => setFetchError(err?.message || 'Failed to load dashboard data.'))
  }, [])

  if (fetchError) return (
    <div className="text-center py-20 flex flex-col items-center gap-3">
      <p className="text-rose-500 font-medium">Could not load dashboard</p>
      <p className="text-ink-400 text-sm max-w-sm">{fetchError}</p>
    </div>
  )
  if (!data) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  if (data.connection.status !== 'connected') {
    return (
      <Card className="mt-6">
        <EmptyState
          icon={Users}
          title="No one connected yet"
          description="Connect with the person you're supporting to start seeing their shared updates here."
          action={
            <Button as={Link} to="/supporter/connection" icon={ArrowRight} iconPosition="right">
              Connect now
            </Button>
          }
        />
      </Card>
    )
  }

  const moodMeta = MOOD_OPTIONS.find((m) => m.key === data.shared.mood)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Hello 👋
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Connected to <span className="font-semibold text-ink-700">{data.connectedUserName}</span>
          </p>
        </div>
      </div>

      <Card className="flex items-center gap-4 !py-5">
        <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-display font-bold text-xl shrink-0">
          {data.connectedUserName?.[0] || 'A'}
        </div>
        <div className="flex-1">
          <p className="font-display font-semibold text-ink-900 text-lg">{data.connectedUserName}</p>
          <p className="text-sm text-ink-500">Sharing selected updates with you</p>
        </div>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{
          backgroundColor: '#D6EEE9', color: '#2F675E',
        }}>
          {data.shared.cyclePhase}
        </span>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Droplets} label="Period status" value={data.shared.periodStatus || 'Private'} accent="rose" />
        <StatCard icon={CalendarClock} label="Expected period" value={data.shared.expectedPeriod ? new Date(data.shared.expectedPeriod).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Private'} accent="plum" />
        <StatCard icon={ThermometerSun} label="Shared pain level" value={data.shared.painLevel ? `${data.shared.painLevel}/10` : 'Private'} accent="amber" />
        <StatCard icon={Smile} label="How she may feel" value={moodMeta ? `${moodMeta.emoji} ${moodMeta.label}` : (data.suggestion?.feeling?.split(',')[0] || 'Unknown')} accent="teal" />
      </div>

      <Card className="bg-teal-50/60 border-teal-100">
        <div className="flex items-center gap-2 mb-4">
          <HandHeart size={20} className="text-teal-600" />
          <h2 className="font-display font-semibold text-ink-900 text-lg">How you can help today</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">Try this</p>
            <ul className="flex flex-col gap-1.5">
              {data.suggestion.help.map((h, i) => (
                <li key={i} className="text-sm text-ink-700 flex gap-2">
                  <span className="text-teal-500 mt-0.5">•</span> {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <ShieldAlert size={13} /> Things to avoid
            </p>
            <ul className="flex flex-col gap-1.5">
              {data.suggestion.avoid.map((a, i) => (
                <li key={i} className="text-sm text-ink-700 flex gap-2">
                  <span className="text-rose-400 mt-0.5">•</span> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Link to="/supporter/guidance" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 mt-4">
          Full guidance for this phase <ArrowRight size={14} />
        </Link>
      </Card>

      <Card className="flex items-start gap-3">
        <Heart size={18} className="text-rose-400 mt-0.5" />
        <p className="text-sm text-ink-600 leading-relaxed">
          {data.connectedUserName} controls exactly what's shared with you. Some information — like mood, diet, or
          medical notes — may stay private unless they choose to share it.
        </p>
      </Card>
    </div>
  )
}
