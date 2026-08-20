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
import { getRecommendations } from '../data/api.js'

/*
|--------------------------------------------------------------------------
| Icon mapping
|--------------------------------------------------------------------------
| mockData.js stores icon names as strings.
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
| Detailed wellness information
|--------------------------------------------------------------------------
| These are educational details shown when the user opens a card.
| The short personalized "tip" still comes from getRecommendations().
*/
const WELLNESS_DETAILS = {
  nutrition: {
    description:
      'Nutrition can support your energy and overall wellbeing throughout your menstrual cycle. Your appetite and food preferences may also change from phase to phase.',

    tips: [
      'Choose balanced meals containing protein, whole grains, fruits, and vegetables.',
      'Include iron-rich foods such as lentils, beans, leafy greens, eggs, or meat where appropriate.',
      'Stay hydrated throughout the day.',
      'Pay attention to changes in appetite and cravings without judging them.',
    ],
  },

  exercise: {
    description:
      'Movement can be adapted to your energy level and how your body feels. There is no single activity that is right for everyone at every point in the cycle.',

    tips: [
      'Choose movement that feels comfortable for your current energy level.',
      'Walking, stretching, yoga, swimming, and cycling are possible options.',
      'Reduce intensity if you feel tired, uncomfortable, or unwell.',
      'Rest when your body needs recovery instead of forcing exercise.',
    ],
  },

  painManagement: {
    description:
      'Period-related discomfort can vary from cycle to cycle. Tracking your pain can help you understand your own pattern and identify what approaches feel helpful.',

    tips: [
      'Try a warm heating pad or hot-water bottle if heat feels helpful.',
      'Gentle movement may feel more comfortable than intense exercise.',
      'Rest when pain is interfering with your normal activities.',
      'Log your pain level, location, symptoms, and relief methods in Daily Health.',
    ],
  },

  selfCare: {
    description:
      'Self-care means responding to what your body and mind need rather than following a fixed routine. What helps you may also change from day to day.',

    tips: [
      'Prioritize adequate sleep and recovery.',
      'Stay hydrated and eat regular balanced meals.',
      'Make time for activities that help you relax.',
      'Use your daily check-ins to notice what actually makes you feel better.',
    ],
  },

  hygiene: {
    description:
      'Good menstrual hygiene can help you stay comfortable while using menstrual products. Different products have different care and usage instructions.',

    tips: [
      'Change menstrual products regularly according to their instructions and your flow.',
      'Wash your hands before and after handling menstrual products.',
      'Follow the cleaning and care instructions for reusable products.',
      'Pay attention to irritation or discomfort and track anything unusual.',
    ],
  },

  mentalWellness: {
    description:
      'Mood and emotional wellbeing can change throughout the cycle, but experiences differ considerably between people. Saathi focuses on what you actually report rather than assuming how you should feel.',

    tips: [
      'Track your actual mood instead of assuming your cycle determines it.',
      'Notice recurring changes in mood, stress, concentration, or energy.',
      'Give yourself time to rest when you feel overwhelmed.',
      'Use your Daily Health check-ins to build a personal pattern over time.',
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

export default function HealthWellness() {
  const [data, setData] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    getRecommendations().then(setData)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Close modal with Escape
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedCategory(null)
      }
    }

    if (selectedCategory) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
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

          {data.categories.map((category) => (
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
              />
            </button>
          ))}

        </div>
      </div>

      {/* ================================================================
          MODAL
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

          {/* ============================================================
              MODAL CARD
          ============================================================= */}
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

            {/* ----------------------------------------------------------
                MODAL HEADER
            ----------------------------------------------------------- */}
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

            {/* ----------------------------------------------------------
                MODAL CONTENT
            ----------------------------------------------------------- */}
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

                    {/* Practical tips */}
                    {details.tips.length > 0 && (
                      <section>
                        <h3 className="font-display text-lg font-semibold text-ink-900 mb-3">
                          What you can do
                        </h3>

                        <div className="space-y-3">

                          {details.tips.map((tip, index) => (
                            <div
                              key={index}
                              className="
                                flex gap-3
                                rounded-xl
                                bg-ink-50
                                p-4
                              "
                            >
                              <div
                                className="
                                  w-7 h-7
                                  rounded-full
                                  bg-rose-100
                                  text-rose-500
                                  flex items-center justify-center
                                  shrink-0
                                "
                              >
                                <Check size={14} strokeWidth={2.5} />
                              </div>

                              <p className="text-sm leading-6 text-ink-700">
                                {tip}
                              </p>
                            </div>
                          ))}

                        </div>
                      </section>
                    )}

                  </div>
                )
              })()}

            </div>

            {/* ----------------------------------------------------------
                MODAL FOOTER
            ----------------------------------------------------------- */}
            <div
              className="
                px-6 py-4
                border-t border-ink-100
                bg-ink-50/40
              "
            >
              <p className="text-xs text-ink-400">
                Saathi provides general wellbeing information tailored to
                your logged experiences and cycle.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  )
}