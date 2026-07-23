import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080B17] px-4 py-8">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#6D5CFF]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#F93E9F]/15 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-[#6D5CFF]/30">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex items-center gap-1 text-2xl font-extrabold tracking-tight">
              <span className="text-white">Career</span>
              <span className="gradient-text">Pulse</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">AI-Powered Job Search, Resume Matching & Career Platform</p>
        </div>

        <Outlet />
      </motion.div>
    </div>
  )
}
