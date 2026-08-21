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