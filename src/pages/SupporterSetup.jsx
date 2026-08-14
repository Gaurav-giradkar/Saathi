import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, User, HeartHandshake, Bell } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Select from '../components/common/Select.jsx'
import Button from '../components/common/Button.jsx'
import Toggle from '../components/common/Toggle.jsx'
import { RELATIONSHIP_TYPES } from '../data/mockData.js'
import { saveSupporterSetup } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'

const HELP_STYLES = ['Emotional support', 'Practical help (food, chores)', 'Reminders & logistics', 'Just staying informed']

export default function SupporterSetup() {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState(RELATIONSHIP_TYPES[0])
  const [helpStyle, setHelpStyle] = useState(HELP_STYLES[0])
  const [notifications, setNotifications] = useState(true)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useApp()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await saveSupporterSetup({ name, relationship, helpStyle, notifications })
    showToast('Setup complete')
    setLoading(false)
    navigate('/supporter/connection')
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-12">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn">
        <div className="text-center mb-2">
          <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">Set up your supporter profile</h1>
          <p className="text-ink-500">Next, you'll connect to the person you're supporting.</p>
        </div>

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-display font-semibold text-sm">1</div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">Basic information</h2>
          </div>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-display font-semibold text-sm">2</div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">Relationship</h2>
          </div>
          <Select label="Relationship type" options={RELATIONSHIP_TYPES} value={relationship} onChange={(e) => setRelationship(e.target.value)} />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-display font-semibold text-sm">3</div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">How you want to help</h2>
          </div>
          <div className="flex flex-col gap-2">
            {HELP_STYLES.map((style) => (
              <label
                key={style}
                className={[
                  'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                  helpStyle === style ? 'border-teal-400 bg-teal-50/60' : 'border-ink-100 hover:border-teal-200',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="helpStyle"
                  checked={helpStyle === style}
                  onChange={() => setHelpStyle(style)}
                  className="accent-teal-600"
                />
                <span className="text-sm font-medium text-ink-800">{style}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-display font-semibold text-sm">4</div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-ink-800 text-sm">Updates about shared information</p>
              <p className="text-xs text-ink-500">Only what's explicitly shared, when it changes.</p>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
        </Card>

        <Button type="submit" size="lg" fullWidth variant="teal" icon={ArrowRight} iconPosition="right" disabled={loading}>
          {loading ? 'Saving…' : 'Save & Continue'}
        </Button>
      </form>
    </div>
  )
}
