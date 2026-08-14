import React from 'react'
import { Outlet } from 'react-router-dom'
import { Home, HeartHandshake, BookOpen, Users } from 'lucide-react'
import Sidebar from '../components/common/Sidebar.jsx'
import Navbar from '../components/common/Navbar.jsx'
import BottomNav from '../components/common/BottomNav.jsx'

export const SUPPORTER_NAV_ITEMS = [
  { to: '/supporter/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: Home, end: true },
  { to: '/supporter/guidance', label: 'How to Help', shortLabel: 'Guidance', icon: HeartHandshake },
  { to: '/supporter/education', label: 'Learn', shortLabel: 'Learn', icon: BookOpen },
  { to: '/supporter/connection', label: 'Connection', shortLabel: 'Connect', icon: Users },
]

export default function SupporterLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar items={SUPPORTER_NAV_ITEMS} accent="teal" />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar items={SUPPORTER_NAV_ITEMS} accent="teal" />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
        <BottomNav items={SUPPORTER_NAV_ITEMS} accent="teal" />
      </div>
    </div>
  )
}
