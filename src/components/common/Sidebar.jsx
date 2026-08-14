import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Flower2 } from 'lucide-react'
import { logout } from '../../data/api.js'
import { useApp } from '../../context/AppContext.jsx'

export default function Sidebar({ items, accent = 'rose' }) {
  const navigate = useNavigate()
  const { refreshAuth, showToast } = useApp()

  const activeAccent = {
    rose: 'bg-rose-50 text-rose-600',
    teal: 'bg-teal-50 text-teal-700',
  }[accent]

  const handleLogout = async () => {
    await logout()
    await refreshAuth()
    showToast('Signed out', 'info')
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-ink-100 bg-surface px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center">
          <Flower2 size={18} className="text-white" />
        </div>
        <span className="font-display font-bold text-lg text-ink-900">Saathi</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive ? activeAccent : 'text-ink-600 hover:bg-ink-100/70',
              ].join(' ')
            }
          >
            <item.icon size={18} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-500 hover:bg-ink-100/70 transition-colors mt-2"
      >
        <LogOut size={18} strokeWidth={2} />
        Sign out
      </button>
    </aside>
  )
}
