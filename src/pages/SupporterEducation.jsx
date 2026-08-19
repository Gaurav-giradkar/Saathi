import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Modal from '../components/common/Modal.jsx'

const SUPPORTER_EDUCATION_TOPICS = [
  {
    id: 'four-phases-supporter',
    title: 'The Four Cycle Phases',
    icon: 'RefreshCw',
    summary: 'Understand the biological progression of the menstrual, follicular, ovulation, and luteal phases.',
    content: [
      'Menstrual Phase (Days 1–5): The uterine lining sheds when pregnancy has not occurred, causing menstrual bleeding. Cramping and lower energy are common during this time.',
      'Follicular Phase (Days 1–13): Estrogen levels gradually rise as follicles develop in the ovaries. Energy and focus often increase during this phase.',
      'Ovulation Phase (Around Day 14 in a 28-day cycle): An egg is released from an ovary. The exact day varies between individuals and across different cycles.',
      'Luteal Phase (Days 15–28): Progesterone increases to prepare the body for possible pregnancy. If conception does not occur, hormone levels drop, leading to the next period.',
      'Understanding these four phases helps supporters anticipate fluctuations in energy and physical comfort without relying on guesswork.',
    ],
  },
  {
    id: 'supportive-ally',
    title: 'How to Be an Effective Supporter',
    icon: 'HeartHandshake',
    summary: 'Practical principles for supporting a partner, friend, or family member during their cycle.',
    content: [
      'Be Proactive with Practical Help: Take care of everyday responsibilities like preparing meals, washing dishes, or running errands without waiting for an explicit request.',
      'Listen Without Trying to Immediately Fix: Often, empathetic listening and validation ("That sounds really uncomfortable, I\'m here for you") is far more comforting than unasked-for advice.',
      'Learn the Basics Independently: Taking the initiative to understand menstrual health shows genuine care and takes the burden off the other person to educate you.',
      'Respect Preferences and Boundaries: Everyone experiences their cycle differently. Some prefer company and conversation, while others value quiet rest and solitude.',
    ],
  },
  {
    id: 'understanding-symptoms',
    title: 'Understanding Common Symptoms',
    icon: 'Stethoscope',
    summary: 'Recognize the physical symptoms of menstruation and how to provide comfort.',
    content: [
      'Cramps (Dysmenorrhea): Caused by uterine contractions triggered by prostaglandins. Heat pads, warm baths, and rest can often help soothe discomfort.',
      'Fatigue & Energy Dips: Hormonal fluctuations and iron loss can cause noticeable fatigue. Encourage adequate rest and stay patient.',
      'Headaches & Migraines: Sudden changes in estrogen levels can trigger hormonal headaches. Dim lighting, hydration, and a quiet environment are helpful.',
      'Bloating & Digestive Shifts: Hormones can affect fluid retention and digestion. Offering easy-to-digest foods and steady water intake supports comfort.',
      'When to Seek Medical Attention: If symptoms or pain are debilitating and prevent normal activities, gently encourage a consultation with a qualified healthcare professional.',
    ],
  },
  {
    id: 'myths-facts-allies',
    title: 'Myths vs Facts for Supporters',
    icon: 'CheckCircle2',
    summary: 'Separate widespread misconceptions from evidence-based biological facts.',
    content: [
      'Myth: Every cycle is exactly 28 days long.\nFact: Normal cycles can range between 21 to 35 days and can naturally fluctuate from month to month.',
      'Myth: Emotional changes mean someone is "just being dramatic".\nFact: Hormonal shifts directly impact neurotransmitters like serotonin. Emotions and physical discomfort are real and valid.',
      'Myth: Period pain is just something people have to endure silently.\nFact: While mild cramping is common, severe pain is not something to dismiss. It can indicate underlying conditions that deserve medical care.',
      'Myth: Talking about menstruation is awkward or inappropriate.\nFact: Menstruation is a completely normal, healthy physiological process. Normalizing open conversation removes unnecessary stigma.',
    ],
  },
  {
    id: 'respectful-communication',
    title: 'Respectful Communication & Privacy',
    icon: 'MessageSquareHeart',
    summary: 'Best practices for talking about menstrual health respectfully and maintaining trust.',
    content: [
      'Never Attribute Disagreements to Her Period: Saying "Are you on your period?" during a conflict is dismissive and invalidating. Address the subject of the disagreement directly.',
      'Respect Sharing Boundaries: The Saathi platform gives full privacy control to the user. Always respect whatever permissions they choose to enable or keep private.',
      'Ask Clarifying Questions: Phrases like "Would you prefer some quiet time, or would you like company?" demonstrate respect for their immediate comfort.',
      'Maintain Confidentiality: Health information shared with you is private. Never discuss someone else\'s cycle details with others without their explicit consent.',
    ],
  },
  {
    id: 'product-essentials',
    title: 'Menstrual Products & Supplies',
    icon: 'ShoppingBag',
    summary: 'A quick guide to menstrual product types so you can pick up the right supplies with confidence.',
    content: [
      'Sanitary Pads: External absorbent pads attached to underwear. Available in various lengths (regular, long, overnight) and with/without wings.',
      'Tampons: Internal absorbent products inserted into the vagina. Sized by absorbency (Light, Regular, Super). Always check preferred brand and absorbency.',
      'Menstrual Cups: Reusable medical-grade silicone cups that collect fluid. Sized by capacity and firmness.',
      'Period Underwear: Washable underwear with built-in absorbent layers, used alone or as backup protection.',
      'Helpful Tip When Buying Supplies: If you are asked to buy products, taking a photo of the packaging or asking for the exact brand and absorbency level ensures you get the right match.',
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
          Evidence-based explainers, cycle fundamentals, and supportive communication guides.
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
