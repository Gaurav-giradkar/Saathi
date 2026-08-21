export const SUPPORTER_AI_FALLBACKS = [
  {
    question: 'What is PMS?',
    answer:
      'PMS refers to physical and emotional symptoms that can happen before a period. Symptoms vary from person to person and may include cramps, bloating, fatigue, mood changes, or breast tenderness.',
  },

  {
    question: 'What causes period cramps?',
    answer:
      'Period cramps are commonly associated with uterine contractions during menstruation. Gentle heat, rest, hydration, and comfortable movement may help some people manage discomfort.',
  },

  {
    question: 'What are common period symptoms?',
    answer:
      'Common symptoms can include cramps, bloating, fatigue, headaches, breast tenderness, mood changes, and changes in appetite. Experiences vary widely between people.',
  },

  {
    question:
      'How can I support someone during their period?',
    answer:
      'Ask what kind of support they want. Listening, offering practical help, respecting their privacy, and giving them space when needed are all useful forms of support.',
  },

  {
    question: 'What are good foods during periods?',
    answer:
      'A balanced diet with regular meals can support general wellbeing. Foods containing iron, protein, whole grains, fruits, vegetables, and adequate fluids can be part of a healthy diet.',
  },

  {
    question: 'What is menstrual hygiene?',
    answer:
      'Menstrual hygiene involves changing period products regularly, keeping the area clean and dry, washing hands before and after changing products, and using products that are comfortable and appropriate for the person.',
  },
]

export const PREDEFINED_QUESTIONS =
  SUPPORTER_AI_FALLBACKS.map(
    (item) => item.question,
  )

export function getFallbackAnswer(question) {
  const normalized = String(question || '')
    .trim()
    .toLowerCase()

  const match =
    SUPPORTER_AI_FALLBACKS.find(
      (item) =>
        item.question
          .trim()
          .toLowerCase() === normalized,
    )

  return match?.answer || null
}

export const FALLBACK_RECOMMENDATIONS = {
  nutrition: {
    summary: 'Balanced meals and regular hydration support your energy and everyday wellbeing.',
    insights: [
      'Focus on regular meals and tune into your appetite and cravings.',
      'Maintaining steady hydration helps prevent fatigue and cramps.',
    ],
    actions: [
      'Include a mix of protein, whole grains, fruits, and vegetables in your meals.',
      'Keep a water bottle nearby and sip fluids consistently through the day.',
    ],
  },
  exercise: {
    summary: 'Match your movement to how your body feels today with gentle activity and adequate rest.',
    insights: [
      'Your physical capacity changes throughout your cycle.',
      'Low-impact movement can ease stiffness and boost circulation.',
    ],
    actions: [
      'Choose gentle stretching, light walking, or restful recovery based on your energy.',
      'Allow yourself to take rest breaks whenever your body asks for it.',
    ],
  },
  painManagement: {
    summary: 'Track discomfort patterns and rely on gentle, proven comfort methods for relief.',
    insights: [
      'Recording pain intensity and symptoms helps understand what brings relief.',
      'Gentle heat and comfortable resting positions can reduce muscle tension.',
    ],
    actions: [
      'Try applying a warm compress or heat pack to tense areas.',
      'Rest in a comfortable position and record how your body responds.',
    ],
  },
  selfCare: {
    summary: 'Prioritize restorative rest, mental pauses, and calming routines throughout the day.',
    insights: [
      'Quality sleep and regular hydration are foundational to feeling grounded.',
      'Setting boundaries around your time helps conserve daily energy.',
    ],
    actions: [
      'Create a calm wind-down routine 30 minutes before sleep.',
      'Take short, quiet breathing breaks between tasks when feeling fatigued.',
    ],
  },
  hygiene: {
    summary: 'Consistent, gentle hygiene routines keep you fresh, comfortable, and protected.',
    insights: [
      'Changing menstrual products on schedule prevents discomfort and skin irritation.',
      'Choose breathable fabrics and products that suit your current flow.',
    ],
    actions: [
      'Change menstrual products every 4–6 hours or as recommended for your flow.',
      'Always wash hands before and after handling menstrual products.',
    ],
  },
  mentalWellness: {
    summary: 'Acknowledge your emotional state with kindness and make space for what you need.',
    insights: [
      'Mood shifts and focus variations are natural experiences across the month.',
      'Practicing self-compassion reduces stress and mental fatigue.',
    ],
    actions: [
      'Take 5 minutes for mindful breathing or gentle reflection.',
      'Engage in an activity that brings you comfort and peace of mind.',
    ],
  },
}

export const FALLBACK_DAILY_SUMMARY = {
  summary: 'Your daily check-in has been recorded. Consistent logging creates meaningful personal patterns for your wellbeing and cycle insights.',
  keyPoints: [
    'Daily check-in logged and securely saved',
    'Health metrics and comfort observations updated',
    'Cycle trends and personalized recommendations refreshed',
  ],
}

export const FALLBACK_MONTHLY_SUMMARY = {
  summary: 'Your monthly overview highlights your cycle regularity, recorded symptoms, and key wellbeing observations. Continued logging empowers you with clear health trends over time to share with your healthcare provider.',
  keyPoints: [
    'Monthly cycle tracking and phase patterns recorded',
    'Symptom frequency and helpful relief methods summarized',
    'Baseline metrics established for provider discussions',
    'Check-in consistency supports accurate wellbeing trends',
  ],
  patterns: [
    'Consistent check-ins provide clearer visibility into monthly cycles',
    'Tracking relief methods highlights what brings you the greatest comfort',
    'Energy and sleep variations correspond with cycle milestones',
  ],
  notableChanges: [
    'Monthly log history updated for your personal health records',
    'Symptom patterns compared against your historical baseline',
  ],
  whatToWatch: [
    'Notice days with elevated pain or fatigue and prioritize gentle recovery',
    'Maintain steady hydration and restful sleep during transitional cycle phases',
  ],
}