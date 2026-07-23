import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star, Building2, MapPin, Briefcase, Loader2, ExternalLink, TrendingUp, Sparkles, DollarSign } from 'lucide-react'
import { matchingService } from '../services/matchingService'
import { applicationService } from '../services/applicationService'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#26D07C' : score >= 60 ? '#6D5CFF' : '#F93E9F'
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score} 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-white">
          {score}%
        </span>
      </div>
      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">Match</span>
    </div>
  )
}

export default function RecommendedJobsPage() {
  const [applying, setApplying] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['recommended'],
    queryFn: () => matchingService.getRecommendedJobs(10),
  })

  const { data: appsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getMyApplications(),
  })

  const appliedIds = new Set((Array.isArray(appsData?.data) ? appsData.data : []).map(a => a.job_id))

  const handleApply = async (jobId) => {
    setApplying(jobId)
    try {
      await applicationService.apply(jobId)
      toast.success('Application tracked!')
      qc.invalidateQueries({ queryKey: ['applications'] })
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      if (detail.includes('Already applied')) toast('Already applied to this job', { icon: 'ℹ️' })
      else toast.error(detail || 'Failed to apply.')
    } finally {
      setApplying(null)
    }
  }

  const recommendations = Array.isArray(data?.data) ? data.data : []

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          AI Recommended Jobs <Sparkles className="w-6 h-6 text-[#F93E9F]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          Jobs ranked by high-dimensional semantic similarity to your parsed resume.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <p className="text-base font-bold text-white mb-1">Failed to Load Recommendations</p>
          <p className="text-xs text-slate-400">Ensure your resume is uploaded and parsed in the Resume section.</p>
        </div>
      ) : recommendations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center text-center p-16 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]"
        >
          <Star className="w-12 h-12 text-[#F93E9F]/40 mb-3" />
          <p className="text-lg font-bold text-white mb-1">No Recommendations Yet</p>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Upload your resume so our AI model can match your skills against target job postings.
          </p>
          <Link to="/resume" className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white">
            Upload Resume
          </Link>
        </motion.div>
      ) : (
        <>
          <p className="text-xs font-semibold text-slate-400">
            Found <span className="text-white font-bold">{recommendations.length}</span> high-confidence matches
          </p>
          <div className="space-y-4">
            {recommendations.map(({ job, match_score }, i) => (
              <motion.div
                key={job?.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] hover:border-[#6D5CFF]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-5"
              >
                <div className="shrink-0">
                  <ScoreBadge score={Math.round(match_score)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">{job?.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{job?.company_name || `Company #${job?.company_id}`}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#6D5CFF]/15 text-[#6D5CFF] border border-[#6D5CFF]/30 shrink-0">
                      Rank #{i + 1}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-400">
                    {job?.location && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0E1322] border border-white/[0.04]">
                        <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
                      </span>
                    )}
                    {job?.employment_type && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0E1322] border border-white/[0.04]">
                        <Briefcase className="w-3 h-3 text-slate-500" /> {job.employment_type}
                      </span>
                    )}
                    {job?.salary && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#26D07C]/10 text-[#26D07C] font-semibold border border-[#26D07C]/20">
                        <DollarSign className="w-3 h-3" /> {job.salary}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                    <Link
                      to={`/skill-gap?job_id=${job?.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#6D5CFF]/10 text-[#6D5CFF] border border-[#6D5CFF]/30 text-xs font-semibold hover:bg-[#6D5CFF]/20 flex items-center gap-1.5 transition-colors"
                    >
                      <TrendingUp className="w-3.5 h-3.5" /> Analyze Skill Gap
                    </Link>
                    {job?.application_link && (
                      <a
                        href={job.application_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#0E1322] border border-white/[0.06] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> External Link
                      </a>
                    )}
                    <button
                      onClick={() => handleApply(job?.id)}
                      disabled={appliedIds.has(job?.id) || applying === job?.id || !job?.id}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 ${
                        appliedIds.has(job?.id) ? 'bg-[#26D07C]/20 text-[#26D07C] border border-[#26D07C]/30' : 'gradient-btn'
                      }`}
                    >
                      {applying === job?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      {appliedIds.has(job?.id) ? 'Applied ✓' : 'Track Application'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
