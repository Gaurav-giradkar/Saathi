/**
 * Centralized Gemini AI Service for Saathi Platform
 *
 * Multi-key health-aware rotation:
 * - Reads GEMINI_API_KEY_1 through GEMINI_API_KEY_6
 * - Uses active primary healthy key
 * - On HTTP 503 / 429 / 408 / 5xx: treats as transient, applies cooldown, tries next key
 * - On HTTP 400 / 401 / 403 (invalid key): marks key invalid for runtime process, tries next key
 * - Iterates through ALL configured keys before declaring all keys failed
 * - Safe logging: NEVER logs actual API key strings, only slot index and status
 * - Enforces calm, professional, non-judgmental, non-diagnostic response style
 */

import {
  FALLBACK_DAILY_SUMMARY,
  FALLBACK_MONTHLY_SUMMARY,
  FALLBACK_RECOMMENDATIONS,
  getFallbackAnswer,
} from '../src/data/aiFallbacks.js'

// Key manager state
const keyPool = []
let activeKeyIndex = 0
const keyCooldowns = new Map() // slot -> timestamp when available again
const invalidKeys = new Set()  // slot -> set of permanently invalid keys for this process
const COOLDOWN_MS = 60 * 1000  // 60s cooldown on transient errors (503, 429, 5xx)

/**
 * Initialize key pool from environment variables
 */
export function initGeminiKeys(env = process.env) {
  keyPool.length = 0

  for (let i = 1; i <= 6; i++) {
    const key = env[`GEMINI_API_KEY_${i}`]

    if (key && typeof key === 'string' && key.trim()) {
      keyPool.push({
        slot: i,
        key: key.trim(),
      })
    }
  }

  // Optional single-key fallback
  if (keyPool.length === 0 && env.GEMINI_API_KEY) {
    keyPool.push({
      slot: 1,
      key: env.GEMINI_API_KEY.trim(),
    })
  }

  console.log(
    `[Gemini Service] Initialized with ${keyPool.length} active API key slot(s).`
  )
}

// Auto-init on load if process.env is present
if (typeof process !== 'undefined' && process.env) {
  initGeminiKeys(process.env)
}

/**
 * Get ordered candidate list of keys to try
 */
function getOrderedCandidates() {
  if (keyPool.length === 0) return []

  const now = Date.now()

  // Filter out permanently invalid keys
  const usableKeys = keyPool.filter((k) => !invalidKeys.has(k.slot))
  if (usableKeys.length === 0) return []

  // Split into healthy (not in cooldown) and cooling down
  const healthy = []
  const cooling = []

  for (let i = 0; i < usableKeys.length; i++) {
    const idx = (activeKeyIndex + i) % usableKeys.length
    const item = usableKeys[idx]
    const cd = keyCooldowns.get(item.slot) || 0
    if (now >= cd) {
      healthy.push(item)
    } else {
      cooling.push({ ...item, cd })
    }
  }

  // Sort cooling keys by earliest cooldown expiration
  cooling.sort((a, b) => a.cd - b.cd)

  // Return healthy keys first, then cooling keys as last resort
  return [...healthy, ...cooling]
}

/**
 * Mark a key slot with transient cooldown
 */
function markKeyCooldown(slot, reason = 'transient_error', durationMs = COOLDOWN_MS) {
  const until = Date.now() + durationMs
  keyCooldowns.set(slot, until)
  console.warn(`[Gemini Service] Slot #${slot} temporarily unavailable for ${durationMs / 1000}s. Reason: ${reason}`)
}

/**
 * Mark a key slot permanently invalid for this process
 */
function markKeyInvalid(slot, reason = 'invalid_key') {
  invalidKeys.add(slot)
  console.warn(`[Gemini Service] Slot #${slot} marked permanently invalid for this process. Reason: ${reason}`)
}

/**
 * Clean and parse JSON from model response
 */
function parseJsonSafely(rawText, defaultObj = {}) {
  if (!rawText || typeof rawText !== 'string') return defaultObj

  let cleaned = rawText.trim()

  // Remove markdown code fence if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  }

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
      } catch (nestedErr) {
        console.error('[Gemini Service] JSON parsing failed after extraction:', nestedErr.message)
      }
    }
    console.error('[Gemini Service] Raw JSON parse failed, returning fallback:', err.message)
    return defaultObj
  }
}

/**
 * Core Gemini API Caller with robust 6-key multi-try fallback
 */
