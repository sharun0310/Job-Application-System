import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Search, Briefcase, Star,
  TrendingUp, Map, Bell, User, LogOut, Menu, X, Sparkles,
  MessageSquare, Settings, Upload, Sun, Moon, Zap
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { notificationService } from '../services/notificationService'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: FileText, label: 'Resume' },
  { to: '/live-jobs', icon: Search, label: 'Jobs' },
  { to: '/applications', icon: Briefcase, label: 'Applications' },
  { to: '/recommended', icon: Star, label: 'AI Matches' },
  { to: '/skill-gap', icon: TrendingUp, label: 'Skill Gap' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/interview-prep', icon: Sparkles, label: 'Interview Prep' },
  { to: '/chatbot', icon: MessageSquare, label: 'Career Chatbot' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationService.getNotifications(true),
    refetchInterval: 30000,
  })
  const unreadCount = Array.isArray(notifData?.data) ? notifData.data.length : 0

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleGlobalSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/live-jobs?query=${encodeURIComponent(searchQuery)}`)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0E1322] border-r border-white/[0.06]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shrink-0 shadow-lg shadow-[#6D5CFF]/30">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-white font-extrabold text-lg tracking-tight">Career</span>
            <span className="gradient-text font-extrabold text-lg tracking-tight">Pulse</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#26D07C] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26D07C] animate-pulse" /> AI Powered
          </span>
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#101425] border border-white/[0.06]">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center text-white text-xs font-extrabold">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#26D07C] border-2 border-[#0E1322]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to === '/settings' && location.pathname === '/profile')
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'text-white gradient-border-active'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#F93E9F]' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="truncate">{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-bold text-white px-2 py-0.5 rounded-full gradient-btn">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Logout Fixed Bottom */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0E1322]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#080B17]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center gap-3 lg:gap-5 px-4 lg:px-8 py-3.5 border-b border-white/[0.06] bg-[#080B17]/90 backdrop-blur-md shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-[#101425] border border-white/[0.06] text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="w-full bg-[#101425] text-xs text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/50 transition-colors placeholder:text-slate-500"
            />
          </form>

          <div className="flex-1 sm:hidden" />

          {/* Quick Upload Resume Button */}
          <NavLink
            to="/resume"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resume</span>
          </NavLink>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="p-2.5 rounded-xl bg-[#101425] border border-white/[0.06] text-slate-300 hover:text-white hover:border-white/20 transition-all cursor-pointer shrink-0"
            title="Toggle theme"
          >
            {isDarkTheme ? <Moon className="w-4 h-4 text-[#6D5CFF]" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Notification Icon */}
          <NavLink
            to="/notifications"
            className="relative p-2.5 rounded-xl bg-[#101425] border border-white/[0.06] text-slate-300 hover:text-white hover:border-white/20 transition-all shrink-0"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-extrabold text-white rounded-full gradient-btn flex items-center justify-center shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>

          {/* Profile Avatar Link */}
          <NavLink to="/profile" className="flex items-center gap-2.5 shrink-0 pl-1">
            <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center text-white text-xs font-extrabold shadow-md shadow-[#6D5CFF]/20">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
