import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flower2, ArrowRight, CalendarDays, RefreshCcw, Waves, HeartPulse, Coffee, Lightbulb } from 'lucide-react'
import Button from '../components/common/Button.jsx'

import saathiHero from '../images/saathi-hero.png'
import menstrualImg from '../images/Menstural.png'
import follicularImg from '../images/Follicular.png'
import ovulationImg from '../images/Ovulation.png'
import lutealImg from '../images/Luteal.png'

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.2, ...options })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [options])

  return [ref, isIntersecting]
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, isVisible] = useIntersectionObserver()
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function PhaseSection({ num, name, image, description, colorClass, reverse = false, bgClass = 'bg-surface' }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 })
  
  const labelStyles = {
    Menstrual: 'bg-phase-menstrual-light text-phase-menstrual',
    Follicular: 'bg-phase-follicular-light text-phase-follicular',
    Ovulation: 'bg-phase-ovulation-light text-phase-ovulation',
    Luteal: 'bg-phase-luteal-light text-phase-luteal'
  }
  
  return (
    <div className={`w-full ${bgClass} py-12 lg:py-16 transition-colors duration-300`}>
      <div ref={ref} className={`max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center gap-8 lg:gap-14 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <div className={`flex-1 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img src={image} alt={`${name} phase illustration`} className="w-full h-auto max-w-[460px] lg:max-w-[520px] mx-auto object-contain drop-shadow-md" />
        </div>
        <div className={`flex-1 transition-all duration-1000 delay-300 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 ' + (reverse ? '-translate-x-8' : 'translate-x-8')} max-w-md lg:max-w-lg`}>
          <span className={`inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3.5 py-1.5 rounded-full {labelStyles[name]}`}>PHASE 0{num}</span>
          <h3 className="font-display text-4xl sm:text-5xl font-semibold text-ink-900 mb-6">{name}</h3>
          <p className="text-lg text-ink-800 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-bg selection:bg-phase-menstrual-light selection:text-brand-plum overflow-hidden">
      {/* SECTION 1 — STICKY NAVBAR */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface/90 backdrop-blur-md shadow-sm border-b border-ink-100/50' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-coral flex items-center justify-center">
              <Flower2 size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-ink-900">Saathi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-ink-700 hover:text-ink-900 transition-colors">Log in</Link>
            <Button as={Link} to="/signup" size="sm" className="hidden sm:inline-flex">Get Started</Button>
          </div>
        </div>
      </header>

      {/* SECTION 2 — HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="relative z-10 max-w-xl">
            <FadeIn>
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-brand-coral mb-6">
                AI-Powered Menstrual Health
              </span>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-ink-900 leading-[1.05] mb-6">
                Understand your cycle.<br />
                <span className="text-brand-coral">Take better care.</span>
              </h1>
              <p className="text-lg sm:text-xl text-ink-800 leading-relaxed mb-10 max-w-lg">
                Saathi helps you understand your menstrual health, discover your personal patterns, and make informed choices about your wellbeing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button as={Link} to="/signup" size="lg" icon={ArrowRight} iconPosition="right">
                  Start Your Journey
                </Button>
                <Button as={Link} to="/login" variant="outline" size="lg" className="bg-transparent">
                  I already have an account
                </Button>
              </div>
            </FadeIn>
          </div>
          
          <div className="relative lg:h-[600px] flex items-center justify-center mt-10 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-phase-menstrual-light/40 to-phase-ovulation-light/40 rounded-full blur-3xl scale-90"></div>
            <img 
              src={saathiHero} 
              alt="Saathi menstrual health companion illustration" 
              className="relative z-10 w-full max-w-md lg:max-w-[420px] h-auto object-contain drop-shadow-2xl opacity-0 animate-[fadeIn_1.5s_ease-out_forwards]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY SAATHI? */}
      <section className="py-16 lg:py-20 bg-surface relative border-t border-b border-ink-100/55">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
          <FadeIn>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink-900 mb-6">Why Saathi?</h2>
            <p className="text-xl text-ink-800 max-w-2xl mx-auto mb-12 leading-relaxed">
              Because a period is more than a date on a calendar.
              Saathi helps you understand your cycle, recognize changes in your body, track what you experience, and make better-informed choices for your wellbeing.
            </p>
          </FadeIn>
          
          <div className="relative mt-8 mb-6">
            {/* Horizontal Connecting Line (Desktop/Tablet) */}
<div
  className="pointer-events-none absolute top-7 md:top-8 left-[5%] right-[5%] h-[3px] rounded-full z-[1]"
  style={{
    background:
      'linear-gradient(90deg, #E85D75 0%, #4FA89B 33%, #735A9B 66%, #6B5B95 100%)',
  }}
/>
            {/* Vertical Connecting Line (Mobile) */}
            <div className="absolute top-0 bottom-0 left-8 w-[3px] bg-gradient-to-b from-phase-menstrual/40 via-phase-follicular/40 to-phase-luteal/40 md:hidden z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-6 relative z-10">
              {[
                { 
                  label: "Period Date", 
                  desc: "Where your cycle becomes visible.",
                  delay: 0,
                  icon: CalendarDays,
                  bgClass: "bg-phase-menstrual-light text-phase-menstrual",
                  num: "01"
                },
                { 
                  label: "Cycle", 
                  desc: "The rhythm happening throughout the month.",
                  delay: 100,
                  icon: RefreshCcw,
                  bgClass: "bg-phase-follicular-light text-phase-follicular",
                  num: "02"
                },
                { 
                  label: "Body Changes", 
                  desc: "Hormonal changes shape each phase.",
                  delay: 200,
                  icon: Waves,
                  bgClass: "bg-phase-ovulation-light text-phase-ovulation",
                  num: "03"
                },
                { 
                  label: "Symptoms", 
                  desc: "Notice what your body is experiencing.",
                  delay: 300,
                  icon: HeartPulse,
                  bgClass: "bg-phase-luteal-light text-phase-luteal",
                  num: "04"
                },
                { 
                  label: "Daily Life", 
                  desc: "See how it connects with your everyday life.",
                  delay: 400,
                  icon: Coffee,
                  bgClass: "bg-bg text-phase-ovulation",
                  num: "05"
                },
                { 
                  label: "Understanding", 
                  desc: "Turn scattered details into a clearer picture.",
                  delay: 500,
                  icon: Lightbulb,
                  bgClass: "bg-phase-luteal-light text-brand-violet",
                  num: "06"
                }
              ].map((step, i) => {
                const isLast = i === 5;
                return (
                  <FadeIn key={step.label} delay={step.delay} className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center relative">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 mb-0 md:mb-5 mr-5 md:mr-0 relative shadow-md transition-transform duration-700 hover:scale-105 ${
                      isLast
                        ? 'bg-brand-violet text-white border-2 border-brand-violet'
                        : `${step.bgClass} border border-white/60`
                    }`}>
                      <step.icon size={isLast ? 28 : 24} className={isLast ? 'text-white' : ''} strokeWidth={1.5} />
                    
                    </div>
                    <div>
                      <h3 className={`font-display font-semibold mb-1.5 text-base md:text-lg ${isLast ? 'text-brand-violet font-bold' : 'text-ink-900'}`}>{step.label}</h3>
                      <p className={`text-sm leading-relaxed max-w-[200px] mx-auto ${isLast ? 'text-ink-900 font-medium' : 'text-ink-500'}`}>{step.desc}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
          
          <FadeIn delay={600}>
            <p className="mt-20 text-lg font-medium text-ink-800 italic">
              Saathi connects the dots — so you can understand the whole picture.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 5 — FOUR PHASES (Editorial) */}
      <div className="w-full flex flex-col border-b border-ink-100/50">
        <PhaseSection 
          num={1}
          name="Menstrual"
          image={menstrualImg}
          description="During the menstrual phase, the uterine lining sheds as your period begins. Because estrogen and progesterone drop to their lowest levels, it is common to experience physical symptoms like cramps, fatigue, bloating, or lower energy. This is a natural time to prioritize rest, stay hydrated, use heat for comfort, and practice being gentle with yourself."
          colorClass="text-phase-menstrual"
          bgClass="bg-bg"
          reverse={false}
        />
        <PhaseSection 
          num={2}
          name="Follicular"
          image={follicularImg}
          description="During the follicular phase, your body actively prepares for ovulation as a new egg matures. Estrogen levels generally rise during this phase, acting as a natural mood and brain booster. This upward hormonal shift typically rewards you with more energy, better focus, higher productivity, and an ideal mindset to try new things."
          colorClass="text-phase-follicular"
          bgClass="bg-surface"
          reverse={true}
        />
        <PhaseSection 
          num={3}
          name="Ovulation"
          image={ovulationImg}
          description="During the ovulation phase, a sudden hormonal surge triggers the release of a mature egg from an ovary into the fallopian tube. This is a brief but powerful window where your fertility is highest around the surrounding days. Many people experience a natural peak in physical stamina, social confidence, and overall vitality during this high-estrogen event."
          colorClass="text-phase-ovulation"
          bgClass="bg-bg"
          reverse={false}
        />
        <PhaseSection 
          num={4}
          name="Luteal"
          image={lutealImg}
          description="During the luteal phase, the body builds up its defenses and prepares for a possible pregnancy by producing progesterone. If fertilization does not occur, hormone levels drop rapidly toward the end of this phase. This sudden shift often triggers PMS symptoms, mood changes, breast tenderness, or lower stamina, signaling the body to slow down before the cycle restarts."
          colorClass="text-phase-luteal"
          bgClass="bg-surface"
          reverse={true}
        />
      </div>

      {/* SECTION 6 — READY TO BEGIN */}
      <section className="py-32 relative overflow-hidden bg-surface">
        <div className="absolute inset-0 bg-gradient-to-b from-bg to-phase-menstrual-light/30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[100px] opacity-40"></div>
        
        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center relative z-10">
          <FadeIn>
            <h2 className="font-display text-5xl sm:text-6xl font-semibold text-ink-900 mb-4">Now you know the cycle.</h2>
            <p className="font-display text-3xl sm:text-4xl text-brand-coral mb-8 italic font-semibold">Saathi helps you understand your own.</p>
            <p className="text-xl text-ink-800 mb-12 max-w-2xl mx-auto font-medium">
              Start learning about your cycle and make your health journey more personal.
            </p>
            <Button as={Link} to="/signup" size="lg" icon={ArrowRight} iconPosition="right" className="shadow-lift hover:-translate-y-1 transition-transform">
              Get Started
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-100 bg-surface py-10 text-center relative z-10">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Flower2 size={20} className="text-brand-coral" />
          <span className="font-display font-bold text-ink-900">Saathi</span>
        </div>
        <p className="text-sm text-ink-800 mb-4">Understand Your Cycle. Take Better Care.</p>
        <p className="text-xs text-ink-600">
          Made with care. Built for understanding.
        </p>
      </footer>
    </div>
  )
}
