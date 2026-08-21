import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Sparkles,
  CalendarClock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Send,
  User,
  Bot,
  Info,
  MessageCircle,
} from 'lucide-react'

import {
  SUPPORTER_AI_FALLBACKS,
  PREDEFINED_QUESTIONS,
  getFallbackAnswer,
} from '../data/aiFallbacks.js'

import Card from '../components/common/Card.jsx'
import InsightCard from '../components/common/InsightCard.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import Button from '../components/common/Button.jsx'
import { getSupporterData } from '../data/api.js'
import { PHASES } from '../data/mockData.js'

function getMockResponse(message) {
  const text = message.toLowerCase().trim()

  if (
    text.includes('period cramp') ||
    text.includes('period pain') ||
    (text.includes('period') && text.includes('cramp'))
  ) {
    return (
      'Period cramps are commonly associated with uterine contractions during menstruation. Gentle heat, rest, hydration, and comfortable movement can be helpful for some people.'
    )
  }

  if (
    text.includes('what is pms') ||
    text.includes('pms')
  ) {
    return (
      'PMS refers to physical and emotional symptoms that can happen before a period. Symptoms can vary widely and may include cramps, bloating, mood changes, fatigue, or breast tenderness.'
    )
  }

  if (
    text.includes('support') ||
    text.includes('help') ||
    text.includes('what should i do')
  ) {
    return (
      'A good starting point is to ask what kind of support they want. Listening, offering practical help, giving space, and respecting privacy can all be useful depending on the person.'
    )
  }

  if (
    text.includes('hydration') ||
    text.includes('drink water') ||
    text.includes('water')
  ) {
    return (
      'Staying hydrated supports normal body function and can be a useful part of everyday wellbeing. Encourage regular fluids without pressuring someone to drink more than they comfortably need.'
    )
  }

  if (
    text.includes('period') &&
    (
      text.includes('normal') ||
      text.includes('healthy')
    )
  ) {
    return (
      'Menstrual patterns vary between people. Flow, duration, symptoms, and cycle length can all differ. Persistent or severe symptoms should be discussed with a qualified healthcare professional.'
    )
  }

  if (
    text.includes('hygiene') ||
    text.includes('pad') ||
    text.includes('tampon')
  ) {
    return (
      'Menstrual hygiene generally means changing period products regularly, keeping the area clean and dry, and choosing products that are comfortable and appropriate for the person.'
    )
  }

  if (
    text.includes('mood') ||
    text.includes('stress') ||
    text.includes('emotional')
  ) {
    return (
      'Mood and stress can vary around the menstrual cycle, but experiences differ greatly. Listening without immediately trying to fix the situation is often a useful form of support.'
    )
  }

  if (
    text.includes('diet') ||
    text.includes('food') ||
    text.includes('eat')
  ) {
    return (
      'A balanced diet with regular meals can support general wellbeing. There is no single perfect period diet; individual preferences, appetite, and tolerance matter.'
    )
  }

  return (
    'That is a good question. Saathi AI is currently running in frontend preview mode. Once the AI service is connected, this chat will generate dynamic answers to general, educational, and supporter questions.'
  )
}

