import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, User, CalendarDays, Bell } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import Toggle from '../components/common/Toggle.jsx'
import { SYMPTOM_OPTIONS } from '../data/mockData.js'
import { saveUserSetup } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function SectionHeader({ icon: Icon, title, index }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center font-display font-semibold text-sm">
        {index}
      </div>
      <h2 className="font-display font-semibold text-ink-900 text-lg">{title}</h2>
    </div>
  )
}

export default function UserSetup() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [lastPeriodStart, setLastPeriodStart] = useState(new Date().toISOString().slice(0, 10))
  const [periodLength, setPeriodLength] = useState(5)
  const [cycleLength, setCycleLength] = useState(28)
  const [symptoms, setSymptoms] = useState([])
  const [notifications, setNotifications] = useState(true)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast, refreshAuth } = useApp()
  const { profile } = useAuth()
  const loadedProfileUid = useRef(null)

  useEffect(() => {
    if (!profile?.uid || loadedProfileUid.current === profile.uid) return
    loadedProfileUid.current = profile.uid
    setName(profile.name || '')
    setAge(profile.age ?? '')
    setSymptoms(profile.commonSymptoms || [])
    setNotifications(profile.notifications ?? true)
    if (profile.cycleSetup) {
      setLastPeriodStart(profile.cycleSetup.lastPeriodStart || new Date().toISOString().slice(0, 10))
      setPeriodLength(profile.cycleSetup.periodLength ?? 5)
      setCycleLength(profile.cycleSetup.cycleLength ?? 28)
    }
  }, [profile])

  const toggleSymptom = (s) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await saveUserSetup({
      profile: { name: name.trim(), age: age === '' ? null : Number(age), notifications, commonSymptoms: symptoms },
      cycle: { lastPeriodStart, periodLength: Number(periodLength), cycleLength: Number(cycleLength) },
    })
    // Refresh profile state before routing so ProtectedRoute sees onboardingComplete.
    await refreshAuth()
    showToast('Setup complete — welcome!')
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-12">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn">
        <div className="text-center mb-2">
          <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">Let's set up your profile</h1>
          <p className="text-ink-500">This helps personalize predictions from day one.</p>
        </div>

        <Card>
          <SectionHeader icon={User} title="Basic information" index={1} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
            <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="24" min="10" max="60" />
          </div>
        </Card>

        <Card>
          <SectionHeader icon={CalendarDays} title="Cycle details" index={2} />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Last period start"
              type="date"
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              required
            />
            <Input
              label="Period length (days)"
              type="number"
              min="1"
              max="10"
              value={periodLength}
              onChange={(e) => setPeriodLength(e.target.value)}
            />
            <Input
              label="Cycle length (days)"
              type="number"
              min="18"
              max="45"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <SectionHeader icon={User} title="Symptoms & health" index={3} />
          <p className="text-sm text-ink-500 mb-3">Select symptoms you commonly experience (optional).</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={[
                  'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors',
                  symptoms.includes(s)
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white border-ink-100 text-ink-600 hover:border-rose-300',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader icon={Bell} title="Lifestyle & preferences" index={4} />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-ink-800 text-sm">Cycle & symptom notifications</p>
              <p className="text-xs text-ink-500">Reminders for upcoming periods and daily logging.</p>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
        </Card>

        <Button type="submit" size="lg" fullWidth icon={ArrowRight} iconPosition="right" disabled={loading}>
          {loading ? 'Saving…' : 'Save & Continue'}
        </Button>
      </form>
    </div>
  )
}