async function callGeminiApi({ systemInstruction, prompt, isJson = false }) {
  if (keyPool.length === 0) {
    console.warn('[Gemini Service] No Gemini API keys configured. Using fallback.')
    return { success: false, text: null, error: 'NO_KEYS_CONFIGURED' }
  }

  const candidates = getOrderedCandidates()
  if (candidates.length === 0) {
    console.error('[Gemini Service] All configured Gemini keys are marked permanently invalid.')
    return { success: false, text: null, error: 'ALL_KEYS_INVALID' }
  }

  let lastError = null

  // Iterate through each candidate key
  for (const keyInfo of candidates) {
    console.log(`[Gemini Service] Attempting request using Slot #${keyInfo.slot}...`)

    try {
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      }

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        }
      }

      if (isJson) {
        payload.generationConfig.responseMimeType = 'application/json'
      }

      const model = process.env.GEMINI_MODEL || 'gemini-3.7-flash'
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyInfo.key}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle 400 / 401 / 403 (Invalid credentials or permissions)
      if (response.status === 400 || response.status === 401) {
        const errorText = await response.text().catch(() => '')
        const isKeyInvalid =
          errorText.includes('API key not valid') ||
          errorText.includes('API_KEY_INVALID') ||
          errorText.includes('INVALID_ARGUMENT') ||
          response.status === 401

        if (isKeyInvalid) {
          markKeyInvalid(keyInfo.slot, `HTTP ${response.status} (API key not valid)`)
        } else {
          markKeyCooldown(keyInfo.slot, `HTTP ${response.status}: ${errorText.slice(0, 80)}`, 30000)
        }
        lastError = new Error(`Slot #${keyInfo.slot} HTTP ${response.status}`)
        continue // Try next key!
      }

      // Handle 429 / 403 (Quota or rate-limited)
      if (response.status === 429 || response.status === 403) {
        markKeyCooldown(keyInfo.slot, `HTTP ${response.status} (Rate limited / Quota exhausted)`)
        lastError = new Error(`Slot #${keyInfo.slot} HTTP ${response.status}`)
        continue // Try next key!
      }

      // Handle 503 / 500 / 502 / 504 (Transient server overloaded / high demand)
      if (response.status >= 500 || response.status === 408) {
        const errorText = await response.text().catch(() => '')
        const reason = errorText.includes('high demand')
          ? 'Model experiencing high demand'
          : `HTTP ${response.status} Server error`
        markKeyCooldown(keyInfo.slot, reason, 45000)
        lastError = new Error(`Slot #${keyInfo.slot} ${reason}`)
        continue // Try next key!
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.warn(`[Gemini Service] Slot #${keyInfo.slot} returned HTTP ${response.status}: ${errorText.slice(0, 100)}`)
        markKeyCooldown(keyInfo.slot, `HTTP ${response.status}`)
        lastError = new Error(`Slot #${keyInfo.slot} HTTP ${response.status}`)
        continue // Try next key!
      }

      const result = await response.json()
      const candidate = result.candidates?.[0]
      const text = candidate?.content?.parts?.[0]?.text

      if (!text) {
        console.warn(`[Gemini Service] Slot #${keyInfo.slot} returned empty content. Trying next key...`)
        lastError = new Error(`Slot #${keyInfo.slot} returned empty content`)
        continue // Try next key!
      }

      // Success! Update activeKeyIndex to this working key
      const workingIndex = keyPool.findIndex((k) => k.slot === keyInfo.slot)
      if (workingIndex !== -1) {
        activeKeyIndex = workingIndex
      }

      console.log(`[Gemini Service] Request succeeded using Slot #${keyInfo.slot}.`)
      return { success: true, text }
    } catch (err) {
      lastError = err
      const isAbort = err.name === 'AbortError'
      const reason = isAbort ? 'Request Timeout (15s)' : err.message || 'Network failure'
      markKeyCooldown(keyInfo.slot, reason, 30000)
      continue // Try next key!
    }
  }

  console.error(`[Gemini Service] All ${candidates.length} candidate key(s) failed. Last error:`, lastError?.message)
  return { success: false, text: null, error: lastError?.message || 'ALL_KEYS_FAILED' }
}

/**
 * Diagnostic health check function to inspect key statuses
 */
export function getGeminiKeyStatus() {
  const now = Date.now()
  return {
    totalConfigured: keyPool.length,
    activeSlot: keyPool[activeKeyIndex % Math.max(1, keyPool.length)]?.slot || null,
    slots: keyPool.map((k) => {
      const cd = keyCooldowns.get(k.slot) || 0
      const isInvalid = invalidKeys.has(k.slot)
      const isCooling = now < cd
      return {
        slot: k.slot,
        status: isInvalid ? 'INVALID' : isCooling ? `COOLDOWN (${Math.round((cd - now) / 1000)}s remaining)` : 'HEALTHY',
      }
    }),
  }
}

