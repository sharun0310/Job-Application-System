import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Briefcase, CheckCircle, Clock, XCircle, AlertCircle, Calendar, Sparkles, Award } from 'lucide-react'
import { applicationService } from '../services/applicationService'

const statusConfig = {
  Applied: { color: '#6D5CFF', bg: 'rgba(109,92,255,0.15)', icon: CheckCircle, border: 'rgba(109,92,255,0.3)' },
  Interview: { color: '#F93E9F', bg: 'rgba(249,62,159,0.15)', icon: Clock, border: 'rgba(249,62,159,0.3)' },
  Offer: { color: '#26D07C', bg: 'rgba(38,208,124,0.15)', icon: Award, border: 'rgba(38,208,124,0.3)' },
  Accepted: { color: '#26D07C', bg: 'rgba(38,208,124,0.15)', icon: CheckCircle, border: 'rgba(38,208,124,0.3)' },
  Rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: XCircle, border: 'rgba(239,68,68,0.3)' },
}

export default function ApplicationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getMyApplications(),
  })

  const applications = Array.isArray(data?.data) ? data.data : []

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Application Timeline <Sparkles className="w-6 h-6 text-[#26D07C]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          Track the lifecycle, stage transitions, and status of your active job submissions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-base font-bold text-white mb-1">Failed to Load Applications</p>
          <p className="text-xs text-slate-400">Could not retrieve application history from server.</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-16 text-center rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <Briefcase className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-bold text-white mb-1">No Tracked Applications</p>
          <p className="text-xs text-slate-400">Apply to jobs from the Live Jobs search or AI Recommended matches.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400">
            Total Tracked: <span className="text-white font-bold">{applications.length}</span>
          </p>

          <div className="relative pl-6 border-l-2 border-white/[0.08] space-y-6">
            {applications.map((app, i) => {
              const cfg = statusConfig[app.status] ?? statusConfig.Applied
              const Icon = cfg.icon

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline Dot */}
                  <div
                    className="absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 border-[#080B17] shadow-lg"
                    style={{ background: cfg.color }}
                  />

                  <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {app.job?.title || `Application for Job #${app.job_id}`}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {app.job?.company ? `${app.job.company} • ` : ''}Submitted on {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm"
                        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
