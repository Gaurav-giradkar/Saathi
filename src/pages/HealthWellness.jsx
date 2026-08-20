import React, { useEffect, useState } from 'react'

import {
  Apple,
  Dumbbell,
  Thermometer,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  X,
  Check,
} from 'lucide-react'

import RecommendationCard from '../components/common/RecommendationCard.jsx'
import Button from '../components/common/Button.jsx'
import { getRecommendations } from '../data/api.js'

/*
|--------------------------------------------------------------------------
| Icon mapping
|--------------------------------------------------------------------------
*/

const ICONS = {
  Apple,
  Dumbbell,
  Thermometer,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
}

/*
|--------------------------------------------------------------------------
| Movement library
|--------------------------------------------------------------------------
*/

const MOVEMENT_LIBRARY = {
  Exercises: [
    {
      name: 'Walking',
      image: '/wellness/walking.png',
      duration: '20–30 min',
      description:
        'A simple low-impact activity that keeps the body moving without placing heavy stress on the joints. It can support general fitness, circulation, mobility, and everyday energy.',
      impact: ['Mobility', 'Energy', 'Mood'],
    },

    {
      name: 'Cycling',
      image: '/wellness/cycling.png',
      duration: '15–30 min',
      description:
        'A moderate cardiovascular activity that mainly works the legs while keeping impact relatively low. It can help build endurance and support overall cardiovascular fitness.',
      impact: ['Endurance', 'Fitness', 'Mobility'],
    },

    {
      name: 'Swimming',
      image: '/wellness/swimming.png',
      duration: '20–30 min',
      description:
        'A full-body, low-impact activity that combines cardiovascular movement with resistance from the water. It can support endurance, strength, and comfortable mobility.',
      impact: ['Endurance', 'Strength', 'Mobility'],
    },

    {
      name: 'Light Strength Training',
      image: '/wellness/strength.png',
      duration: '15–25 min',
      description:
        'Light resistance exercises can help maintain muscle strength and support everyday movement. Controlled bodyweight or light-weight exercises can also improve stability.',
      impact: ['Strength', 'Stability', 'Fitness'],
    },
  ],

  Yoga: [
    {
      name: "Child's Pose",
      image: '/wellness/child-pose.png',
      duration: '1–3 min',
      description:
        'A gentle resting yoga posture that allows the body to slow down while lightly stretching the back, hips, and thighs. It can be used as a calm recovery position.',
      impact: ['Relaxation', 'Mobility', 'Recovery'],
    },

    {
      name: 'Cat–Cow',
      image: '/wellness/cat-cow.png',
      duration: '5–10 reps',
      description:
        'A slow flowing movement between two positions that encourages gentle spinal mobility. It can help move the back through a comfortable range while focusing on steady breathing.',
      impact: ['Mobility', 'Flexibility', 'Relaxation'],
    },

    {
      name: 'Butterfly Pose',
      image: '/wellness/butterfly.png',
      duration: '30–60 sec',
      description:
        'A seated yoga posture that gently stretches the inner thighs and encourages hip mobility. It is a simple, low-intensity option for a relaxed routine.',
      impact: ['Flexibility', 'Mobility', 'Relaxation'],
    },

    {
      name: 'Legs Up the Wall',
      image: '/wellness/legs-wall.png',
      duration: '3–5 min',
      description:
        'A restorative position where the legs are supported against a wall while the body rests. It can be used as a quiet recovery posture when you want to slow down and relax.',
      impact: ['Relaxation', 'Recovery'],
    },
  ],

  Stretching: [
    {
      name: 'Hamstring Stretch',
      image: '/wellness/hamstring.png',
      duration: '20–30 sec',
      description:
        'A simple stretch that targets the muscles along the back of the thighs. Gentle stretching can support flexibility and comfortable lower-body movement.',
      impact: ['Flexibility', 'Mobility'],
    },

    {
      name: 'Hip Flexor Stretch',
      image: '/wellness/hip-flexor.png',
      duration: '20–30 sec',
      description:
        'This stretch targets the muscles at the front of the hips, which can become tight from prolonged sitting or repetitive activity. It can support comfortable hip movement and flexibility.',
      impact: ['Hip Mobility', 'Flexibility'],
    },

    {
      name: 'Lower Back Stretch',
      image: '/wellness/lower-back.png',
      duration: '20–30 sec',
      description:
        'A gentle stretch focused on comfortable movement around the lower back. It can be included in a light mobility routine when the area feels tight or stiff.',
      impact: ['Mobility', 'Relaxation'],
    },

    {
      name: 'Neck & Shoulder Stretch',
      image: '/wellness/neck-shoulder.png',
      duration: '20–30 sec',
      description:
        'Gentle movements that target commonly tense muscles around the neck and shoulders. They can be useful during breaks from studying, working, or extended screen time.',
      impact: ['Mobility', 'Relaxation'],
    },
  ],
}

