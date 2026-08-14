import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Flower2, LogOut } from 'lucide-react'
import { logout } from '../../data/api.js'
import { useApp } from '../../context/AppContext.jsx'

export default function Navbar({ items, accent = 'rose' }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { refreshAuth, showToast } = useApp()

  const activeAccent = { rose: 'bg-rose-50 text-rose-600', teal: 'bg-teal-50 text-teal-700' }[accent]

  const handleLogout = async () => {
    await logout()
    await refreshAuth()
    showToast('Signed out', 'info')
    navigate('/login')
  }

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-ink-100">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
            <Flower2 size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-ink-900">Saathi</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-ink-100" aria-label="Open menu">
          <Menu size={22} className="text-ink-700" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-surface p-5 shadow-lift animate-slideUp">
            <div className="flex justify-end mb-4">
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-ink-100">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-500 hover:bg-ink-100/70 transition-colors mt-2"
              >
                <LogOut size={18} strokeWidth={2} />
                Sign out
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
