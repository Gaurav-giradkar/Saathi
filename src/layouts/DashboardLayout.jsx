import React from 'react'
import { Outlet } from 'react-router-dom'
import {
  Home, CalendarDays, ClipboardPlus, Sparkles, Leaf, BookOpen,
  ShoppingBag, FileText, Users, SlidersHorizontal,
} from 'lucide-react'
import Sidebar from '../components/common/Sidebar.jsx'
import Navbar from '../components/common/Navbar.jsx'
import BottomNav from '../components/common/BottomNav.jsx'

export const USER_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: Home, end: true },
  { to: '/cycle-tracker', label: 'Cycle Tracker', shortLabel: 'Cycle', icon: CalendarDays },
  { to: '/daily-health', label: 'Daily Health', shortLabel: 'Health', icon: ClipboardPlus },
  { to: '/insights', label: 'Saathi AI', shortLabel: 'Insights', icon: Sparkles },
  { to: '/wellness', label: 'Wellness', shortLabel: 'Wellness', icon: Leaf },
  { to: '/education', label: 'Learn', icon: BookOpen },
  { to: '/products', label: 'Product Advisor', icon: ShoppingBag },
  { to: '/reports', label: 'History & Reports', icon: FileText },
  { to: '/connection', label: 'Support Circle', icon: Users },
  { to: '/permissions', label: 'Sharing & Privacy', icon: SlidersHorizontal },
]

const BOTTOM_ITEMS = USER_NAV_ITEMS.slice(0, 5)

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar items={USER_NAV_ITEMS} accent="rose" />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar items={USER_NAV_ITEMS} accent="rose" />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
        <BottomNav items={BOTTOM_ITEMS} accent="rose" />
      </div>
    </div>
  )
}
