import React, { useState } from 'react'
import CustomIcon from '../components/common/CustomIcon.jsx'
import Card from '../components/common/Card.jsx'
import Modal from '../components/common/Modal.jsx'
import { EDUCATION_TOPICS } from '../data/mockData.js'

export default function EducationCenter() {
  const [active, setActive] = useState(null)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Education center</h1>
        <p className="text-ink-500 text-sm mt-1">Understand your cycle, your body, and the changes you experience.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EDUCATION_TOPICS.map((topic) => {
          return (
            <Card key={topic.id} hover as="button" onClick={() => setActive(topic)} className="text-left">
              <div className="w-11 h-11 rounded-xl bg-plum-50 flex items-center justify-center mb-3">
                <CustomIcon
                  type={
                    topic.title === 'About Periods'
                      ? 'periods'
                      : topic.title === 'The Four Cycle Phases'
                        ? 'cycle-phases'
                        : topic.title === 'Understanding Hormones'
                          ? 'hormones'
                          : topic.title === 'Symptoms Guide'
                            ? 'symptoms'
                            : topic.title === 'Mental Wellness'
                              ? 'mental-wellness'
                              : topic.title === 'Myths vs Facts'
                                ? 'myths-facts'
                                : topic.title === 'Menstrual Hygiene'
                                  ? 'menstrual-hygiene'
                                  : topic.title === 'Understanding Your Patterns'
                                    ? 'patterns'
                                    : 'self-care-wellbeing'
                  }
                />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-[15px] mb-1">{topic.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{topic.summary}</p>
            </Card>
          )
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title} size="lg">
        <div className="flex flex-col gap-3">
          {active?.content.map((p, i) => (
            <p key={i} className="text-sm text-ink-700 leading-relaxed">{p}</p>
          ))}
        </div>
      </Modal>
    </div>
  )
}