/* ==========================================================================
   GLOBAL SYSTEM PROMPT RULES
========================================================================== */
const BASE_SYSTEM_PROMPT = `
You are Saathi AI, the intelligent, calm, and trustworthy wellbeing companion inside the Saathi menstrual-health platform.

Your job is to answer the user's actual question clearly and use provided user context only when relevant.

==================================================
TONE
==================================================

Always be:
- professional
- friendly
- calm
- clear
- respectful
- non-judgmental
- natural and conversational

Do not sound robotic, overly clinical, dramatic, preachy, or overly emotional.

Use simple language by default.

Do not repeat the user's question unless clarification is necessary.

Do not use unnecessary emojis.

==================================================
ANSWER THE ACTUAL QUESTION
==================================================

Every user message is a new request.

Always answer the specific question that was asked.

NEVER:
- repeat the initial greeting as the answer
- repeat a previous answer unless the user asks you to
- respond with a generic "What would you like to explore?" message after a real question
- ignore the user's question and return a generic wellness message

Examples:

User: "What is PMS?"
→ Explain PMS.

User: "What is today's date?"
→ Answer the date if the system context provides it; otherwise say that the current date is not available in the provided context.

User: "Why is my energy low today?"
→ Use the relevant provided health data and explain possible contributing factors without diagnosing.

==================================================
PERSONALIZATION
==================================================

When user-specific context is provided:

1. Use only the provided information.
2. Never invent missing values.
3. Never assume an absent field means a negative result.
4. Clearly distinguish logged facts from possible explanations.
5. Personalize only when the question benefits from personalization.

Never send or infer information that is not present in the provided context.

==================================================
MENSTRUAL CYCLE
==================================================

Cycle phase is contextual information only.

Never assume that a phase determines:
- mood
- personality
- behavior
- emotions
- pain
- energy
- symptoms

Use language such as:
- may
- can
- some people
- varies between individuals
- estimated

Never present predictions as guaranteed outcomes.

==================================================
HEALTH SAFETY
==================================================

You provide educational and supportive information.

You do NOT diagnose medical conditions.

Do not claim certainty when the available information is insufficient.

For severe, worsening, persistent, unusual, or disruptive symptoms:
- acknowledge the concern
- provide general supportive information when appropriate
- recommend appropriate professional medical evaluation
- do not diagnose

Do not dismiss concerning symptoms as "just hormones" or "just a period."

==================================================
SUPPORTER MODE
==================================================

If the user is a supporter:

NOT CONNECTED:
- General questions are allowed.
- Educational questions are allowed.
- Menstrual-health questions are allowed.
- Questions about how to support someone are allowed.
- Personal information about another person is NOT available.

CONNECTED:
- Use only explicitly provided shared context.
- Treat the provided context as the complete set of allowed information.
- Never infer missing/private data.
- Never guess what the connected person is feeling.

If information is unavailable, say so clearly.

==================================================
SUPPORTER PRIVACY
==================================================

For supporter requests, the context provided to you is the ONLY information you may use about the connected person.

If a field is absent, do not:
- infer it
- estimate it
- guess it
- mention it as though it were known

Never reconstruct disabled/private health information.

==================================================
RECOMMENDATIONS
==================================================

Recommendations must be:
- practical
- specific
- realistic
- relevant to the provided data

Prefer 2–4 high-value actions rather than a very long list.

==================================================
REPORTS
==================================================

Daily and monthly summaries must be based strictly on actual logged data.

Do not invent trends.

Do not claim causation unless supported by the provided information.

Clearly distinguish:
- observed data
- possible interpretation

==================================================
OUTPUT STYLE
==================================================

For normal chat responses:
- use natural paragraphs
- use short bullet points only when useful
- avoid unnecessary headings
- do not use markdown tables
- do not use markdown code blocks

IMPORTANT:
Do NOT use Markdown bold markers like **text** unless the frontend explicitly supports markdown rendering.

Prefer:
"Day 18 of your cycle, Luteal phase."

instead of:
"You are on **Day 18** of your **Luteal phase**."

==================================================
STRUCTURED JSON
==================================================

When the request explicitly asks for JSON:
- return ONLY valid JSON
- no markdown fences
- no explanation before JSON
- no explanation after JSON
- follow the exact requested schema

==================================================
FINAL RULE
==================================================

Answer the user's current question directly.

Never replace a real answer with a generic greeting.
Never invent missing health information.
Never reveal private information.
Never diagnose.
`