export default function SupporterAIInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Hi. I’m Saathi AI. You can ask me general questions, educational questions, or questions about supporting someone.',
    },
  ])

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setFetchError(null)

      const result = await getSupporterData()

      setData(result)
    } catch (error) {
      setFetchError(
        error?.message ||
          'Failed to load supporter insights.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSend = async (event) => {
    event.preventDefault()

    const text = input.trim()

    if (!text || sending) {
      return
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    }

    setMessages((current) => [
      ...current,
      userMessage,
    ])

    setInput('')
    setSending(true)

    // Temporary frontend-only AI response.
    await new Promise((resolve) =>
      setTimeout(resolve, 500),
    )

    const response =
      getFallbackAnswer(text) ||
      getMockResponse(text)

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: response,
    }

    setMessages((current) => [
      ...current,
      assistantMessage,
    ])

    setSending(false)
  }

  const handleSuggestedQuestion = async (question) => {
  if (sending) return

  const userMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    text: question,
  }

  setMessages((current) => [
    ...current,
    userMessage,
  ])

  setInput('')
  setSending(true)

  await new Promise((resolve) =>
    setTimeout(resolve, 500),
  )

  const response =
    getFallbackAnswer(question) ||
    getMockResponse(question)

  const assistantMessage = {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    text: response,
  }

  setMessages((current) => [
    ...current,
    assistantMessage,
  ])

  setSending(false)
}

  if (loading) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading Saathi AI…
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <AlertCircle
          size={36}
          className="text-rose-500"
        />

        <p className="text-rose-600 font-medium">
          Could not load supporter insights
        </p>

        <p className="text-ink-500 text-sm max-w-sm">
          {fetchError}
        </p>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={loadData}
        >
          Retry
        </Button>
      </div>
    )
  }

  // ============================================================
  // CONNECTION + SHARED DATA
  // ============================================================

  const connectionStatus =
    data?.connection?.status

  const isConnected =
    connectionStatus === 'active' ||
    connectionStatus === 'connected'

  const shared =
    data?.shared || {}

  const permissions =
    data?.permissions ||
    shared?.permissions ||
    {}

  const hasSharedPermission =
    isConnected &&
    Object.values(permissions).some(Boolean)

  // ============================================================
  // PHASE
  // ============================================================

  const phaseKey =
    shared.cyclePhase
      ? Object.keys(PHASES).find(
          (key) =>
            PHASES[key].label
              ?.toLowerCase() ===
            String(
              shared.cyclePhase,
            ).toLowerCase(),
        ) || 'follicular'
      : null

  // ============================================================
  // SHARED VALUES
  // ============================================================

  const moodValue =
    Array.isArray(shared.mood)
      ? shared.mood.join(', ')
      : shared.mood || ''

  const sleepDuration =
    shared.sleep?.duration ?? null

  const sleepQuality =
    shared.sleep?.quality || ''

  const sleepIssues =
    Array.isArray(shared.sleep?.issues)
      ? shared.sleep.issues
      : []

  const diet =
    shared.dietNutrition || {}

  const medical =
    shared.medicalInfo || {}

  // ============================================================
  // DYNAMIC INSIGHTS
  // ============================================================

  const dynamicInsights = []

  if (
    permissions.painLevel &&
    shared.painLevel != null
  ) {
    const painNum =
      Number(shared.painLevel)

    let severity = 'mild'

    if (painNum >= 6) {
      severity = 'significant'
    } else if (painNum >= 3) {
      severity = 'moderate'
    }

    dynamicInsights.push({
      id: 'pain',
      type: 'wellness',
      title: `Shared Pain Level (${painNum}/10)`,
      body:
        `Your connection has shared that they are experiencing ${severity} pain today. Practical support such as offering a warm beverage, preparing a heat pack, or helping with daily tasks can provide meaningful support.`,
    })
  }

  if (
    permissions.periodStatus &&
    shared.periodStatus
  ) {
    const isOnPeriod =
      shared.periodStatus === 'On period'

    dynamicInsights.push({
      id: 'period',
      type: 'nutrition',
      title: 'Period Status',
      body: isOnPeriod
        ? 'They have shared that their period is currently active. Be patient, keep hydration accessible, and keep everyday plans flexible.'
        : 'Their period is currently marked as not active. Continue maintaining open communication and supportive routines.',
    })
  }

  if (
    permissions.expectedPeriod &&
    shared.expectedPeriod
  ) {
    const formattedDate =
      new Date(
        shared.expectedPeriod,
      ).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'long',
        },
      )

    dynamicInsights.push({
      id: 'expected-period',
      type: 'trend',
      title: 'Upcoming Period',
      body:
        `Their next period is currently estimated around ${formattedDate}. This is an estimate, so use it as context rather than a fixed date.`,
    })
  }

  if (
    permissions.energy &&
    shared.energy
  ) {
    dynamicInsights.push({
      id: 'energy',
      type: 'wellness',
      title: `Energy Level: ${shared.energy}`,
      body:
        `They have noted ${String(
          shared.energy,
        ).toLowerCase()} energy today. Respect their pace, avoid unnecessary pressure, and offer practical help when useful.`,
    })
  }

  if (
    permissions.mood &&
    moodValue
  ) {
    dynamicInsights.push({
      id: 'mood',
      type: 'trend',
      title: `Mood Check-in: ${moodValue}`,
      body:
        `Today's shared mood check-in is "${moodValue}". Active listening without immediately trying to fix things can help them feel heard and supported.`,
    })
  }

  if (
    permissions.symptoms &&
    Array.isArray(shared.symptoms) &&
    shared.symptoms.length > 0
  ) {
    dynamicInsights.push({
      id: 'symptoms',
      type: 'trend',
      title: 'Reported Symptoms',
      body:
        `Shared symptoms today: ${shared.symptoms.join(', ')}. Creating a calm, comfortable environment can make rest and recovery easier.`,
    })
  }

  if (
    permissions.sleep &&
    (
      sleepDuration != null ||
      sleepQuality ||
      sleepIssues.length > 0
    )
  ) {
    const sleepParts = []

    if (sleepDuration != null) {
      sleepParts.push(
        `${sleepDuration} hours of sleep`,
      )
    }

    if (sleepQuality) {
      sleepParts.push(
        `${sleepQuality.toLowerCase()} sleep quality`,
      )
    }

    if (sleepIssues.length > 0) {
      sleepParts.push(
        `sleep concerns: ${sleepIssues.join(', ')}`,
      )
    }

    dynamicInsights.push({
      id: 'sleep',
      type: 'wellness',
      title:
        sleepDuration != null
          ? `Sleep Duration: ${sleepDuration} hrs`
          : 'Sleep Update',
      body:
        `They have shared ${sleepParts.join(', ')}. Supporting a calm and consistent rest environment can help.`,
    })
  }

  if (
    permissions.dietNutrition &&
    (
      diet.meals?.length > 0 ||
      diet.appetite ||
      diet.cravings?.length > 0 ||
      diet.waterLiters != null
    )
  ) {
    const dietDetails = []

    if (diet.meals?.length > 0) {
      dietDetails.push(
        `meals: ${diet.meals.join(', ')}`,
      )
    }

    if (diet.appetite) {
      dietDetails.push(
        `appetite: ${diet.appetite}`,
      )
    }

    if (diet.cravings?.length > 0) {
      dietDetails.push(
        `cravings: ${diet.cravings.join(', ')}`,
      )
    }

    if (diet.waterLiters != null) {
      dietDetails.push(
        `water intake: ${diet.waterLiters} L`,
      )
    }

    dynamicInsights.push({
      id: 'diet',
      type: 'nutrition',
      title: 'Diet & Nutrition',
      body:
        `Shared nutrition information today includes ${dietDetails.join('. ')}. Use this as context for practical support without making assumptions about what they need.`,
    })
  }

  if (
    permissions.medicalInfo &&
    (
      medical.notes ||
      medical.painLocations?.length > 0 ||
      medical.painTypes?.length > 0 ||
      medical.relief?.length > 0
    )
  ) {
    const medicalDetails = []

    if (
      medical.painLocations?.length > 0
    ) {
      medicalDetails.push(
        `pain locations: ${medical.painLocations.join(', ')}`,
      )
    }

    if (
      medical.painTypes?.length > 0
    ) {
      medicalDetails.push(
        `pain types: ${medical.painTypes.join(', ')}`,
      )
    }

    if (
      medical.relief?.length > 0
    ) {
      medicalDetails.push(
        `relief methods: ${medical.relief.join(', ')}`,
      )
    }

    if (medical.notes) {
      medicalDetails.push(
        `note: ${medical.notes}`,
      )
    }

    dynamicInsights.push({
      id: 'medical',
      type: 'wellness',
      title: 'Medical Information',
      body:
        `They have explicitly shared the following: ${medicalDetails.join('. ')}. Respond only to what they have chosen to share.`,
    })
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Saathi AI
          </h1>

          <p className="text-ink-500 text-sm mt-1">
            Ask questions, learn, and understand how
            to support someone.
          </p>
        </div>

        {isConnected &&
          phaseKey && (
            <PhaseBadge
              phaseKey={phaseKey}
            />
          )}
      </div>

      {/* ========================================================
          AI CHAT — ALWAYS AVAILABLE
      ======================================================== */}

      <Card className="overflow-hidden !p-0">

        {/* Chat header */}
        <div className="px-5 sm:px-6 py-4 border-b border-ink-100 bg-teal-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
              <MessageCircle
                size={19}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="font-display font-semibold text-ink-900">
                Chat with Saathi AI
              </h2>

              <p className="text-xs text-ink-500 mt-0.5">
                Ask general, educational, or supporter questions.
              </p>
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="px-4 sm:px-6 pt-5">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">
              Try asking
            </p>

            <div className="flex flex-wrap gap-2">
              {PREDEFINED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    setInput(question)
                  }}
                  className="px-3 py-2 rounded-xl border border-ink-100 bg-white text-sm text-ink-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="h-[420px] overflow-y-auto px-4 sm:px-6 py-5 bg-white">

          <div className="flex flex-col gap-4">
            {messages.map((message) => {
              const isUser =
                message.role === 'user'

              return (
                <div
                  key={message.id}
                  className={[
                    'flex gap-3',
                    isUser
                      ? 'justify-end'
                      : 'justify-start',
                  ].join(' ')}
                >

                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={[
                      'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3',
                      isUser
                        ? 'bg-teal-600 text-white rounded-br-md'
                        : 'bg-ink-50 text-ink-800 rounded-bl-md',
                    ].join(' ')}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-plum-50 text-plum-600 flex items-center justify-center shrink-0">
                      <User size={16} />
                    </div>
                  )}

                </div>
              )
            })}

            {sending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>

                <div className="bg-ink-50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce"
                      style={{
                        animationDelay:
                          '120ms',
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce"
                      style={{
                        animationDelay:
                          '240ms',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-ink-100 px-4 sm:px-6 py-4 bg-white"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white p-1.5 focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-50">

            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask Saathi anything..."
              className="flex-1 min-w-0 bg-transparent border-0 outline-none px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400"
              disabled={sending}
            />

            <button
              type="submit"
              disabled={
                sending ||
                !input.trim()
              }
              className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>
        </form>
      </Card>

      {/* ========================================================
          CONNECTION STATUS
      ======================================================== */}

      {!isConnected && (
        <Card className="bg-plum-50/50 border-plum-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-plum-100 text-plum-600 flex items-center justify-center shrink-0">
              <Info size={17} />
            </div>

            <div className="flex-1">
              <h2 className="font-display font-semibold text-ink-900">
                Personalized supporter insights
              </h2>

              <p className="text-sm text-ink-600 mt-1 leading-relaxed">
                Connect with someone you support to
                unlock contextual insights based on
                information they explicitly choose to
                share.
              </p>

              <Button
                as={Link}
                to="/supporter/connection"
                variant="teal"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                className="mt-4"
              >
                Connect now
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          CONNECTED USER INSIGHTS
      ======================================================== */}

      {isConnected && (
        <>
          {/* Cycle Context */}
          {(
            permissions.cyclePhase &&
            shared.cyclePhase
          ) ||
          (
            permissions.expectedPeriod &&
            shared.expectedPeriod
          ) ? (
            <Card className="flex items-center gap-4 bg-teal-50/60 border-teal-100">
              <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                <CalendarClock
                  size={20}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  Shared Cycle Context
                </p>

                <p className="text-sm text-ink-800 font-medium">
                  {permissions.cyclePhase &&
                    shared.cyclePhase &&
                    `Current Phase: ${shared.cyclePhase}. `}

                  {permissions.expectedPeriod &&
                    shared.expectedPeriod &&
                    `They've shared that their next period is estimated around ${new Date(
                      shared.expectedPeriod,
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'long',
                      },
                    )}.`}
                </p>
              </div>
            </Card>
          ) : null}

          {/* Support Recommendations */}
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles
                size={18}
                className="text-teal-600"
              />

              <h2 className="font-display font-semibold text-ink-900 text-lg">
                How you can support today
              </h2>
            </div>

            <p className="text-sm text-ink-500 mb-4">
              Actionable recommendations based only
              on the information{' '}
              {data.connectedUserName} has chosen
              to share today.
            </p>

            {hasSharedPermission &&
            dynamicInsights.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {dynamicInsights.map(
                  (insight) => (
                    <InsightCard
                      key={insight.id}
                      type={insight.type}
                      title={insight.title}
                      body={insight.body}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-ink-50 border border-ink-100 p-5">
                <p className="text-sm text-ink-600">
                  Your connection has not shared enough
                  current information to generate a
                  contextual recommendation yet.
                </p>
              </div>
            )}
          </Card>

          {/* Privacy */}
          <Card className="flex items-start gap-3">
            <ShieldAlert
              size={18}
              className="text-teal-500 mt-0.5 shrink-0"
            />

            <p className="text-sm text-ink-600 leading-relaxed">
              These insights are generated only from
              information explicitly shared with you.
              Anything the user turns off remains
              private.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}