/*
|--------------------------------------------------------------------------
| Generic wellness details
|--------------------------------------------------------------------------
*/

const WELLNESS_DETAILS = {
  nutrition: {
    description:
      'Nutrition can support energy, recovery, and overall wellbeing throughout the menstrual cycle. Appetite, cravings, and food preferences can change from day to day, so focusing on balanced and varied meals is often more useful than following a rigid diet.',
    tips: [
      'Build meals around a balance of protein, carbohydrates, healthy fats, fruits, and vegetables.',
      'Include nutrient-rich foods such as whole grains, legumes, leafy greens, nuts, seeds, eggs, or other suitable protein sources.',
      'Stay hydrated throughout the day and pay attention to your individual thirst and activity level.',
      'Notice changes in appetite or cravings and use your Daily Health logs to identify patterns over time.',
    ],
  },

  exercise: {
    description:
      'Movement can support physical wellbeing, energy, and recovery, but the most suitable activity can vary with your energy, symptoms, fitness level, and personal preferences.',
    tips: [
      'Choose activities that feel comfortable for your current energy and physical condition.',
      'Walking, stretching, yoga, cycling, swimming, strength training, and other activities can all be appropriate options.',
      'Adjust duration or intensity when you feel unusually tired, uncomfortable, or unwell.',
      'Balance activity with enough recovery and rest, especially after more demanding exercise.',
    ],
  },

  painManagement: {
    description:
      'Period-related discomfort can vary in intensity, location, and duration. Keeping track of pain together with symptoms and relief methods can help you understand your own patterns over time.',
    tips: [
      'Use simple comfort measures such as warmth, gentle movement, or rest when they feel helpful.',
      'Choose lower-intensity movement when stronger activity feels uncomfortable.',
      'Record pain intensity, location, and type so changes can be compared across days and cycles.',
      'Track which relief methods you use and whether they seem helpful for you.',
    ],
  },

  selfCare: {
    description:
      'Self-care is about responding to your physical and emotional needs rather than following the same routine every day. Sleep, hydration, meals, stress, rest, and enjoyable activities can all contribute to overall wellbeing.',
    tips: [
      'Prioritize consistent sleep and give yourself enough time for recovery.',
      'Keep up with hydration and regular, balanced meals where possible.',
      'Make space for activities that help you relax, recharge, or feel supported.',
      'Use your Daily Health check-ins to notice which routines and activities genuinely help you feel better.',
    ],
  },

  hygiene: {
    description:
      'Good menstrual hygiene can help support comfort and reduce irritation while using menstrual products. Product choice and care routines can vary depending on individual needs and preferences.',
    tips: [
      'Change menstrual products according to the product instructions and your flow.',
      'Wash your hands before and after handling menstrual products.',
      'Follow the cleaning, storage, and care instructions for reusable products.',
      'Track irritation, discomfort, or unusual changes so they can be discussed or monitored over time.',
    ],
  },

  mentalWellness: {
    description:
      'Mood, stress, concentration, and emotional wellbeing can change during the menstrual cycle, but experiences are highly individual. Saathi focuses on your reported experiences rather than assuming that a particular cycle phase should make you feel a certain way.',
    tips: [
      'Track your actual mood, stress, energy, and concentration instead of relying on assumptions about your cycle.',
      'Look for recurring patterns across multiple days or cycles rather than drawing conclusions from one check-in.',
      'Give yourself time for rest, recovery, and activities that help you feel calm or supported.',
      'Use Daily Health notes to record important context around changes in mood or wellbeing.',
    ],
  },
}

/*
|--------------------------------------------------------------------------
| Color styles
|--------------------------------------------------------------------------
*/