/* ==========================================================================
   FEATURE 1: CHAT (Female User & Supporter)
========================================================================== */
export async function generateAIChat({ message, context = {}, role = 'user' }) {
  const isSupporter = role === 'supporter'

  const supporterContextInfo = isSupporter
    ? `
Context Mode: Supporter AI
The user asking is a supporter of a Saathi user.
- If context is empty: Answer generally or educationally. Explain kindly if asked about personal data that no shared context is available.
- If permitted shared context is provided: Answer questions about how to support them based ONLY on what they explicitly shared.
- Never infer or guess private/disabled fields.
`
    : `
Context Mode: User AI
The user asking is managing their own menstrual health and wellbeing.
`

  const systemInstruction = `
${BASE_SYSTEM_PROMPT}
${supporterContextInfo}
`

  const prompt = `
    User's Current Question:
    "${String(message).trim()}"

    Available Context:
    ${JSON.stringify(context, null, 2)}

    Answer ONLY the user's current question.

    Requirements:
    - Be directly relevant to the question.
    - Use provided context only when relevant.
    - Do not repeat the initial Saathi greeting.
    - Do not reuse a previous generic response.
    - Do not invent missing information.
    - Keep the answer clear and concise.
    - If the question is educational, explain it naturally.
    - If the question is personalized, connect the answer to the available logged data.
    - If the question concerns symptoms, provide general supportive information without diagnosing.
    - Do not use markdown bold markers (**text**) in normal chat responses.
    `

  const result = await callGeminiApi({ systemInstruction, prompt, isJson: false })

  if (result.success && result.text) {
    return { response: result.text.trim() }
  }

  // Fallback
  const fallback = getFallbackAnswer(message)
  if (fallback) {
    return { response: fallback }
  }

  return {
    response: isSupporter
      ? "I can help with menstrual health, wellbeing, and supporter questions. I'm temporarily unable to access the AI service, but you can still ask a general or educational question."
      : "I'm temporarily unable to access the AI service. You can still ask a general menstrual-health or wellbeing question, and I'll use an available fallback when possible.",
  }
}

/* ==========================================================================
   FEATURE 2: PERSONALIZED RECOMMENDATIONS (6 Categories)
========================================================================== */
export async function generateCategoryRecommendations({ category, healthData = {}, cycleData = {} }) {
  const systemInstruction = `
${BASE_SYSTEM_PROMPT}
You generate structured health & wellness recommendations for Saathi.
Output MUST be valid JSON with the exact structure:
{
  "summary": "1-2 concise, empowering sentences tailored to the category and logged data",
  "insights": ["insight 1 grounded in logged observations", "insight 2"],
  "actions": ["practical actionable step 1", "practical actionable step 2"]
}
Do NOT wrap output in markdown code blocks. Return raw JSON.
`

  const prompt = `
Category: ${category}
Cycle Info: ${JSON.stringify(cycleData)}
Relevant Health Logs: ${JSON.stringify(healthData)}

Generate structured recommendation for "${category}". Ground advice only in the provided data.
`

  const result = await callGeminiApi({ systemInstruction, prompt, isJson: true })

  if (result.success && result.text) {
    const parsed = parseJsonSafely(result.text, null)
    if (parsed && parsed.summary && Array.isArray(parsed.insights) && Array.isArray(parsed.actions)) {
      return parsed
    }
  }

  return FALLBACK_RECOMMENDATIONS[category] || FALLBACK_RECOMMENDATIONS.nutrition
}

