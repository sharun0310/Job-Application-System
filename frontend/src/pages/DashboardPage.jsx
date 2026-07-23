import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Briefcase, FileText, Star, Bell, TrendingUp, ArrowRight, CheckCircle,
  Sparkles, MessageSquare, Map, Award, ShieldCheck, Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { resumeService } from '../services/resumeService'
import { applicationService } from '../services/applicationService'
import { matchingService } from '../services/matchingService'
import { notificationService } from '../services/notificationService'

function StatCard({ icon: Icon, label, value, subtext, to, color, loading }) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -4 }}
        className="rounded-[20px] p-5 bg-[#101425]/90 border border-white/[0.06] hover:border-[#6D5CFF]/40 transition-all group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}1A`, color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
        <p className="text-2xl lg:text-3xl font-extrabold text-white mb-0.5 tracking-tight">
          {loading ? <span className="animate-pulse text-slate-500">—</span> : value}
        </p>
        <p className="text-xs font-semibold text-slate-300">{label}</p>
        {subtext && <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>}
      </motion.div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: resumeData, isLoading: resumeLoading } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: () => resumeService.getResume(user?.id),
    enabled: !!user?.id,
    retry: false,
  })

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getMyApplications(),
  })

  const { data: matchData, isLoading: matchLoading } = useQuery({
    queryKey: ['recommended'],
    queryFn: () => matchingService.getRecommendedJobs(5),
  })

  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationService.getNotifications(true),
  })

  const resume = resumeData?.data
  const parsedData = resume?.parsed_data
  const isProcessing = parsedData?.status === 'processing'
  const applications = Array.isArray(appsData?.data) ? appsData.data : []
  const recommendations = Array.isArray(matchData?.data) ? matchData.data : []
  const unread = Array.isArray(notifData?.data) ? notifData.data : []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Calculate ATS & Quality summary metrics
  const hasResume = !!resume && !isProcessing
  const skillCount = parsedData?.skills?.length || 0
  const atsScoreEstimate = hasResume ? Math.min(95, 60 + skillCount * 3) : 0

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[20px] p-6 lg:p-8 bg-gradient-to-r from-[#0E1322] via-[#101425] to-[#1C1635] border border-white/[0.08] relative overflow-hidden shadow-2xl"
      >
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#6D5CFF]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-60 h-60 rounded-full bg-[#F93E9F]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#6D5CFF]/15 text-[#6D5CFF] border border-[#6D5CFF]/30 mb-3">
            <Zap className="w-3.5 h-3.5 fill-[#6D5CFF]" /> {greeting}, {user?.email?.split('@')[0]}
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Career<span className="gradient-text">Pulse</span> AI Dashboard
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed mb-5">
            {!resume
              ? 'Upload your resume to unlock AI ATS scoring, semantic job matching, and automated career prep.'
              : isProcessing
              ? 'Your resume is currently being analyzed by our AI vector processing engine. Hang tight!'
              : `Your resume parsed successfully with ${skillCount} skills detected. You have ${recommendations.length} high-match jobs ready for review.`}
          </p>

          {!resume && !resumeLoading && (
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white cursor-pointer"
            >
              Upload Resume <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard
          icon={Award}
          label="ATS Match Score"
          value={hasResume ? `${atsScoreEstimate}%` : 'N/A'}
          subtext={hasResume ? 'Optimized for ATS' : 'Upload resume first'}
          to="/resume"
          color="#6D5CFF"
          loading={resumeLoading}
        />
        <StatCard
          icon={Star}
          label="AI Job Matches"
          value={recommendations.length}
          subtext="Vector matched jobs"
          to="/recommended"
          color="#F93E9F"
          loading={matchLoading}
        />
        <StatCard
          icon={Briefcase}
          label="Applications"
          value={applications.length}
          subtext="Tracked applications"
          to="/applications"
          color="#26D07C"
          loading={appsLoading}
        />
        <StatCard
          icon={Bell}
          label="Unread Alerts"
          value={unread.length}
          subtext="Active notifications"
          to="/notifications"
          color="#FBBF24"
          loading={notifLoading}
        />
      </div>

      {/* Quick Career Tools Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          Career Tools <Sparkles className="w-4 h-4 text-[#F93E9F]" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { to: '/skill-gap', title: 'Skill Gap Analysis', desc: 'Identify missing skills for target roles', icon: TrendingUp, color: '#6D5CFF' },
            { to: '/interview-prep', title: 'Interview Prep', desc: 'AI interactive mock interview questions', icon: Sparkles, color: '#F93E9F' },
            { to: '/chatbot', title: 'Career Chatbot', desc: '24/7 AI resume & career advice', icon: MessageSquare, color: '#26D07C' },
            { to: '/roadmap', title: 'Learning Roadmap', desc: 'Step-by-step personalized learning paths', icon: Map, color: '#FBBF24' }
          ].map((tool, idx) => {
            const Icon = tool.icon
            return (
              <Link key={idx} to={tool.to}>
                <motion.div
                  whileHover={{ y: -3 }}
                  className="p-5 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] hover:border-white/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${tool.color}1A`, color: tool.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#F93E9F] transition-colors">{tool.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Top AI Recommended Jobs */}
      {recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F93E9F]" /> Top AI Recommended Jobs For You
            </h2>
            <Link to="/ai-matches" className="text-xs font-semibold text-[#6D5CFF] hover:underline">
              View All AI Matches ({recommendations.length}) →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((item, idx) => {
              const j = item.job || item
              const score = item.match_score ? Math.round(item.match_score) : 88
              return (
                <div key={j.id || idx} className="p-4 rounded-xl bg-[#0E1322] border border-white/[0.04] hover:border-[#6D5CFF]/40 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6D5CFF]/15 text-[#6D5CFF] border border-[#6D5CFF]/30">
                        {score}% Match
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{j.employment_type || 'Full-time'}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{j.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{j.company || 'Verified Company'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{j.location}</p>
                  </div>
                  <Link
                    to="/ai-matches"
                    className="w-full py-2 rounded-lg bg-[#6D5CFF]/15 hover:bg-[#6D5CFF]/25 text-[#6D5CFF] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    View Match Details →
                  </Link>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Resume Skills Preview */}
      {parsedData && !isProcessing && parsedData.skills?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#26D07C]" /> Detected Resume Skills ({parsedData.skills.length})
            </h2>
            <Link to="/resume" className="text-xs font-semibold text-[#6D5CFF] hover:underline">
              Full Resume →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsedData.skills.slice(0, 16).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#6D5CFF]/10 text-[#6D5CFF] border border-[#6D5CFF]/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Applications */}
      {applications.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Recent Applications</h2>
            <Link to="/applications" className="text-xs font-semibold text-[#6D5CFF] hover:underline">
              View All Applications →
            </Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0E1322] border border-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#26D07C]" />
                  <div>
                    <p className="text-xs font-bold text-white">Job #{app.job_id}</p>
                    <p className="text-[11px] text-slate-400">
                      Applied {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#26D07C]/15 text-[#26D07C] border border-[#26D07C]/30">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
