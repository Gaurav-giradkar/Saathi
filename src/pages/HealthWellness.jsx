import React, { useEffect, useState } from 'react'
import Card from '../components/common/Card.jsx'
import RecommendationCard from '../components/common/RecommendationCard.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'
import { getRecommendations } from '../data/api.js'

export default function HealthWellness() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getRecommendations().then(setData)
  }, [])

  if (!data) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Health & wellness</h1>
          <p className="text-ink-500 text-sm mt-1">Recommendations tailored to your current phase.</p>
        </div>
        <PhaseBadge phaseKey={data.phaseKey} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.categories.map((c) => (
          <RecommendationCard key={c.key} icon={c.icon} title={c.title} tip={c.tip} color={c.color} />
        ))}
      </div>
    </div>
  )
}