/* ==========================================================================
   FEATURE 3: DAILY AI SUMMARY
========================================================================== */
export async function generateDailySummary({ date, cycle = {}, health = {} }) {
  const systemInstruction = `
    ${BASE_SYSTEM_PROMPT}

    You generate a detailed Daily Health Report for Saathi.

    Analyze today's logged information and explain what the user recorded in
    plain, understandable language.

    Return ONLY valid JSON:

    {
      "report": "A detailed 4-6 sentence interpretation of today's check-in.",
      "symptomAnalysis": [
        {
          "symptom": "symptom name",
          "explanation": "What this symptom can commonly be associated with, without diagnosing.",
          "context": "How this relates to today's logged data."
        }
      ],
      "overallObservation": "A concise overall interpretation of today's wellbeing.",
      "focus": [
        "2-3 practical actions relevant to today's logged data"
      ]
    }

    Rules:
    - Use only today's logged data.
    - Explain symptoms individually when symptoms are logged.
    - Explain whether a symptom can be commonly experienced around menstruation
      without saying that it is definitely caused by the cycle.
    - Consider pain level, sleep, mood, energy, hydration, and other logged factors
      when relevant.
    - Never diagnose.
    - Never say a symptom is definitely normal or harmless.
    - Do not invent missing information.
    - Do not claim that one day establishes a long-term pattern.
    - Mention medical evaluation when symptoms are severe, worsening, persistent,
      unusual, or significantly disruptive.
    - Do not repeat the date inside the report.
    `

  const prompt = `
  Cycle Information:
  ${JSON.stringify(cycle)}

  Today's Logged Health Data:
  ${JSON.stringify(health)}

  Analyze today's check-in and generate the detailed Daily Health Report.
  `

  const result = await callGeminiApi({
    systemInstruction,
    prompt,
    isJson: true,
  })

  if (result.success && result.text) {
    const parsed = parseJsonSafely(result.text, null)

    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.report === 'string'
    ) {
      return {
        report: parsed.report,

        symptomAnalysis: Array.isArray(parsed.symptomAnalysis)
          ? parsed.symptomAnalysis
          : [],

        overallObservation:
          typeof parsed.overallObservation === 'string'
            ? parsed.overallObservation
            : '',

        focus: Array.isArray(parsed.focus)
          ? parsed.focus
          : [],

        source: 'gemini',
      }
    }
  }

  return {
    summary:
      'Your health check-in has been recorded. Saathi will use your logged information to help you understand your wellbeing over time.',
    highlights: [
      health.periodStatus
        ? `Period status: ${health.periodStatus}`
        : 'Check-in logged for today',
      health.pain != null
        ? `Pain level recorded: ${health.pain}/10`
        : 'Pain was not recorded',
      health.energy
        ? `Energy level noted: ${health.energy}`
        : 'Energy was not recorded',
    ],
    observations: [],
    focus: [
      'Continue tracking your wellbeing consistently.',
      'Pay attention to how your energy, sleep, and symptoms feel tomorrow.',
    ],
    source: 'fallback',
  }
}

/* ==========================================================================
   FEATURE 4: MONTHLY AI SUMMARY
========================================================================== */
export async function generateMonthlySummary({ month, cycle = {}, entries = [], trends = {} }) {
  const systemInstruction = `
${BASE_SYSTEM_PROMPT}
You generate a comprehensive monthly health report summary for Saathi.
Output MUST be valid JSON with the exact structure:
{
  "summary": "A 3-5 sentence narrative paragraph summarizing the month's wellbeing, cycle regularity, and symptom trends.",
  "keyPoints": ["3-5 concise key highlights"],
  "patterns": ["3-5 observed correlations or patterns"],
  "notableChanges": ["2-4 notable shifts compared to baseline"],
  "whatToWatch": ["2-4 practical data-grounded wellbeing observations for the upcoming month"]
}
Do NOT wrap in markdown fences. Ground all observations strictly in the provided monthly data. Do not invent patterns.
`

  const prompt = `
Month: ${month}
Cycle Overview: ${JSON.stringify(cycle)}
Monthly Entries Count: ${entries.length}
Sample Logged Entries: ${JSON.stringify(entries.slice(0, 15))}
Computed Trends: ${JSON.stringify(trends)}

Generate the detailed monthly summary for ${month}.
`

  const result = await callGeminiApi({ systemInstruction, prompt, isJson: true })

  if (result.success && result.text) {
    const parsed = parseJsonSafely(result.text, null)
    if (parsed && typeof parsed === 'object') {
      const summary = typeof parsed.summary === 'string' ? parsed.summary : (typeof parsed.narrative === 'string' ? parsed.narrative : '')
      if (summary) {
        return {
          summary,
          keyPoints: Array.isArray(parsed.keyPoints)
            ? parsed.keyPoints
            : Array.isArray(parsed.highlights)
            ? parsed.highlights
            : [],
          patterns: Array.isArray(parsed.patterns)
            ? parsed.patterns
            : Array.isArray(parsed.trends)
            ? parsed.trends
            : [],
          notableChanges: Array.isArray(parsed.notableChanges)
            ? parsed.notableChanges
            : Array.isArray(parsed.changes)
            ? parsed.changes
            : [],
          whatToWatch: Array.isArray(parsed.whatToWatch)
            ? parsed.whatToWatch
            : Array.isArray(parsed.recommendations)
            ? parsed.recommendations
            : [],
        }
      }
    }
  }

  return {
    ...FALLBACK_MONTHLY_SUMMARY,
    summary: `Monthly report for ${month} based on ${entries.length} logged check-in(s). Consistent tracking provides clearer insights into your cycle patterns, comfort, and wellbeing.`,
  }
}
