import React, { useState } from 'react'

import {
  HeartHandshake,
  MessageCircleHeart,
  Sparkles,
  ShieldCheck,
  Coffee,
  Heart,
  Moon,
  Brain,
  Stethoscope,
  Clock,
} from 'lucide-react'

import Card from '../components/common/Card.jsx'
import Modal from '../components/common/Modal.jsx'

const SUPPORTER_WELLNESS_CATEGORIES = [
  {
    key: 'practical',
    title: 'Practical Support',
    icon: HeartHandshake,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    tip:
      'Help with everyday responsibilities when someone needs a lighter day.',

    content: [
      'Offer help with meals, chores, errands, transportation, or other everyday responsibilities when it would genuinely be useful.',
      'Ask what would make their day easier instead of deciding what they need for them.',
      'Offer specific choices such as, “Would you like me to make food, handle the dishes, or give you some quiet time?”',
      'Do not assume someone needs help simply because they seem tired, quiet, or uncomfortable.',
      'Respect a “no” without taking it personally.',
      'Good practical support should reduce pressure, not create another responsibility for the person.',
    ],
  },

  {
    key: 'communication',
    title: 'Empathetic Communication',
    icon: MessageCircleHeart,
    iconBg: 'bg-plum-50',
    iconColor: 'text-plum-600',
    tip:
      'Listen first, ask thoughtful questions, and avoid turning every conversation into a solution.',

    content: [
      'Ask open questions such as, “How are you feeling?” or “What would help right now?”',
      'Listen without immediately trying to fix the situation.',
      'Validate their experience without exaggerating it or dismissing it.',
      'Ask before giving advice.',
      'Avoid phrases such as “It is not that bad,” “You are overthinking,” or “Just calm down.”',
      'Give them enough time to explain what they are experiencing.',
      'Sometimes being heard is more useful than being given a solution.',
    ],
  },

  {
    key: 'comfort',
    title: 'Comfort & Relief',
    icon: Sparkles,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    tip:
      'Learn practical ways to make someone more physically comfortable.',

    content: [
      'Offer things they already know they find comforting.',
      'Depending on the person, comfort may include warmth, rest, a quiet environment, a drink, food, or help with everyday tasks.',
      'Ask what usually helps rather than assuming.',
      'If they want a quieter environment, reduce unnecessary noise or interruptions.',
      'Do not pressure someone to try a particular remedy simply because it helped someone else.',
      'Comfort measures are supportive, but they are not a substitute for professional care when symptoms are serious or persistent.',
    ],
  },

  {
    key: 'boundaries',
    title: 'Respecting Boundaries',
    icon: ShieldCheck,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    tip:
      'Good support includes knowing when to stay close and when to give someone space.',

    content: [
      'Ask whether they want company, conversation, practical help, or some space.',
      'Respect requests for privacy without taking them personally.',
      'Do not repeatedly ask for updates when they do not want to talk.',
      'Do not assume that quietness means they are angry or upset with you.',
      'Never access, discuss, or share health information they have chosen not to share with you.',
      'Remember that support preferences can change from day to day.',
      'Giving someone space can be just as supportive as staying close.',
    ],
  },

  {
    key: 'nutrition',
    title: 'Nourishment & Hydration',
    icon: Coffee,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    tip:
      'Support regular eating and drinking without policing what someone consumes.',

    content: [
      'Offer water, a meal, or a snack when appropriate.',
      'Ask what they feel like eating rather than deciding for them.',
      'Make food easier to access when someone is tired, busy, or not feeling well.',
      'Respect appetite changes, food preferences, allergies, and dietary choices.',
      'Avoid comments that create guilt or pressure around eating.',
      'Do not assume that one particular food is medically necessary for someone.',
      'Support comfortable routines rather than trying to control what they eat or drink.',
    ],
  },

  {
    key: 'patience',
    title: 'Patience & Reassurance',
    icon: Heart,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    tip:
      'Be calm, reliable, and present without creating additional pressure.',

    content: [
      'Give them time when they need it.',
      'Reassure without dismissing what they are experiencing.',
      'Keep your tone calm during stressful moments.',
      'Do not demand immediate explanations or responses.',
      'Follow through when you say you will help.',
      'Consistency builds trust more effectively than dramatic gestures.',
      'Let them know support is available without making them feel dependent on you.',
    ],
  },

  {
    key: 'rest',
    title: 'Supporting Rest & Recovery',
    icon: Moon,
    iconBg: 'bg-plum-50',
    iconColor: 'text-plum-600',
    tip:
      'Help create conditions where someone can rest without feeling guilty or pressured.',

    content: [
      'Encourage rest when they say they need it.',
      'Reduce unnecessary noise, interruptions, or tasks when appropriate.',
      'Offer to handle a small responsibility while they rest.',
      'Do not equate rest with laziness or lack of motivation.',
      'Avoid pressuring someone to push through discomfort or exhaustion.',
      'Ask what would make resting easier instead of deciding for them.',
      'Respect their need for sleep, quiet time, or reduced activity.',
    ],
  },

  {
    key: 'overwhelmed',
    title: 'When Someone Feels Overwhelmed',
    icon: Brain,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    tip:
      'Respond calmly when stress, emotions, responsibilities, or discomfort become too much.',

    content: [
      'Stay calm and avoid adding more pressure.',
      'Ask one simple question at a time rather than overwhelming them with solutions.',
      'Help break practical problems into smaller tasks when they want that help.',
      'Offer your presence without demanding conversation.',
      'Avoid saying “calm down” or comparing their situation with someone else’s.',
      'Ask whether they want listening, practical help, or some space.',
      'Sometimes the best first step is simply making the situation feel less demanding.',
    ],
  },

  {
    key: 'professional-help',
    title: 'When to Encourage Professional Help',
    icon: Stethoscope,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    tip:
      'Recognize when supportive care is no longer enough.',

    content: [
      'Take severe, worsening, persistent, or disruptive symptoms seriously.',
      'Encourage appropriate professional support when someone is struggling significantly.',
      'Do not diagnose the person yourself.',
      'Do not dismiss concerning symptoms as “just hormones” or “just their period.”',
      'If they want help seeking care, offer practical support such as helping them arrange an appointment or get there.',
      'Respect their decisions about how and when to seek professional help.',
      'Being supportive does not mean being responsible for diagnosing or treating another person.',
    ],
  },
]

