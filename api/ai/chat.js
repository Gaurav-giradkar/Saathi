export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      message,
      context = {},
      role = 'user',
    } = req.body || {}

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Load Gemini keys from Vercel environment variables
    const keys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].filter(Boolean)

    if (keys.length === 0) {
      console.error('[Gemini] No API keys configured')
      return res.status(500).json({
        error: 'Gemini API keys are not configured',
      })
    }

    const prompt = `
You are Saathi, a menstrual cycle and wellbeing companion.

Answer the user's question using the user's logged information when relevant.

User role: ${role}

Cycle and wellbeing context:
${JSON.stringify(context, null, 2)}

User question:
${message}

Give a clear, concise, supportive answer.
Do not invent information that is not present in the user's data.
`

    // Try the available keys until one succeeds
    let lastError = null

    for (const key of keys) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
              },
            }),
          },
        )

        const data = await response.json()

        if (!response.ok) {
          lastError = data
          console.warn(
            `[Gemini] Key failed with HTTP ${response.status}`,
          )
          continue
        }

        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || '')
            .join(' ')
            .trim()

        if (!text) {
          lastError = data
          continue
        }

        return res.status(200).json({
          response: text,
          source: 'gemini',
        })
      } catch (error) {
        lastError = error
        console.warn('[Gemini] Request failed:', error?.message)
      }
    }

    console.error('[Gemini] All API keys failed:', lastError)

    return res.status(503).json({
      error: 'AI service temporarily unavailable',
    })
  } catch (error) {
    console.error('[AI Chat] Server error:', error)

    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}