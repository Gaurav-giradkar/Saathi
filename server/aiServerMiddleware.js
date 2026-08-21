/**
 * Node.js Server Middleware for Saathi AI
 * Exposes /api/ai/* endpoints with server-side validation and multi-key fallback
 */

import {
  generateAIChat,
  generateCategoryRecommendations,
  generateDailySummary,
  generateMonthlySummary,
  initGeminiKeys,
} from './geminiService.js'

/**
 * Filter shared context strictly by server-verified permissions
 */
function sanitizeSupporterContext(context = {}, permissions = {}) {
  // cyclePhase is PERMANENTLY LOCKED OFF
  const sanitized = {}

  // Explicit allowed permission keys mapping
  if (permissions.periodStatus && context.periodStatus) {
    sanitized.periodStatus = context.periodStatus
  }

  if (permissions.expectedPeriod && context.expectedPeriod) {
    sanitized.expectedPeriod = context.expectedPeriod
  }

  if (permissions.painLevel && context.painLevel != null) {
    sanitized.painLevel = context.painLevel
  }

  if (permissions.symptoms && Array.isArray(context.symptoms) && context.symptoms.length > 0) {
    sanitized.symptoms = context.symptoms
  }

  if (permissions.mood && context.mood) {
    sanitized.mood = context.mood
  }

  if (permissions.dietNutrition && context.dietNutrition) {
    sanitized.dietNutrition = {
      meals: Array.isArray(context.dietNutrition.meals) ? context.dietNutrition.meals : [],
      appetite: context.dietNutrition.appetite || '',
      cravings: Array.isArray(context.dietNutrition.cravings) ? context.dietNutrition.cravings : [],
      waterLiters: context.dietNutrition.waterLiters ?? null,
    }
  }

  if (permissions.sleep && context.sleep) {
    sanitized.sleep = {
      duration: context.sleep.duration ?? null,
      quality: context.sleep.quality || '',
      issues: Array.isArray(context.sleep.issues) ? context.sleep.issues : [],
    }
  }

  if (permissions.medicalInfo && context.medicalInfo) {
    sanitized.medicalInfo = {
      notes: context.medicalInfo.notes || '',
      painLocations: Array.isArray(context.medicalInfo.painLocations) ? context.medicalInfo.painLocations : [],
      painTypes: Array.isArray(context.medicalInfo.painTypes) ? context.medicalInfo.painTypes : [],
      relief: Array.isArray(context.medicalInfo.relief) ? context.medicalInfo.relief : [],
    }
  }

  if (permissions.energy && context.energy) {
    sanitized.energy = context.energy
  }

  return sanitized
}

/**
 * Helper to parse JSON request body
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      // Protection against huge payloads
      if (data.length > 1e6) {
        req.destroy()
        reject(new Error('Payload too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (err) {
        reject(new Error('Invalid JSON payload'))
      }
    })
    req.on('error', reject)
  })
}

/**
 * Send JSON response helper
 */
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

/**
 * AI Server Middleware
 */
