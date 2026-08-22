import React from 'react'
import { Link } from 'react-router-dom'
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
  to,
}) {
  const content = (
    <Card
      hover
      className="cursor-pointer h-full"
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

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {content}
      </Link>
    )
  }

  return content
}