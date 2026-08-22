import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
   Sparkles,  Smile,  ArrowRight, ClipboardPlus,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import Card from '../components/common/Card.jsx'
import RecommendationCard from '../components/common/RecommendationCard.jsx'
import CycleRing from '../components/charts/CycleRing.jsx'
import Button from '../components/common/Button.jsx'
import {
  getUserData,
  getCycleData,
  getInsights,
  getRecommendations,
  getHealthData,
  getHealthHistory,
} from '../data/api.js'

import saathiGirl from '../images/saathi-girl.png'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 24) return 'Good evening'
}

function energyScore(value) {
  const scores = {
    'Very Low': 1,
    Low: 2.5,
    'Below Average': 4,
    Medium: 5.5,
    'Above Average': 7,
    High: 8.5,
    'Very High': 10,
  }

  return scores[value] ?? null
}

function moodScore(value) {
  const scores = {
    Happy: 10,
    Energetic: 10,
    Good: 8.5,
    Content: 8,
    Calm: 8,
    Relaxed: 8,
    Okay: 6.5,
    Neutral: 6,
    Tired: 4,
    Low: 4,
    Sad: 3,
    Anxious: 3,
    Stressed: 3,
    Irritable: 3,
    Angry: 2,
    Frustrated: 3,
    Emotional: 4,
    Overwhelmed: 2,
    Lonely: 3,
    Sensitive: 5,
  }

  return scores[value] ?? null
}

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const [cycle, setCycle] = useState(null)
  const [todayLog, setTodayLog] = useState(null)
  const [healthHistory, setHealthHistory] = useState([])

  useEffect(() => {
    Promise.all([
      getUserData(),
      getCycleData(),
      getHealthData(),
      getHealthHistory(7),
    ])
      .then(
        ([
          userData,
          cycleData,
          healthData,
          historyData,
        ]) => {
          setUser(userData)
          setCycle(cycleData)
          setTodayLog(healthData)
          setHealthHistory(historyData)
        },
      )
      .catch((error) => {
        console.error('Dashboard load error:', error)
      })
  }, [])

  if (!user || !cycle) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading your dashboard…
      </div>
    )
  }
  const mood = todayLog?.moods?.[0] || todayLog?.mood || null

  const graphData = healthHistory.map((entry) => {
    // Consider ALL moods logged for the day
    const moodValues = Array.isArray(entry.moods)
      ? entry.moods
      : entry.mood
        ? [entry.mood]
        : []

    const moodScores = moodValues
      .map(moodScore)
      .filter((score) => score !== null)

    const mood =
      moodScores.length > 0
        ? moodScores.reduce((sum, score) => sum + score, 0) /
          moodScores.length
        : null

    const energy = energyScore(entry.energy)

    const sleep =
      entry.sleep != null
        ? Math.min(Number(entry.sleep) / 8 * 10, 10)
        : null

    const hydration =
      entry.waterLiters != null
        ? Math.min(Number(entry.waterLiters) / 2.5 * 10, 10)
        : null

    const exercise =
      entry.exerciseMinutes != null
        ? Math.min(Number(entry.exerciseMinutes) / 60 * 10, 10)
        : null

    const date = new Date(
      `${entry.date || entry.id}T00:00:00`,
    )

    return {
      date: date.toLocaleDateString('en-IN', {
        weekday: 'short',
      }),
      mood,
      energy,
      sleep,
      hydration,
      exercise,
    }
  })
  

  return (
   <div className="flex flex-col gap-6 animate-fadeIn bg-[#FFF8FB] min-h-screen p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            {getGreeting()}, {user.name || 'there'} 👋
          </h1>
          <p className="text-ink-500 text-sm mt-1">Here’s your cycle & wellbeing overview for today.</p>
        </div>
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
          <h2 className="font-display font-bold text-ink-900 text-xl">
            Today's Check-In
          </h2>

          <p className="text-sm font-medium text-rose-500 mt-0.5">
            How are you feeling?
          </p>
        </div>

      </div>

      <Link
        to="/daily-health"
        className="text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
      >
        Update
        <ArrowRight size={14} />
      </Link>

    </div>


    {/* CHECK-IN ITEMS */}
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

  {/* PAIN */}
  <div className="rounded-2xl bg-rose-50 p-4 text-center hover:shadow-sm transition">
    <div className="text-2xl mb-2">
      🤕
    </div>

    <p className="text-sm font-semibold text-ink-800">
      Pain
    </p>

    <p className="text-xs text-rose-600 mt-1 font-medium">
      {todayLog?.pain !== undefined &&
      todayLog?.pain !== null
        ? `${todayLog.pain}/10`
        : 'Not logged'}
    </p>
  </div>


  {/* MOOD */}
  <div className="rounded-2xl bg-amber-50 p-4 text-center hover:shadow-sm transition">
    <div className="text-2xl mb-2">
      😊
    </div>

    <p className="text-sm font-semibold text-ink-800">
      Mood
    </p>

    <p className="text-xs text-amber-600 mt-1 font-medium">
      {mood || 'Not logged'}
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
      {todayLog?.sleep !== undefined &&
      todayLog?.sleep !== null
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
      {todayLog?.water !== undefined &&
      todayLog?.water !== null
        ? `${todayLog.water} glasses`
        : todayLog?.waterLiters !== undefined &&
          todayLog?.waterLiters !== null
          ? `${todayLog.waterLiters} L`
          : 'Not logged'}
    </p>
  </div>


  {/* EXERCISE */}
  <div className="rounded-2xl bg-green-50 p-4 text-center hover:shadow-sm transition">
    <div className="text-2xl mb-2">
      🏃🏻‍♀️
    </div>

    <p className="text-sm font-semibold text-ink-800">
      Exercise
    </p>

    <p className="text-xs text-green-600 mt-1 font-medium">
      {todayLog?.exerciseMinutes !== undefined &&
      todayLog?.exerciseMinutes !== null
        ? `${todayLog.exerciseMinutes} min`
        : todayLog?.exerciseActivities?.length &&
          !todayLog.exerciseActivities.includes('None')
          ? todayLog.exerciseActivities[0]
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
          You haven’t recorded anything today.
        </p>

        <Link
          to="/daily-health"
          className="ml-auto"
        >
          <Button size="sm" variant="subtle">
            Log now →
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
        <h2 className="font-display font-bold text-ink-900 text-lg">
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
              icon="nutrition"
              title="Nutrition"
              tip="Healthy choices for your cycle"
              color="rose"
              to="/wellness"
            />

            <RecommendationCard
              icon="movement"
              title="Movement"
              tip="Gentle activities for today"
              color="plum"
              to="/wellness"
            />

            <RecommendationCard
              icon="self-care"
              title="Self Care"
              tip="Take a little time for yourself"
              color="teal"
              to="/wellness"
            />
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-ink-900 text-lg">
                Your Wellbeing Trend
              </h2>

              <p className="text-sm text-ink-500 mt-1">
                See how your wellbeing has changed over the last 7 days.
              </p>
            </div>
          </div>

          {graphData.length > 0 ? (
            <div className="w-full h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={graphData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="energy"
                    name="Energy"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="sleep"
                    name="Sleep"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="hydration"
                    name="Hydration"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="exercise"
                    name="Exercise"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[360px] flex items-center justify-center text-sm text-ink-400">
              Start logging your health to see your wellbeing trend.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}