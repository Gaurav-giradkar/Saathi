import React, { useEffect, useState } from 'react'
import { Sparkles, Send, Activity, Moon, HeartPulse } from 'lucide-react'

import Card from '../components/common/Card.jsx'
import { getCycleData, getHealthData, getInsights, sendAIChatMessage } from '../data/api.js'

const COMMON_QUESTIONS = [
  'What phase am I in?',
  'When is my next period?',
  'How am I doing today?',
  'What patterns do you notice?',
  'What should I focus on today?',
  'What changed this cycle?',
]

function Message({ role, content }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          role === 'user'
            ? 'max-w-[82%] rounded-2xl rounded-br-sm bg-rose-500 text-white px-4 py-3 text-sm whitespace-pre-line'
            : 'max-w-[82%] rounded-2xl rounded-bl-sm bg-ink-50 text-ink-800 px-4 py-3 text-sm whitespace-pre-line'
        }
      >
        {content}
      </div>
    </div>
  )
}

function SnapshotItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-ink-50 text-ink-500 flex items-center justify-center">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-ink-400 font-semibold">
          {label}
        </p>

        <p className="text-sm font-semibold text-ink-800 truncate">
          {value}
        </p>
      </div>
    </div>
  )
}

export default function AIInsights() {
  const [data, setData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([getInsights(), getHealthData().catch(() => null)])
      .then(([result, health]) => {
        setData(result)
        setHealthData(health)

        setMessages([
          {
            role: 'assistant',
            content:
              "Hi! I'm Saathi. I can help you understand your cycle, wellbeing, and patterns from your check-ins.",
          },
        ])
      })
      .catch((error) => {
        console.error('Failed to load Saathi AI:', error)
      })
  }, [])

  if (!data) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading Saathi AI…
      </div>
    )
  }

  const cycleInfo = data.cycleInfo || {}

  const cycleDay =
    cycleInfo.cycleDay ??
    cycleInfo.day ??
    '—'

  const phaseData = cycleInfo.phase

  const phase =
    typeof phaseData === 'object' && phaseData !== null
      ? phaseData.label || phaseData.name || 'Current phase'
      : phaseData ||
        cycleInfo.phaseName ||
        cycleInfo.currentPhase ||
        'Current phase'

  const pain =
    healthData?.pain ??
    data.today?.pain ??
    data.pain ??
    'Not logged'

  const sleep =
    healthData?.sleep ??
    data.today?.sleep ??
    data.sleep ??
    'Not logged'

  const answerQuestion = async (question) => {
    if (sending) return

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: question,
      },
    ])

    setSending(true)

    try {
      const context = {
        cycleDay,
        phase,
        nextPeriodDate: cycleInfo.nextPeriodDate,
        daysUntilNextPeriod: cycleInfo.daysUntilNextPeriod,
        periodStatus: healthData?.periodStatus || 'none',
        pain: healthData?.pain ?? null,
        mood: healthData?.mood || healthData?.moods || null,
        energy: healthData?.energy || null,
        sleep: healthData?.sleep ?? null,
        symptoms: healthData?.symptoms || [],
        waterLiters: healthData?.waterLiters ?? null,
      }

      const res = await sendAIChatMessage({
        message: question,
        context,
        role: 'user',
      })

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: res.response || "I'm here to support your menstrual wellbeing. How else can I help?",
        },
      ])
    } catch (err) {
      console.warn('[AI User Chat Fallback]:', err?.message)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: "I'm currently unable to reach the AI service, but your logged data remains safely recorded.",
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSend = () => {
    const question = input.trim()

    if (!question || sending) return

    setInput('')

    answerQuestion(question)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5 animate-fadeIn">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          Saathi AI
        </h1>

        <p className="text-ink-500 text-sm mt-1">
          Your personal wellbeing companion.
        </p>
      </div>

      {/* Today's Snapshot */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={17} className="text-rose-500" />

          <h2 className="font-display font-semibold text-ink-900">
            Today's Snapshot
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SnapshotItem
            icon={Activity}
            label="Cycle"
            value={`Day ${cycleDay}`}
          />

          <SnapshotItem
            icon={Sparkles}
            label="Phase"
            value={phase}
          />

          <SnapshotItem
            icon={HeartPulse}
            label="Pain"
            value={pain === 'Not logged' ? pain : `${pain}/10`}
          />

          <SnapshotItem
            icon={Moon}
            label="Sleep"
            value={sleep === 'Not logged' ? sleep : `${sleep} hrs`}
          />
        </div>
      </Card>

      {/* Chat */}
      <Card className="!p-0 overflow-hidden">

        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>

          <div>
            <h2 className="font-display font-semibold text-ink-900">
              Saathi
            </h2>

            <p className="text-xs text-ink-500">
              Your cycle & wellbeing companion
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="min-h-[420px] max-h-[620px] overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <Message
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
          </div>

          {/* Questions */}
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-rose-500" />

              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Common questions
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {COMMON_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => answerQuestion(question)}
                  className="px-4 py-2.5 rounded-full border border-ink-100 bg-white text-sm text-ink-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-ink-100 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Saathi anything..."
              className="flex-1 rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>

          <p className="text-[11px] text-ink-400 mt-2 text-center">
            Saathi uses your logged information to personalize responses.
          </p>
        </div>

      </Card>
    </div>
  )
}