export default function SupporterWellness() {
  const [active, setActive] = useState(null)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">

      {/* HEADER */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          Supporter wellness & care
        </h1>

        <p className="text-ink-500 text-sm mt-1">
          Practical, respectful ways to support someone through everyday
          physical, emotional, and personal wellbeing needs.
        </p>
      </div>

      {/* WELLNESS TOPICS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUPPORTER_WELLNESS_CATEGORIES.map((topic) => {
          const Icon = topic.icon

          return (
            <Card
              key={topic.key}
              hover
              as="button"
              onClick={() => setActive(topic)}
              className="text-left flex flex-col items-start"
            >
              <div
                className={[
                  'w-11 h-11 rounded-xl flex items-center justify-center mb-3',
                  topic.iconBg,
                ].join(' ')}
              >
                <Icon
                  size={20}
                  className={topic.iconColor}
                  strokeWidth={2}
                />
              </div>

              <h3 className="font-display font-semibold text-ink-900 text-[15px] mb-1">
                {topic.title}
              </h3>

              <p className="text-sm text-ink-500 leading-relaxed">
                {topic.tip}
              </p>
            </Card>
          )
        })}
      </div>

      {/* EVERYDAY SUPPORTIVE HABITS */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock
            size={18}
            className="text-teal-600"
          />

          <h2 className="font-display font-semibold text-ink-900 text-base sm:text-lg">
            Everyday Supportive Habits
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">

          <div className="p-4 rounded-xl bg-bg border border-ink-100 flex flex-col gap-1.5">
            <p className="font-semibold text-ink-900 text-sm">
              Check in thoughtfully
            </p>

            <p className="text-xs text-ink-500 leading-relaxed">
              “Thinking of you. Let me know if you need anything today.”
              shows care without creating pressure.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg border border-ink-100 flex flex-col gap-1.5">
            <p className="font-semibold text-ink-900 text-sm">
              Offer, don't assume
            </p>

            <p className="text-xs text-ink-500 leading-relaxed">
              Ask whether they want help, company, or some space instead
              of deciding for them.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bg border border-ink-100 flex flex-col gap-1.5">
            <p className="font-semibold text-ink-900 text-sm">
              Respect changing needs
            </p>

            <p className="text-xs text-ink-500 leading-relaxed">
              What helped yesterday may not be what they want today.
              Let their current preference guide your support.
            </p>
          </div>

        </div>
      </Card>

      {/* DETAIL MODAL */}
      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title}
        size="lg"
      >
        <div className="flex flex-col gap-4">

          {active?.content.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                {index + 1}
              </span>

              <p className="text-sm text-ink-700 leading-relaxed">
                {item}
              </p>
            </div>
          ))}

        </div>
      </Modal>

    </div>
  )
}