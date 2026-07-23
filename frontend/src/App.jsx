import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AuthLayout } from './layouts/AuthLayout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ResumePage from './pages/ResumePage'
import LiveJobsPage from './pages/LiveJobsPage'
import ApplicationsPage from './pages/ApplicationsPage'
import RecommendedJobsPage from './pages/RecommendedJobsPage'
import SkillGapPage from './pages/SkillGapPage'
import RoadmapPage from './pages/RoadmapPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import InterviewPrepPage from './pages/InterviewPrepPage'
import ChatbotPage from './pages/ChatbotPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/live-jobs" element={<LiveJobsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/recommended" element={<RecommendedJobsPage />} />
          <Route path="/ai-matches" element={<RecommendedJobsPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/skillgap" element={<SkillGapPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/learning-roadmap" element={<RoadmapPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
