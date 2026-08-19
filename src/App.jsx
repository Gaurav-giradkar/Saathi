import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './router/ProtectedRoute.jsx'
import ToastHost from './components/common/Toast.jsx'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ChooseAccountType from './pages/ChooseAccountType.jsx'
import QuickOverview from './pages/QuickOverview.jsx'
import UserSetup from './pages/UserSetup.jsx'
import SupporterSetup from './pages/SupporterSetup.jsx'

import DashboardLayout from './layouts/DashboardLayout.jsx'
import SupporterLayout from './layouts/SupporterLayout.jsx'

import UserDashboard from './pages/UserDashboard.jsx'
import CycleTracker from './pages/CycleTracker.jsx'
import DailyHealthTracker from './pages/DailyHealthTracker.jsx'
import AIInsights from './pages/AIInsights.jsx'
import HealthWellness from './pages/HealthWellness.jsx'
import EducationCenter from './pages/EducationCenter.jsx'
import ProductAdvisor from './pages/ProductAdvisor.jsx'
import ReportsHistory from './pages/ReportsHistory.jsx'
import SupporterConnection from './pages/SupporterConnection.jsx'
import SharingPermissions from './pages/SharingPermissions.jsx'

import SupporterDashboard from './pages/SupporterDashboard.jsx'
import SupporterGuidance from './pages/SupporterGuidance.jsx'

export default function App() {
  return (
    <>
      <ToastHost />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Onboarding (logged in, not yet onboarded) */}
        <Route path="/choose-account" element={<ProtectedRoute><ChooseAccountType /></ProtectedRoute>} />
        <Route path="/overview" element={<ProtectedRoute><QuickOverview /></ProtectedRoute>} />
        <Route path="/user-setup" element={<ProtectedRoute><UserSetup /></ProtectedRoute>} />
        <Route path="/supporter-setup" element={<ProtectedRoute><SupporterSetup /></ProtectedRoute>} />

        {/* Menstrual health user area */}
        <Route
          element={
            <ProtectedRoute requireOnboarded role="user">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/cycle-tracker" element={<CycleTracker />} />
          <Route path="/daily-health" element={<DailyHealthTracker />} />
          <Route path="/insights" element={<AIInsights />} />
          <Route path="/wellness" element={<HealthWellness />} />
          <Route path="/education" element={<EducationCenter />} />
          <Route path="/products" element={<ProductAdvisor />} />
          <Route path="/reports" element={<ReportsHistory />} />
          <Route path="/connection" element={<SupporterConnection />} />
          <Route path="/permissions" element={<SharingPermissions />} />
        </Route>

        {/* Supporter area */}
        <Route
          path="/supporter"
          element={
            <ProtectedRoute requireOnboarded role="supporter">
              <SupporterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SupporterDashboard />} />
          <Route path="guidance" element={<SupporterGuidance />} />
          <Route path="connection" element={<SupporterConnection />} />
          <Route path="education" element={<EducationCenter />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
