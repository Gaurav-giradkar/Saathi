import React, { useEffect, useState } from 'react'
import { Save, Droplets, Moon, Dumbbell, Utensils, Activity } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import { SYMPTOM_OPTIONS, MOOD_OPTIONS, ENERGY_LEVELS } from '../data/mockData.js'
import { getHealthData, saveHealthLog } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'

const EXERCISE_OPTIONS = ['None', 'Light walk', 'Yoga', 'Cardio', 'Strength training']
const DIET_OPTIONS = ['Balanced', 'Light / small meals', 'High cravings', 'Skipped meals']
const ACTIVITY_OPTIONS = ['Normal', 'Low activity', 'Very active', 'Mostly resting']

function SegmentGroup({ label, icon: Icon, options, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-700 mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={15} className="text-ink-400" />} {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={[
              'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors',
              value === opt ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-ink-100 text-ink-600 hover:border-rose-300',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DailyHealthTracker() {
  const [symptoms, setSymptoms] = useState([])
  const [pain, setPain] = useState(3)
  const [mood, setMood] = useState('good')
  const [energy, setEnergy] = useState('Medium')
  const [sleep, setSleep] = useState(7)
  const [water, setWater] = useState(6)
  const [exercise, setExercise] = useState('None')
  const [diet, setDiet] = useState('Balanced')
  const [activity, setActivity] = useState('Normal')
  const [saving, setSaving] = useState(false)
  const { showToast } = useApp()

  useEffect(() => {
    getHealthData().then((log) => {
      if (!log) return
      setSymptoms(log.symptoms || [])
      setPain(log.pain ?? 3)
      setMood(log.mood ?? 'good')
      setEnergy(log.energy ?? 'Medium')
      setSleep(log.sleep ?? 7)
      setWater(log.water ?? 6)
      setExercise(log.exercise ?? 'None')
      setDiet(log.diet ?? 'Balanced')
      setActivity(log.activity ?? 'Normal')
    })
  }, [])

  const toggleSymptom = (s) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const handleSave = async () => {
    setSaving(true)
    const today = new Date().toISOString().slice(0, 10)
    await saveHealthLog(today, { symptoms, pain, mood, energy, sleep, water, exercise, diet, activity })
    setSaving(false)
    showToast('Today\'s check-in saved')
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Daily health tracker</h1>
        <p className="text-ink-500 text-sm mt-1">A minute a day builds patterns your AI insights can learn from.</p>
      </div>

      <Card>
        <p className="text-sm font-semibold text-ink-700 mb-2">Symptoms today</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSymptom(s)}
              className={[
                'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors',
                symptoms.includes(s) ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-ink-100 text-ink-600 hover:border-rose-300',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-ink-700 mb-3">Pain level: <span className="text-rose-600">{pain}/10</span></p>
        <input
          type="range"
          min="0"
          max="10"
          value={pain}
          onChange={(e) => setPain(Number(e.target.value))}
          className="w-full accent-rose-500"
        />
      </Card>

      <Card>
        <p className="text-sm font-semibold text-ink-700 mb-3">Mood</p>
        <div className="flex gap-2 flex-wrap">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMood(m.key)}
              className={[
                'flex flex-col items-center gap-1 rounded-xl border px-4 py-3 flex-1 min-w-[70px] transition-colors',
                mood === m.key ? 'border-rose-400 bg-rose-50' : 'border-ink-100 hover:border-ink-200',
              ].join(' ')}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-medium text-ink-600">{m.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SegmentGroup label="Energy" icon={Activity} options={ENERGY_LEVELS} value={energy} onChange={setEnergy} />
      </Card>

      <div className="grid sm:grid-cols-2 gap-5">
        <Card>
          <p className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-1.5">
            <Moon size={15} className="text-ink-400" /> Sleep: <span className="text-plum-600">{sleep} hrs</span>
          </p>
          <input type="range" min="0" max="12" step="0.5" value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="w-full accent-plum-500" />
        </Card>
        <Card>
          <p className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-1.5">
            <Droplets size={15} className="text-ink-400" /> Water: <span className="text-teal-600">{water} glasses</span>
          </p>
          <input type="range" min="0" max="15" value={water} onChange={(e) => setWater(Number(e.target.value))} className="w-full accent-teal-500" />
        </Card>
      </div>

      <Card><SegmentGroup label="Exercise" icon={Dumbbell} options={EXERCISE_OPTIONS} value={exercise} onChange={setExercise} /></Card>
      <Card><SegmentGroup label="Diet" icon={Utensils} options={DIET_OPTIONS} value={diet} onChange={setDiet} /></Card>
      <Card><SegmentGroup label="Overall activity" icon={Activity} options={ACTIVITY_OPTIONS} value={activity} onChange={setActivity} /></Card>

      <Button size="lg" icon={Save} onClick={handleSave} disabled={saving} fullWidth>
        {saving ? 'Saving…' : "Save today's check-in"}
      </Button>
    </div>
  )
}