export function createAiMiddleware(env = process.env) {
  initGeminiKeys(env)

  return async function aiMiddleware(req, res, next) {
    const url = req.url ? req.url.split('?')[0] : ''

    // Only process /api/ai/* endpoints
    if (!url.startsWith('/api/ai/')) {
      return next()
    }

    // Health check endpoint
    if (url === '/api/ai/health' && req.method === 'GET') {
      const { getGeminiKeyStatus } = await import('./geminiService.js')
      return sendJson(res, 200, {
        status: 'ok',
        ...getGeminiKeyStatus(),
      })
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' })
    }

    try {
      const body = await parseRequestBody(req)

      // Route: POST /api/ai/chat
      if (url === '/api/ai/chat') {
        const { message, context = {}, role = 'user', permissions = {}, isConnected = false } = body

        if (!message || typeof message !== 'string') {
          return sendJson(res, 400, { error: 'Message string is required.' })
        }

        let finalContext = {}

        if (role === 'supporter') {
          // If not connected, context is strictly empty
          if (isConnected) {
            // Validate server-side permissions
            finalContext = sanitizeSupporterContext(context, permissions)
          }
        } else {
          // Female user: use only provided relevant logged fields
          finalContext = {
            cycleDay: context.cycleDay,
            phase: context.phase,
            periodStatus: context.periodStatus,
            pain: context.pain,
            mood: context.mood,
            energy: context.energy,
            sleep: context.sleep,
            symptoms: Array.isArray(context.symptoms) ? context.symptoms : [],
            waterLiters: context.waterLiters,
            notes: context.notes,
          }
        }

        const result = await generateAIChat({
          message,
          context: finalContext,
          role,
        })

        return sendJson(res, 200, result)
      }

      // Route: POST /api/ai/recommendation or /api/ai/recommendations
      if (url === '/api/ai/recommendation' || url === '/api/ai/recommendations') {
        const { category, healthData = {}, cycleData = {} } = body

        if (!category) {
          return sendJson(res, 400, { error: 'Category is required.' })
        }

        // Minimal data per category
        const minimalHealth = {}
        if (category === 'nutrition') {
          minimalHealth.meals = healthData.meals
          minimalHealth.appetite = healthData.appetite
          minimalHealth.cravings = healthData.cravings
          minimalHealth.waterLiters = healthData.waterLiters
          minimalHealth.energy = healthData.energy
          minimalHealth.symptoms = healthData.symptoms
        } else if (category === 'exercise') {
          minimalHealth.energy = healthData.energy
          minimalHealth.pain = healthData.pain
          minimalHealth.sleep = healthData.sleep
          minimalHealth.exerciseMinutes = healthData.exerciseMinutes
          minimalHealth.symptoms = healthData.symptoms
        } else if (category === 'painManagement') {
          minimalHealth.pain = healthData.pain
          minimalHealth.painLocations = healthData.painLocations
          minimalHealth.painTypes = healthData.painTypes
          minimalHealth.symptoms = healthData.symptoms
          minimalHealth.relief = healthData.relief
        } else if (category === 'selfCare') {
          minimalHealth.sleep = healthData.sleep
          minimalHealth.energy = healthData.energy
          minimalHealth.waterLiters = healthData.waterLiters
          minimalHealth.pain = healthData.pain
          minimalHealth.mood = healthData.mood
        } else if (category === 'hygiene') {
          minimalHealth.periodStatus = healthData.periodStatus
          minimalHealth.bleeding = healthData.bleeding
          minimalHealth.productsUsed = healthData.productsUsed
          minimalHealth.protectionUsed = healthData.protectionUsed
          minimalHealth.symptoms = healthData.symptoms
        } else if (category === 'mentalWellness') {
          minimalHealth.mood = healthData.mood
          minimalHealth.energy = healthData.energy
          minimalHealth.sleep = healthData.sleep
          minimalHealth.symptoms = healthData.symptoms
          minimalHealth.notes = healthData.notes
        }

        const result = await generateCategoryRecommendations({
          category,
          healthData: minimalHealth,
          cycleData: {
            day: cycleData.cycleDay || cycleData.day,
            phase: cycleData.phase?.label || cycleData.phase,
          },
        })

        return sendJson(res, 200, result)
      }

      // Route: POST /api/ai/daily-summary
      if (url === '/api/ai/daily-summary') {
        const { date, cycle = {}, health = {} } = body

        if (!date) {
          return sendJson(res, 400, { error: 'Date is required.' })
        }

        // Minimized payload
        const minimalHealth = {
          periodStatus: health.periodStatus,
          bleeding: health.bleeding,
          pain: health.pain,
          painLocations: Array.isArray(health.painLocations) ? health.painLocations : [],
          painTypes: Array.isArray(health.painTypes) ? health.painTypes : [],
          mood: health.mood || health.moods,
          energy: health.energy,
          sleep: health.sleep,
          sleepQuality: health.sleepQuality,
          waterLiters: health.waterLiters,
          symptoms: Array.isArray(health.symptoms) ? health.symptoms : [],
          meals: Array.isArray(health.meals) ? health.meals : [],
          cravings: Array.isArray(health.cravings) ? health.cravings : [],
          relief: Array.isArray(health.relief) ? health.relief : [],
          exerciseMinutes: health.exerciseMinutes,
          notes: health.notes,
        }

        const result = await generateDailySummary({
          date,
          cycle: {
            day: cycle.cycleDay || cycle.day,
            phase: cycle.phase?.label || cycle.phase,
          },
          health: minimalHealth,
        })

        return sendJson(res, 200, result)
      }

      // Route: POST /api/ai/monthly-summary
      if (url === '/api/ai/monthly-summary') {
        const { month, cycle = {}, entries = [], trends = {} } = body

        if (!month) {
          return sendJson(res, 400, { error: 'Month is required.' })
        }

        const result = await generateMonthlySummary({
          month,
          cycle,
          entries: Array.isArray(entries) ? entries : [],
          trends,
        })

        return sendJson(res, 200, result)
      }

      return sendJson(res, 404, { error: `AI endpoint not found: ${url}` })
    } catch (err) {
      console.error('[AI Middleware Error]:', err)
      return sendJson(res, 500, {
        error: 'Internal server error processing AI request',
        message: err.message,
      })
    }
  }
}
