import React from 'react'
import { NavLink } from 'react-router-dom'

export default function BottomNav({ items, accent = 'rose' }) {
  const activeColor = { rose: 'text-rose-600', teal: 'text-teal-700' }[accent]
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-ink-100 px-2 py-1.5 flex justify-between">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              'flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg flex-1 transition-colors',
              isActive ? activeColor : 'text-ink-400',
            ].join(' ')
          }
        >
          <item.icon size={19} strokeWidth={2} />
          <span className="text-[10px] font-medium">{item.shortLabel || item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
