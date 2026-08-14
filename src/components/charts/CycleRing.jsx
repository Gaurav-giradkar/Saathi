import React from 'react'
import saathiHero from '../../images/saathi-hero.png'

export default function CycleRing() {
  return (
    <div className="relative flex items-center justify-center w-full">
      <img
        src={saathiHero}
        alt="Saathi — Your Cycle. Your Story."
        className="w-full max-w-[900px] h-auto object-contain"
      />
    </div>
  )
}