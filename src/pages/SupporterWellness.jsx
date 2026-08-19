import React, { useEffect, useState } from 'react'
import {
  HeartHandshake, HandHeart, MessageCircleHeart, ShieldAlert,
  Sparkles, Coffee, Clock, Heart, AlertCircle, RefreshCw,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import RecommendationCard from '../components/common/RecommendationCard.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import Button from '../components/common/Button.jsx'
import { getSupporterData } from '../data/api.js'
import { PHASES } from '../data/mockData.js'

const SUPPORTER_WELLNESS_CATEGORIES = [
  {
    key: 'practical',
    title: 'Practical Support',
    icon: 'HeartHandshake',
    color: 'teal',
    tip: 'Offer help with meals, chores, errands, or other everyday tasks when it would be useful. Practical support can make difficult days easier.',
  },

  {
    key: 'communication',
    title: 'Empathetic Communication',
    icon: 'MessageCircleHeart',
    color: 'plum',
    tip: 'Ask open questions such as "What would feel most helpful right now?" Listen without judgment and avoid unsolicited solutions.',
  },

  {
    key: 'comfort',
    title: 'Comfort & Relief',
    icon: 'Sparkles',
    color: 'rose',
    tip: 'Offer things the person finds comforting, such as a heating pad, warm drink, quiet environment, or help with everyday tasks.',
  },

  {
    key: 'boundaries',
    title: 'Respecting Boundaries',
    icon: 'ShieldAlert',
    color: 'amber',
    tip: 'Support needs can change from day to day. If they want quiet, privacy, or space, respect their preference without taking it personally.',
  },

  {
    key: 'nutrition',
    title: 'Nourishment & Hydration',
    icon: 'Coffee',
    color: 'teal',
    tip: 'Offer water, a meal, or a snack if they would appreciate it. Let them choose what they prefer rather than assuming what they need.',
  },

  {
    key: 'patience',
    title: 'Patience & Reassurance',
    icon: 'Heart',
    color: 'rose',
    tip: 'Be a calm and dependable presence. Reassurance, patience, and consistency can help someone feel supported without feeling pressured.',
  },
]

const PHASE_SUPPORT_GUIDES = {
  menstrual: {
    focus: 'Rest & Comfort',
    guidance: 'Physical energy is often lowest during menstruation. Offer heating pads, hot drinks, handle heavy chores, and keep social commitments flexible.',
  },
  follicular: {
    focus: 'Encouragement & Shared Activities',
    guidance: 'Energy and optimism typically build up during this phase. Great time for planning activities, outings, and trying new things together.',
  },
  ovulation: {
    focus: 'Active Engagement',
    guidance: 'Often marked by higher energy and social engagement. Stay communicative, supportive, and engaged in joint projects.',
  },
  luteal: {
    focus: 'Calm & Understanding',
    guidance: 'Progesterone rises and falls, sometimes bringing fatigue, mood shifts, or cravings. Offer extra patience, lower daily stressors, and avoid unnecessary conflict.',
  },
}

export default function SupporterWellness() {
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
      setFetchError(err?.message || 'Failed to load supporter wellness guide.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading wellness guide…</div>
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <AlertCircle size={36} className="text-rose-500" />
        <p className="text-rose-600 font-medium">Could not load wellness guide</p>
        <p className="text-ink-500 text-sm max-w-sm">{fetchError}</p>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData}>
          Retry
        </Button>
      </div>
    )
  }

  const sharedPhase = data?.shared?.cyclePhase
  const phaseKey = sharedPhase
    ? Object.keys(PHASES).find((k) => PHASES[k].label?.toLowerCase() === sharedPhase?.toLowerCase())
    : null

  const phaseGuide = phaseKey ? PHASE_SUPPORT_GUIDES[phaseKey] : null

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Supporter wellness & care
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Practical, evidence-informed ways to offer compassionate everyday care.
          </p>
        </div>
        {phaseKey && <PhaseBadge phaseKey={phaseKey} />}
      </div>

      {/* Phase Context Guide if shared */}
      {phaseGuide && (
        <Card className="flex items-start gap-4 bg-teal-50/60 border-teal-100">
          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 mt-0.5">
            <HandHeart size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                Current Phase Focus: {phaseGuide.focus}
              </span>
            </div>
            <p className="text-sm text-ink-800 leading-relaxed font-medium">
              {phaseGuide.guidance}
            </p>
          </div>
        </Card>
      )}

      {/* Wellness Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUPPORTER_WELLNESS_CATEGORIES.map((c) => (
          <RecommendationCard
            key={c.key}
            icon={c.icon}
            title={c.title}
            tip={c.tip}
            color={c.color}
          />
        ))}
      </div>

      {/* General Care Advice Card */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-teal-600" />
          <h2 className="font-display font-semibold text-ink-900 text-base sm:text-lg">
            Everyday Supportive Habits
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-ink-700">
          <div className="p-3.5 rounded-xl bg-bg border border-ink-100 flex flex-col gap-1">
            <p className="font-semibold text-ink-900">Check in proactively</p>
            <p className="text-xs text-ink-500 leading-relaxed">
              A short message like "Thinking of you, let me know if you need anything today" shows care without pressure.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-bg border border-ink-100 flex flex-col gap-1">
            <p className="font-semibold text-ink-900">Avoid assumptions</p>
            <p className="text-xs text-ink-500 leading-relaxed">
              Do not blame emotions or fatigue solely on the menstrual cycle. Treat every interaction with genuine respect.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
