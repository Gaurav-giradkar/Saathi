import React from 'react'
import { Link } from 'react-router-dom'
import { Flower2, Droplet, HeartHandshake, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import CycleRing from '../components/charts/CycleRing.jsx'

const FAQ = [
  { icon: Droplet, title: 'What is this platform?', body: 'A personalized menstrual health companion that tracks your cycle, learns your patterns, and helps the people who support you understand what you need.' },
  { icon: Sparkles, title: 'What is a period?', body: 'The monthly shedding of the uterine lining — one visible part of a longer hormonal cycle happening in the background all month.' },
  { icon: Flower2, title: '4 phases of the cycle', body: 'Menstrual, follicular, ovulation, and luteal — each with its own hormonal rhythm, energy pattern, and needs.' },
  { icon: HeartHandshake, title: 'Why it matters', body: 'Understanding your cycle turns confusing symptoms into a predictable pattern — and turns supporters into real allies.' },
  { icon: ShieldCheck, title: 'Privacy & security', body: 'You decide exactly what is tracked and exactly what is shared. Nothing is visible to anyone without your explicit permission.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center">
            <Flower2 size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-ink-900">Saathi</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-ink-700 hover:text-ink-900 px-2">Log in</Link>
          <Button as={Link} to="/signup" size="sm">Get Started</Button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-16 grid lg:grid-cols-2 gap-10 items-center">
        <div className="animate-slideUp">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full mb-5">
            <Sparkles size={13} /> AI-powered cycle intelligence
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink-900 leading-[1.1] mb-5">
            Understand your cycle.
            <br />
            Bring the people you trust along.
          </h1>
          <p className="text-ink-600 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
            Track symptoms, get personalized insights, and share exactly what you choose with a partner, parent, or friend —
            so support arrives before you have to ask for it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/signup" size="lg" icon={ArrowRight} iconPosition="right">
              Start Your Journey
            </Button>
            <Button as={Link} to="/login" variant="outline" size="lg">
              I already have an account
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-sm !p-8 flex flex-col items-center animate-fadeIn">
            <CycleRing cycleDay={8} cycleLength={28} periodLength={5} phaseKey="follicular" size={200} />
            <p className="text-sm text-ink-500 mt-5 text-center">
              Your entire cycle, mapped as one ring — phase, day, and pattern at a glance.
            </p>
          </Card>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-14">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 mb-8 text-center">
          More than tracking. Built for understanding.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FAQ.map((item, i) => (
            <Card key={i} hover>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                <item.icon size={19} className="text-rose-500" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-base mb-1.5">{item.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 sm:px-10 py-16 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 mb-3">Ready when you are</h2>
        <p className="text-ink-500 mb-7">Set up takes about two minutes. No medical jargon, no judgement.</p>
        <Button as={Link} to="/signup" size="lg" icon={ArrowRight} iconPosition="right">
          Get Started
        </Button>
      </section>

      <footer className="border-t border-ink-100 py-6 text-center text-xs text-ink-400">
        Built for SIH — demo data only, not a medical device.
      </footer>
    </div>
  )
}