const COLOR_STYLES = {
  teal: {
    icon: 'bg-teal-50 text-teal-600',
  },

  amber: {
    icon: 'bg-amber-50 text-amber-600',
  },

  rose: {
    icon: 'bg-rose-50 text-rose-500',
  },

  plum: {
    icon: 'bg-purple-50 text-purple-600',
  },
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function HealthWellness() {
  const [data, setData] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [movementTab, setMovementTab] = useState('Exercises')
  const [selectedMovement, setSelectedMovement] = useState(null)

  useEffect(() => {
    getRecommendations()
      .then(setData)
      .catch((error) => {
        console.error('Wellness recommendations error:', error)
        setData({ categories: [] })
      })
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Close category / movement modals with Escape
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return

      if (selectedMovement) {
        setSelectedMovement(null)
        return
      }

      if (selectedCategory) {
        setSelectedCategory(null)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedMovement, selectedCategory])

  /*
  |--------------------------------------------------------------------------
  | Reset movement tab whenever Movement category opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (selectedCategory?.key === 'exercise') {
      setMovementTab('Exercises')
      setSelectedMovement(null)
    }
  }, [selectedCategory])

  if (!data) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading…
      </div>
    )
  }

  return (
    <>
      {/* ================================================================
          PAGE
      ================================================================= */}

      <div className="flex flex-col gap-6 animate-fadeIn">

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Health & wellness
          </h1>

          <p className="text-ink-500 text-sm mt-1">
            Recommendations tailored to your current phase.
          </p>
        </div>

        {/* ================================================================
            WELLNESS CARDS
        ================================================================= */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data.categories || []).map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className="
                text-left
                rounded-2xl
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-md
                focus:outline-none
                focus:ring-4
                focus:ring-rose-100
              "
            >
              <RecommendationCard
                icon={category.icon}
                title={category.title}
                tip={category.tip}
                color={category.color}
                insights={category.insights}
                actions={category.actions}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================
          CATEGORY MODAL
      ================================================================= */}

      {selectedCategory && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            p-4
            bg-ink-900/40
            backdrop-blur-md
          "
          onClick={() => setSelectedCategory(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wellness-title"
            className="
              relative
              w-full
              max-w-2xl
              max-h-[85vh]
              overflow-y-auto
              rounded-3xl
              bg-white
              shadow-2xl
              animate-fadeIn
            "
            onClick={(event) => event.stopPropagation()}
          >

            {/* ============================================================
                MODAL HEADER
            ============================================================= */}

            <div
              className="
                sticky top-0 z-10
                bg-white
                border-b border-ink-100
                px-6 py-5
              "
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-4">

                  {/* Icon */}
                  <div
                    className={`
                      w-14 h-14
                      rounded-2xl
                      flex items-center justify-center
                      shrink-0
                      ${
                        COLOR_STYLES[selectedCategory.color]?.icon ||
                        'bg-rose-50 text-rose-500'
                      }
                    `}
                  >
                    {(() => {
                      const Icon = ICONS[selectedCategory.icon]

                      if (!Icon) return null

                      return <Icon size={26} strokeWidth={1.8} />
                    })()}
                  </div>

                  {/* Title */}
                  <div>
                    <h2
                      id="wellness-title"
                      className="
                        font-display
                        text-xl sm:text-2xl
                        font-semibold
                        text-ink-900
                      "
                    >
                      {selectedCategory.title}
                    </h2>

                    <p className="text-sm text-ink-500 mt-1">
                      Saathi wellness guide
                    </p>
                  </div>
                </div>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="
                    w-9 h-9
                    rounded-full
                    bg-ink-50
                    text-ink-500
                    hover:bg-ink-100
                    flex items-center justify-center
                    shrink-0
                    transition-colors
                  "
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

              </div>
            </div>

            {/* ============================================================
                MODAL CONTENT
            ============================================================= */}

            <div className="p-6">
              {(() => {
                const details =
                  WELLNESS_DETAILS[selectedCategory.key] || {
                    description: selectedCategory.tip,
                    tips: [],
                  }

                return (
                  <div className="space-y-6">

                    {/* Overview */}
                    <section>
                      <h3 className="font-display text-lg font-semibold text-ink-900 mb-2">
                        About {selectedCategory.title}
                      </h3>

                      <p className="text-sm leading-7 text-ink-600">
                        {details.description}
                      </p>
                    </section>

                    {/* Current recommendation */}
                    <section>
                      <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 mb-2">
                          Saathi's recommendation
                        </p>

                        <p className="text-sm leading-6 text-ink-700">
                          {selectedCategory.tip}
                        </p>
                      </div>
                    </section>

                    {/* ======================================================
                        MOVEMENT
                    ======================================================= */}

                    {selectedCategory.key === 'exercise' ? (
                      <section>
                        <h3 className="font-display text-lg font-semibold text-ink-900 mb-3">
                          Explore Movement
                        </h3>

                        {/* Tabs */}
                        <div className="flex gap-2 p-1 bg-ink-50 rounded-xl mb-5">
                          {Object.keys(MOVEMENT_LIBRARY).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => {
                                setMovementTab(tab)
                                setSelectedMovement(null)
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                                movementTab === tab
                                  ? 'bg-white text-rose-600 shadow-sm'
                                  : 'text-ink-500 hover:text-ink-800'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Activity cards */}
                        <div className="flex flex-col gap-4">
                          {MOVEMENT_LIBRARY[movementTab].map((activity) => (
                            <button
                              key={activity.name}
                              type="button"
                              onClick={() => setSelectedMovement(activity)}
                              className="
                                w-full
                                text-left
                                flex
                                items-stretch
                                overflow-hidden
                                rounded-2xl
                                border border-ink-100
                                bg-white
                                hover:shadow-md
                                hover:-translate-y-0.5
                                transition-all
                              "
                            >
                              {/* Image */}
                              <div className="w-40 shrink-0 bg-[#FFF8FB] p-3 flex items-center justify-center">
                                <img
                                  src={activity.image}
                                  alt={activity.name}
                                  className="w-full h-32 object-contain rounded-xl"
                                />
                              </div>

                              {/* Information */}
                              <div className="flex-1 p-4 min-w-0">
                                <h4 className="font-display font-semibold text-ink-900 text-base">
                                  {activity.name}
                                </h4>

                                <p className="text-xs text-rose-600 font-semibold mt-1">
                                  {activity.duration}
                                </p>

                                <p className="text-sm text-ink-600 leading-6 mt-2">
                                  {activity.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {activity.impact.map((item) => (
                                    <span
                                      key={item}
                                      className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-medium"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>
                    ) : (
                      /* ======================================================
                          OTHER WELLNESS CATEGORIES
                      ======================================================= */

                      details.tips.length > 0 && (
                        <section>
                          <h3 className="font-display text-lg font-semibold text-ink-900 mb-3">
                            What you can do
                          </h3>

                          <div className="space-y-3">
                            {details.tips.map((tip, index) => (
                              <div
                                key={index}
                                className="flex gap-3 rounded-xl bg-ink-50 p-4"
                              >
                                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                                  <Check size={14} strokeWidth={2.5} />
                                </div>

                                <p className="text-sm leading-6 text-ink-700">
                                  {tip}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )
                    )}

                  </div>
                )
              })()}
            </div>

            {/* ============================================================
                MODAL FOOTER
            ============================================================= */}

            <div
              className="
                px-6 py-4
                border-t border-ink-100
                bg-ink-50/40
              "
            >
              
            </div>

          </div>
        </div>
      )}

      {/* ================================================================
          MOVEMENT DETAIL MODAL
      ================================================================= */}

      {selectedMovement && (
        <div
          className="
            fixed inset-0 z-[60]
            flex items-center justify-center
            p-4
            bg-black/30
            backdrop-blur-sm
          "
          onClick={() => setSelectedMovement(null)}
        >
          <div
            className="
              w-full
              max-w-lg
              max-h-[85vh]
              overflow-y-auto
              bg-white
              rounded-3xl
              shadow-2xl
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Image */}
            <div className="bg-[#FFF8FB] p-4">
              <img
                src={selectedMovement.image}
                alt={selectedMovement.name}
                className="w-full h-56 object-contain rounded-2xl"
              />
            </div>

            {/* Content */}
            <div className="p-6">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">
                    {selectedMovement.name}
                  </h2>

                  <p className="text-sm text-rose-600 font-semibold mt-1">
                    {selectedMovement.duration}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMovement(null)}
                  className="
                    w-9 h-9
                    rounded-full
                    bg-ink-50
                    flex items-center justify-center
                    text-ink-500
                    hover:bg-ink-100
                  "
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Why */}
              <div className="mt-5">
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-2">
                  Why try this?
                </h3>

                <p className="text-sm text-ink-600 leading-7">
                  {selectedMovement.description}
                </p>
              </div>

              {/* Impact */}
              <div className="mt-5">
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-3">
                  Potential impact
                </h3>

                <div className="flex flex-wrap gap-2">
                  {selectedMovement.impact.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Close */}
              <div className="mt-6">
                <Button
                  variant="subtle"
                  onClick={() => setSelectedMovement(null)}
                >
                  Close
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}