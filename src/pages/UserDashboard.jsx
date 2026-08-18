import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
   Sparkles,  Smile,  ArrowRight, ClipboardPlus,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import RecommendationCard from '../components/common/RecommendationCard.jsx'
import CycleRing from '../components/charts/CycleRing.jsx'
import Button from '../components/common/Button.jsx'
import {
  getUserData, getCycleData, getInsights, getRecommendations, getHealthData,
} from '../data/api.js'
import { MOOD_OPTIONS } from '../data/mockData.js'
import saathiGirl from '../images/saathi-girl.png.png'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 24) return 'Good evening'
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
   <div className="flex flex-col gap-6 animate-fadeIn bg-[#FFF8FB] min-h-screen p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            {getGreeting()}, {user.name || 'there'} 👋
          </h1>
          <p className="text-ink-500 text-sm mt-1">Here's how your cycle & wellbeing look today.</p>
        </div>
        <PhaseBadge phaseKey={cycle.phaseKey} />
      </div>

      <div className="grid lg:grid-cols-[0.75fr_1.5fr] gap-6">

  {/* LEFT - CYCLE RING */}
  <Card className="flex flex-col items-center justify-center !p-7">
    <CycleRing
      cycleDay={cycle.cycleDay}
      cycleLength={cycle.cycleLength}
      periodLength={cycle.periodLength}
      phaseKey={cycle.phaseKey}
      nextPeriodDate={cycle.nextPeriodDate}
      />
    
  </Card>
  {/* RIGHT - TODAY'S CHECK-IN */}
  <Card className="!p-6">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-5">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
          <Smile size={20} className="text-rose-500" />
        </div>

        <div>
          <h2 className="font-display font-semibold text-ink-900 text-xl">
            Today's Check-In
          </h2>

          <p className="text-sm font-medium text-rose-500 mt-0.5">
            How are you feeling?
          </p>
        </div>

      </div>

      <Link
        to="/daily-health"
        className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
      >
        Update
        <ArrowRight size={14} />
      </Link>

    </div>


    {/* CHECK-IN ITEMS */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

      {/* PAIN */}
      <div className="rounded-2xl bg-rose-50 p-4 text-center hover:shadow-sm transition">
        <div className="text-2xl mb-2">🤕</div>

        <p className="text-sm font-semibold text-ink-800">
          Pain
        </p>

        <p className="text-xs text-rose-600 mt-1 font-medium">
          {todayLog?.pain
            ? `${todayLog.pain}/10`
            : 'Not logged'}
        </p>
      </div>


      {/* MOOD */}
      <div className="rounded-2xl bg-amber-50 p-4 text-center hover:shadow-sm transition">
        <div className="text-2xl mb-2">
          {moodMeta?.emoji || '😊'}
        </div>

        <p className="text-sm font-semibold text-ink-800">
          Mood
        </p>

        <p className="text-xs text-amber-600 mt-1 font-medium">
          {moodMeta?.label || 'Not logged'}
        </p>
      </div>


      {/* ENERGY */}
      <div className="rounded-2xl bg-purple-50 p-4 text-center hover:shadow-sm transition">
        <div className="text-2xl mb-2">
          ⚡
        </div>

        <p className="text-sm font-semibold text-ink-800">
          Energy
        </p>

        <p className="text-xs text-purple-600 mt-1 font-medium">
          {todayLog?.energy || 'Not logged'}
        </p>
      </div>


      {/* SLEEP */}
      <div className="rounded-2xl bg-blue-50 p-4 text-center hover:shadow-sm transition">
        <div className="text-2xl mb-2">
          😴
        </div>

        <p className="text-sm font-semibold text-ink-800">
          Sleep
        </p>

        <p className="text-xs text-blue-600 mt-1 font-medium">
          {todayLog?.sleep
            ? `${todayLog.sleep} hrs`
            : 'Not logged'}
        </p>
      </div>


      {/* WATER */}
      <div className="rounded-2xl bg-cyan-50 p-4 text-center hover:shadow-sm transition">
        <div className="text-2xl mb-2">
          💧
        </div>

        <p className="text-sm font-semibold text-ink-800">
          Water
        </p>

        <p className="text-xs text-cyan-600 mt-1 font-medium">
          {todayLog?.water
            ? `${todayLog.water} glasses`
            : 'Not logged'}
        </p>
      </div>

    </div>


    {/* IF NOTHING LOGGED */}
    {!todayLog && (
      <div className="mt-4 flex items-center gap-2 bg-rose-50 rounded-xl px-4 py-3">

        <ClipboardPlus
          size={16}
          className="text-rose-500 shrink-0"
        />

        <p className="text-sm text-rose-700">
          You haven't logged anything today yet.
        </p>

        <Link
          to="/daily-health"
          className="ml-auto"
        >
          <Button size="sm" variant="subtle">
            Log now
          </Button>
        </Link>

          </div>
    )}

        </Card>

       </div>
             

      <div className="grid lg:grid-cols-2 gap-6">
       <Card className="overflow-hidden">
  <div className="flex items-center justify-between mb-5">
    <div>
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-rose-500" />
        <h2 className="font-display font-semibold text-ink-900 text-lg">
          Today's Saathi Insight
        </h2>
      </div>

      <p className="text-sm text-ink-500 mt-1">
        A little reminder from Saathi for you 💗
      </p>
    </div>
  </div>

  <div className="flex items-center gap-5">
    <div className="flex-1">
      <p className="text-sm sm:text-base text-ink-700 leading-relaxed">
        Every day is a new opportunity to take care of yourself.
        Listen to your body, celebrate small progress, and remember
        that your wellbeing matters. 🌸
      </p>

      <Link to="/insights" className="inline-block mt-4">
        
      </Link>
    </div>
<div className="hidden sm:flex w-36 h-36 rounded-3xl bg-rose-50 items-center justify-center shrink-0 overflow-hidden">
  <img
    src={saathiGirl}
    alt="Saathi"
    className="w-full h-full object-contain"
  />
</div>
  </div>
</Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900 text-lg">Recommended for you</h2>
            <Link to="/wellness" className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
        <div className="grid grid-cols-3 gap-3">
  <RecommendationCard
    icon="🥗"
    title="Nutrition"
    tip="Healthy choices for your cycle"
    color="rose"
  />

  <RecommendationCard
    icon="🏃"
    title="Movement"
    tip="Gentle activities for today"
    color="plum"
  />

  <RecommendationCard
    icon="🧘"
    title="Self Care"
    tip="Take a little time for yourself"
    color="teal"
  />
</div>
        </Card>
      </div>

      <Card className="relative overflow-hidden">
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="font-display font-semibold text-ink-900 text-lg">
        Recent Symptoms
      </h2>
      <p className="text-sm text-ink-500 mt-1">
        Track how you're feeling today ☺️
      </p>
    </div>

    <Link to="/daily-health">
      <Button size="sm" variant="subtle">
        + Add Symptoms
      </Button>
    </Link>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

    <div className="rounded-2xl bg-rose-50 p-4">
      <div className="text-2xl mb-2">🤕</div>
      <p className="font-semibold text-ink-900">Cramps</p>
      <span className="text-xs text-rose-600 font-medium">
        Moderate
      </span>
    </div>

    <div className="rounded-2xl bg-pink-50 p-4">
      <div className="text-2xl mb-2">🌸</div>
      <p className="font-semibold text-ink-900">Acne</p>
      <span className="text-xs text-pink-600 font-medium">
        Mild
      </span>
    </div>

    <div className="rounded-2xl bg-purple-50 p-4">
      <div className="text-2xl mb-2">😣</div>
      <p className="font-semibold text-ink-900">Backache</p>
      <span className="text-xs text-purple-600 font-medium">
        Mild
      </span>
    </div>

    <div className="rounded-2xl bg-amber-50 p-4">
      <div className="text-2xl mb-2">🍫</div>
      <p className="font-semibold text-ink-900">Cravings</p>
      <span className="text-xs text-amber-600 font-medium">
        Moderate
      </span>
    </div>

    <div className="rounded-2xl bg-orange-50 p-4">
      <div className="text-2xl mb-2">🫧</div>
      <p className="font-semibold text-ink-900">Bloating</p>
      <span className="text-xs text-orange-600 font-medium">
        Mild
      </span>
    </div>

    <div className="rounded-2xl bg-teal-50 p-4">
      <div className="text-2xl mb-2">😴</div>
      <p className="font-semibold text-ink-900">Fatigue</p>
      <span className="text-xs text-teal-600 font-medium">
        Moderate
      </span>
    </div>

    <div className="rounded-2xl bg-indigo-50 p-4">
      <div className="text-2xl mb-2">🤯</div>
      <p className="font-semibold text-ink-900">Headache</p>
      <span className="text-xs text-indigo-600 font-medium">
        Mild
      </span>
    </div>

  </div>
</Card>
    </div>
  )
}
