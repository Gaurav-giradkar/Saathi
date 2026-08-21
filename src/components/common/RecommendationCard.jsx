import React from 'react'

import Card from './Card.jsx'
import CustomIcon from './CustomIcon.jsx'

const COLORS = {
  teal: 'text-teal-600 bg-teal-50',
  amber: 'text-amber-600 bg-amber-50',
  rose: 'text-rose-500 bg-rose-50',
  plum: 'text-plum-500 bg-plum-50',
}

export default function RecommendationCard({
  icon,
  title,
  tip,
  color = 'rose',
  onClick,
}) {
  return (
    <Card
      hover
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
      as={onClick ? 'button' : 'div'}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${COLORS[color]}`}
      >
        <CustomIcon type={icon} />
      </div>

      <h4 className="font-display font-semibold text-ink-900 text-[15px] mb-1 text-left">
        {title}
      </h4>

      <p className="text-sm text-ink-500 text-left leading-relaxed">
        {tip}
      </p>
    </Card>
  )
}