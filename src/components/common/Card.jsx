import React from 'react'

export default function Card({ children, className = '', padded = true, hover = false, as: As = 'div', ...props }) {
  return (
    <As
      className={[
        'bg-surface rounded-2xl border border-ink-100/70 shadow-soft',
        padded ? 'p-5 sm:p-6' : '',
        hover ? 'transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </As>
  )
}
