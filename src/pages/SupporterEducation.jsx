import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Modal from '../components/common/Modal.jsx'

export const SUPPORTER_EDUCATION_TOPICS = [
  {
    id: 'four-phases-supporter',
    title: 'The Four Cycle Phases',
    icon: 'RefreshCw',
    summary:
      'Understand the biological progression of the menstrual, follicular, ovulation, and luteal phases.',

    content: [
      'Menstrual Phase: The uterine lining is shed when pregnancy has not occurred, causing menstrual bleeding. Some people experience cramps, fatigue, or other symptoms during this phase, while others may notice little discomfort.',

      'Follicular Phase: This phase begins on the first day of menstruation and continues toward ovulation. Follicles develop in the ovaries and estrogen generally rises. Experiences of energy, mood, and focus vary between individuals.',

      'Ovulation: An egg is released from an ovary. The timing varies between individuals and across cycles, so an estimated ovulation day should be treated as an approximation rather than an exact date.',

      'Luteal Phase: After ovulation, the body prepares for a possible pregnancy. Some people notice changes in mood, energy, appetite, or physical symptoms during this phase, while others notice little change.',

      'Understanding the four phases provides useful context, but a cycle phase should never be used to assume how someone will feel or behave.',
    ],
  },

  {
    id: 'supportive-ally',
    title: 'How to Be an Effective Supporter',
    icon: 'HeartHandshake',
    summary:
      'Practical principles for supporting a partner, friend, or family member during their cycle.',

    content: [
      'Offer Practical Help: Help with meals, chores, errands, or other everyday responsibilities when it would be useful.',

      'Listen Before Trying to Fix: Sometimes empathetic listening and validation are more helpful than immediately offering advice.',

      'Learn the Basics Independently: Understanding menstrual health yourself means the other person does not always have to explain everything to you.',

      'Respect Preferences and Boundaries: Some people prefer company and conversation, while others prefer quiet or time alone.',

      'Ask Rather Than Assume: The best support is based on what the person actually wants, not on assumptions about their cycle phase.',
    ],
  },

  {
    id: 'understanding-symptoms',
    title: 'Understanding Common Symptoms',
    icon: 'Stethoscope',
    summary:
      'Recognize common menstrual symptoms and understand how to provide appropriate support.',

    content: [
      'Cramps: Menstrual cramps can occur when the uterus contracts. Some people find heat, rest, or gentle movement helpful for mild discomfort.',

      'Fatigue and Lower Energy: Some people experience tiredness or lower energy around parts of their cycle. Sleep, stress, overall health, and many other factors can also affect energy.',

      'Headaches and Migraines: Some people experience headaches or migraines around their period or other parts of the cycle. A quiet environment, hydration, and rest may be helpful for some people.',

      'Bloating and Digestive Changes: Some people notice bloating or changes in digestion around their cycle.',

      'When to Seek Medical Attention: Severe, worsening, persistent, or disruptive symptoms should not simply be dismissed as "normal." Encourage the person to speak with a qualified healthcare professional when appropriate.',
    ],
  },

  {
    id: 'myths-facts-allies',
    title: 'Myths vs Facts for Supporters',
    icon: 'CheckCircle2',
    summary:
      'Separate widespread misconceptions from evidence-based menstrual health information.',

    content: [
      'Myth: Every cycle is exactly 28 days long.\nFact: Cycle length varies between people and can also vary from one cycle to another.',

      'Myth: Someone’s period automatically explains their mood or behavior.\nFact: People experience menstrual cycles differently, and emotions should not automatically be attributed to menstruation.',

      'Myth: Period pain is something everyone should simply tolerate.\nFact: Mild discomfort can be common, but severe or disruptive pain should not be dismissed and may require professional evaluation.',

      'Myth: Talking about menstruation is awkward or inappropriate.\nFact: Menstruation is a normal physiological process, and respectful communication can make it easier for someone to ask for support.',
    ],
  },

  {
    id: 'respectful-communication',
    title: 'Respectful Communication & Privacy',
    icon: 'MessageSquareHeart',
    summary:
      'Best practices for talking about menstrual health respectfully and maintaining trust.',

    content: [
      'Never Attribute Disagreements to Their Period: Saying "Are you on your period?" during a disagreement can be dismissive. Address the actual issue instead.',

      'Respect Sharing Boundaries: Saathi allows the user to choose what information is shared. Those choices should always be respected.',

      'Ask Clarifying Questions: "Would you prefer some quiet time, or would you like company?" gives the person control over the kind of support they receive.',

      'Maintain Confidentiality: Health information shared with you is private. Do not discuss someone else’s cycle or health information with others without their permission.',
    ],
  },

  {
    id: 'product-essentials',
    title: 'Menstrual Products & Supplies',
    icon: 'ShoppingBag',
    summary:
      'Understand common menstrual product types so you can help when someone asks.',

    content: [
      'Sanitary Pads: External absorbent products available in different sizes, lengths, and absorbencies.',

      'Tampons: Internal menstrual products available in different absorbencies. Always follow the product instructions and use the type and absorbency preferred by the person using them.',

      'Menstrual Cups: Reusable internal products that collect menstrual fluid. Size, capacity, and care requirements vary by product.',

      'Period Underwear: Reusable underwear designed with absorbent layers and available in different absorbencies.',

      'Helpful Tip When Buying Supplies: Ask for the exact product, brand, size, or absorbency rather than guessing. A photo of the packaging can also help you buy the correct item.',
    ],
  },

  {
    id: 'when-space-needed',
    title: 'When Someone Needs Space',
    icon: 'UserX',
    summary:
      'Understand why giving someone space can sometimes be the most supportive choice.',

    content: [
      'Support does not always mean staying close. Sometimes someone may simply want rest, privacy, or time alone.',

      'Do not assume that quietness or less communication means they are angry or upset with you.',

      'A simple message such as "I’m here if you need anything" can communicate support without creating pressure.',

      'If someone asks for space, respect the request and avoid making them feel guilty for needing it.',

      'Good support is flexible: sometimes it means helping, sometimes listening, and sometimes simply being available.',
    ],
  },
    {
    id: 'different-needs',
    title: 'Supporting Different Needs',
    icon: 'Users',
    summary:
      'Learn how support can look different from one person to another.',

    content: [
      'There is no single way to support someone during their cycle. One person may want practical help, while another may prefer conversation, reassurance, or some quiet time.',

      'Ask what they need instead of assuming. A simple question such as "Would you like help, company, or some space?" gives them control over the situation.',

      'Support needs can also change from day to day. What was helpful during one cycle or one day may not be what the person wants another time.',

      'The goal is not to manage someone’s experience for them. Good support means listening, respecting their choices, and being available when they want help.',

      'Saathi helps make this easier by allowing the user to choose what information they share with their supporter.',
    ],
  },
    {
      id: 'mental-emotional-support',
      title: 'Mental & Emotional Wellbeing',
      icon: 'Brain',
      summary:
        'Understand mood, stress, energy, and emotional wellbeing while offering supportive, non-judgmental care.',

      content: [
        'Mood Can Vary: Mood can change for many reasons, including stress, sleep, relationships, workload, and hormonal changes. Do not automatically attribute emotional changes to menstruation.',

        'Listen Without Dismissing: If someone wants to talk, listen without minimizing their feelings or immediately trying to solve the problem.',

        'Ask What They Need: A simple question such as "Would you like me to listen, help, or give you some space?" lets them decide what kind of support feels useful.',

        'Respect Emotional Boundaries: Do not pressure someone to explain their feelings or continue a conversation when they would prefer some privacy.',

        'Watch for Persistent Concerns: Significant or persistent changes in mood, anxiety, or wellbeing should not simply be attributed to the menstrual cycle. Encourage appropriate professional support when needed.',
      ],
    },
]

export default function SupporterEducation() {
  const [active, setActive] = useState(null)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          Supporter education center
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Understand menstrual health, cycle fundamentals, and how to provide respectful support.
        </p>
      </div>

      {/* Grid of Topics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUPPORTER_EDUCATION_TOPICS.map((topic) => {
          const Icon = Icons[topic.icon] || Icons.BookOpen
          return (
            <Card
              key={topic.id}
              hover
              as="button"
              onClick={() => setActive(topic)}
              className="text-left flex flex-col items-start"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <Icon size={20} className="text-teal-600" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-[15px] mb-1">
                {topic.title}
              </h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                {topic.summary}
              </p>
            </Card>
          )
        })}
      </div>

      {/* Modal Dialog */}
      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title}
        size="lg"
      >
        <div className="flex flex-col gap-3.5">
          {active?.content.map((p, i) => (
            <p key={i} className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </Modal>
    </div>
  )
}