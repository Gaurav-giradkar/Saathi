import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, Droplets, CalendarClock, ThermometerSun, Smile, HandHeart,
  ShieldAlert, ArrowRight, Users, RefreshCw, AlertCircle, Zap, Moon, Activity,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import { getSupporterData } from '../data/api.js'
import { MOOD_OPTIONS, PHASES } from '../data/mockData.js'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

export default function SupporterDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      const res = await getSupporterData()
      setData(res)
    } catch (err) {
      setFetchError(err?.message || 'Failed to load supporter dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading dashboard…</div>
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <AlertCircle size={36} className="text-rose-500" />
        <p className="text-rose-600 font-medium">Could not load dashboard</p>
        <p className="text-ink-500 text-sm max-w-sm">{fetchError}</p>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData}>
          Retry
        </Button>
      </div>
    )
  }

  const connStatus = data?.connection?.status

  // ==========================================
  // STATE 1 — NO CONNECTION
  // ==========================================
  if (!connStatus || connStatus === 'none') {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Supporter Dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Welcome to Saathi. Connect with the person you're supporting to get started.
          </p>
        </div>

        <Card className="!py-12">
          <EmptyState
            icon={Users}
            title="You're not connected yet."
            description="Ask the person you're supporting for their invitation code."
            action={
              <Button as={Link} to="/supporter/connection" icon={ArrowRight} iconPosition="right" variant="teal">
                Connect
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  // ==========================================
  // STATE 2 — PENDING
  // ==========================================
  if (connStatus === 'pending') {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Supporter Dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Connection in progress.
          </p>
        </div>

        <Card className="!py-12">
          <EmptyState
            icon={Users}
            title="Connection request pending."
            description="Waiting for the owner to approve your request."
            action={
              <Button as={Link} to="/supporter/connection" icon={ArrowRight} iconPosition="right" variant="teal">
                View connection
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  // ==========================================
  // STATE 3 — ACTIVE / CONNECTED
  // ==========================================
  const shared = data?.shared || {}
  const suggestion = data?.suggestion || {
    feeling: 'No additional health information has been shared.',
    help: [],
    avoid: [],
  }

  const moodMeta = shared.mood ? MOOD_OPTIONS.find((m) => m.key === shared.mood) : null

  const phaseKey = shared.cyclePhase
    ? Object.keys(PHASES).find((k) => PHASES[k].label?.toLowerCase() === shared.cyclePhase?.toLowerCase()) || 'follicular'
    : null

  // Collect available stat cards
  const statCards = []

  if (shared.periodStatus) {
    statCards.push(
      <StatCard
        key="periodStatus"
        icon={Droplets}
        label="Period status"
        value={shared.periodStatus}
        accent="rose"
      />
    )
  }

  if (shared.expectedPeriod) {
    statCards.push(
      <StatCard
        key="expectedPeriod"
        icon={CalendarClock}
        label="Expected period"
        value={formatDate(shared.expectedPeriod)}
        accent="plum"
      />
    )
  }

  if (shared.painLevel != null) {
    statCards.push(
      <StatCard
        key="painLevel"
        icon={ThermometerSun}
        label="Shared pain level"
        value={`${shared.painLevel}/10`}
        accent="amber"
      />
    )
  }

  if (shared.mood) {
    statCards.push(
      <StatCard
        key="mood"
        icon={Smile}
        label="Shared mood"
        value={moodMeta ? `${moodMeta.emoji} ${moodMeta.label}` : shared.mood}
        accent="teal"
      />
    )
  }

  if (shared.energy) {
    statCards.push(
      <StatCard
        key="energy"
        icon={Zap}
        label="Shared energy"
        value={shared.energy}
        accent="amber"
      />
    )
  }

  if (shared.sleep != null) {
    statCards.push(
      <StatCard
        key="sleep"
        icon={Moon}
        label="Shared sleep"
        value={`${shared.sleep} hrs`}
        accent="plum"
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Hello 👋
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Connected to <span className="font-semibold text-ink-800">{data.connectedUserName}</span>
          </p>
        </div>
      </div>

      {/* Partner Connection Card */}
      <Card className="flex items-center gap-4 !py-4 sm:!py-5">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-display font-bold text-xl shrink-0">
          {data.connectedUserName?.[0]?.toUpperCase() || 'C'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-ink-900 text-base sm:text-lg truncate">
            {data.connectedUserName}
          </p>
          <p className="text-xs sm:text-sm text-ink-500 truncate">
            Sharing selected updates with you
          </p>
        </div>
        {phaseKey && (
          <div className="shrink-0">
            <PhaseBadge phaseKey={phaseKey} />
          </div>
        )}
      </Card>

      {/* Shared Metrics (Only render what is actually shared) */}
      {statCards.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards}
        </div>
      )}

      {/* Symptoms List if shared */}
      {Array.isArray(shared.symptoms) && shared.symptoms.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-teal-600" />
            <h2 className="font-display font-semibold text-ink-900 text-base">
              Shared Symptoms
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {shared.symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200/60"
              >
                {symptom}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions Card */}
      <Card className="bg-teal-50/60 border-teal-100">
        <div className="flex items-center gap-2 mb-4">
          <HandHeart size={20} className="text-teal-600" />
          <h2 className="font-display font-semibold text-ink-900 text-lg">
            How you can help today
          </h2>
        </div>

        {suggestion.feeling && (
          <p className="text-sm text-ink-700 font-medium mb-3 italic">
            "{suggestion.feeling}"
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {Array.isArray(suggestion.help) && suggestion.help.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
                Try this
              </p>
              <ul className="flex flex-col gap-1.5">
                {suggestion.help.map((h, i) => (
                  <li key={i} className="text-sm text-ink-700 flex gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(suggestion.avoid) && suggestion.avoid.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <ShieldAlert size={13} /> Things to avoid
              </p>
              <ul className="flex flex-col gap-1.5">
                {suggestion.avoid.map((a, i) => (
                  <li key={i} className="text-sm text-ink-700 flex gap-2">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          to="/supporter/wellness"
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 mt-4 transition-colors"
        >
          Full guidance and care tips <ArrowRight size={14} />
        </Link>
      </Card>

      {/* Privacy Guarantee Card */}
      <Card className="flex items-start gap-3">
        <Heart size={18} className="text-rose-400 mt-0.5 shrink-0" />
        <p className="text-sm text-ink-600 leading-relaxed">
          <span className="font-semibold text-ink-700">{data.connectedUserName}</span> controls exactly what's shared with you. Some information — like mood, diet, or medical notes — stays completely private unless they choose to share it.
        </p>
      </Card>
    </div>
  )
}
