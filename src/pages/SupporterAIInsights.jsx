import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, CalendarClock, HeartHandshake, ShieldAlert,
  Users, ArrowRight, RefreshCw, AlertCircle, Info,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import InsightCard from '../components/common/InsightCard.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { getSupporterData } from '../data/api.js'
import { PHASES } from '../data/mockData.js'

export default function SupporterAIInsights() {
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
      setFetchError(err?.message || 'Failed to load supporter insights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading insights…</div>
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <AlertCircle size={36} className="text-rose-500" />
        <p className="text-rose-600 font-medium">Could not load insights</p>
        <p className="text-ink-500 text-sm max-w-sm">{fetchError}</p>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData}>
          Retry
        </Button>
      </div>
    )
  }

  const isConnected = data?.connection?.status === 'connected'
  const shared = data?.shared

  // Determine if any meaningful field is shared
  const hasSharedData = isConnected && shared && (
    Boolean(shared.cyclePhase) ||
    Boolean(shared.periodStatus) ||
    Boolean(shared.expectedPeriod) ||
    shared.painLevel != null ||
    (Array.isArray(shared.symptoms) && shared.symptoms.length > 0) ||
    Boolean(shared.mood) ||
    Boolean(shared.energy) ||
    shared.sleep != null
  )

  if (!isConnected || !hasSharedData) {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            AI insights & context
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Contextual guidance for supporters based on explicitly shared updates.
          </p>
        </div>

        <Card className="!py-12">
          <EmptyState
            icon={Sparkles}
            title={isConnected ? "Insights will appear when your connection shares information with you." : "You're not connected yet"}
            description={
              isConnected
                ? `${data?.connectedUserName || 'Your connection'} has not enabled sharing permissions for health data yet. As they log updates and choose what to share, contextual insights will appear here.`
                : "Connect with the person you're supporting to receive contextual insights based on the updates they choose to share."
            }
            action={
              !isConnected ? (
                <Button as={Link} to="/supporter/connection" icon={ArrowRight} iconPosition="right" variant="teal">
                  Connect now
                </Button>
              ) : null
            }
          />
        </Card>
      </div>
    )
  }

  // Find phase key from shared phase label
  const phaseKey = shared.cyclePhase
    ? Object.keys(PHASES).find((k) => PHASES[k].label?.toLowerCase() === shared.cyclePhase?.toLowerCase()) || 'follicular'
    : null

  // Build contextual insights strictly from shared fields
  const dynamicInsights = []

  if (shared.painLevel != null) {
    const painNum = Number(shared.painLevel)
    dynamicInsights.push({
      id: 'pain',
      type: 'wellness',
      title: `Shared Pain Level (${painNum}/10)`,
      body: `Your connection has shared that they are experiencing ${painNum >= 6 ? 'significant' : painNum >= 3 ? 'moderate' : 'mild'} pain today. Practical support such as offering a warm beverage, preparing a heat pack, or helping with daily tasks can provide meaningful relief.`,
    })
  }

  if (shared.periodStatus) {
    const isOnPeriod = shared.periodStatus.toLowerCase().includes('on period')
    dynamicInsights.push({
      id: 'period',
      type: 'nutrition',
      title: 'Period Status',
      body: isOnPeriod
        ? `They have shared that their period is currently active. Be patient, ensure plenty of hydration is accessible, and keep everyday plans flexible.`
        : `Their period is currently marked as not active. Continue maintaining open communication and supportive routines.`,
    })
  }

  if (shared.energy) {
    dynamicInsights.push({
      id: 'energy',
      type: 'wellness',
      title: `Energy Level: ${shared.energy}`,
      body: `They have noted ${shared.energy.toLowerCase()} energy today. Respect their pace, avoid pressuring them into high-energy activities, and offer to help take care of household tasks.`,
    })
  }

  if (shared.mood) {
    dynamicInsights.push({
      id: 'mood',
      type: 'trend',
      title: `Mood Check-in: ${shared.mood}`,
      body: `Today's shared mood check-in is '${shared.mood}'. Practicing active listening without rushing to fix things helps them feel heard and supported.`,
    })
  }

  if (Array.isArray(shared.symptoms) && shared.symptoms.length > 0) {
    dynamicInsights.push({
      id: 'symptoms',
      type: 'trend',
      title: 'Reported Symptoms',
      body: `Shared symptoms today: ${shared.symptoms.join(', ')}. Creating a calm, comfortable space at home helps them rest comfortably.`,
    })
  }

  if (shared.sleep != null) {
    dynamicInsights.push({
      id: 'sleep',
      type: 'wellness',
      title: `Sleep Duration: ${shared.sleep} hrs`,
      body: `Restful sleep is essential for recovery and physical comfort. Support their rest routine and keep evening environments peaceful.`,
    })
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            AI insights & context
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Contextual guidance for supporting <span className="font-semibold text-ink-700">{data.connectedUserName}</span>
          </p>
        </div>
        {phaseKey && <PhaseBadge phaseKey={phaseKey} />}
      </div>

      {/* Cycle / Prediction Banner if shared */}
      {(shared.cyclePhase || shared.expectedPeriod) && (
        <Card className="flex items-center gap-4 bg-teal-50/60 border-teal-100">
          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
            <CalendarClock size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
              Shared Cycle Context
            </p>
            <p className="text-sm text-ink-800 font-medium">
              {shared.cyclePhase && `Current Phase: ${shared.cyclePhase}. `}
              {shared.expectedPeriod && (
                `Next period estimated around ${new Date(shared.expectedPeriod).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.`
              )}
            </p>
          </div>
        </Card>
      )}

      {/* Dynamic Insights Grid */}
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-teal-600" />
          <h2 className="font-display font-semibold text-ink-900 text-lg">
            Personalized Supporter Insights
          </h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          Actionable recommendations based on what {data.connectedUserName} has shared today.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {dynamicInsights.map((ins) => (
            <InsightCard key={ins.id} type={ins.type} title={ins.title} body={ins.body} />
          ))}
        </div>
      </Card>

      {/* Medical Disclaimer Alert */}
      <Card className="flex items-start gap-3 bg-plum-50/60 border-plum-100">
        <Info size={18} className="text-plum-600 mt-0.5 shrink-0" />
        <p className="text-xs sm:text-sm text-plum-900 leading-relaxed">
          These insights are educational and based solely on explicitly shared preferences. Saathi does not provide medical diagnoses or claim clinical causation.
        </p>
      </Card>
    </div>
  )
}
