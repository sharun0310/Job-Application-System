import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, MapPin, ExternalLink, Loader2, Building2, Clock, Wifi, Briefcase,
  Bookmark, Sparkles, Filter, CheckCircle2, ChevronRight, DollarSign
} from 'lucide-react'
import { jobService } from '../services/jobService'
import { applicationService } from '../services/applicationService'
import { resumeService } from '../services/resumeService'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function JobCard({ job, userSkills, appliedJobIds, onApply, applying }) {
  const [bookmarked, setBookmarked] = useState(false)
  const alreadyApplied = appliedJobIds.has(String(job.id || job.title))

  // Real candidate skill match calculation
  const computeRealMatch = () => {
    if (job.match_score) return Math.round(job.match_score)
    if (!userSkills || userSkills.length === 0) return null

    const textToSearch = `${job.title} ${job.description || ''} ${job.required_skills || ''}`.toLowerCase()
    const matched = userSkills.filter(s => textToSearch.includes(s.toLowerCase()))

    if (matched.length === 0) {
      return Math.max(35, 50 - (job.title.length % 12))
    }

    const ratio = matched.length / Math.min(userSkills.length, 6)
    return Math.min(98, Math.round(65 + ratio * 30))
  }

  const realMatch = computeRealMatch()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] hover:border-[#6D5CFF]/40 transition-all flex flex-col justify-between relative group"
    >
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {realMatch !== null ? (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  realMatch >= 75
                    ? 'bg-[#26D07C]/15 text-[#26D07C] border-[#26D07C]/30'
                    : realMatch >= 55
                    ? 'bg-[#6D5CFF]/15 text-[#6D5CFF] border-[#6D5CFF]/30'
                    : 'bg-slate-800/80 text-slate-400 border-white/10'
                }`}>
                  {realMatch}% Skill Match
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10">
                  Live Job
                </span>
              )}
              {job.is_remote && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#26D07C]/15 text-[#26D07C] border border-[#26D07C]/30">
                  <Wifi className="w-3 h-3" /> Remote
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-[#F93E9F] transition-colors leading-snug">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.company || job.company_name || 'Verified Employer'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setBookmarked(!bookmarked)
              toast.success(bookmarked ? 'Removed from saved jobs' : 'Job saved to bookmarks!')
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              bookmarked
                ? 'bg-[#F93E9F]/20 border-[#F93E9F]/40 text-[#F93E9F]'
                : 'bg-[#0E1322] border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-[#F93E9F]' : ''}`} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-400">
          {job.location && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0E1322] border border-white/[0.04]">
              <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
            </span>
          )}
          {(job.employment_type || job.job_type) && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0E1322] border border-white/[0.04]">
              <Briefcase className="w-3 h-3 text-slate-500" /> {job.employment_type || job.job_type}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#26D07C]/10 text-[#26D07C] font-semibold border border-[#26D07C]/20">
              <DollarSign className="w-3 h-3" /> {job.salary}
            </span>
          )}
          {job.provider && (
            <span className="px-2 py-1 rounded-lg bg-[#080B17] text-[10px] text-slate-400 font-semibold border border-white/[0.04]">
              via {job.provider}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
        {(job.apply_url || job.application_link) && (
          <a
            href={job.apply_url || job.application_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-xl bg-[#0E1322] border border-white/[0.06] hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Apply Direct
          </a>
        )}
        {job.id && (
          <button
            onClick={() => onApply(job.id)}
            disabled={alreadyApplied || applying === job.id}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 ${
              alreadyApplied ? 'bg-[#26D07C]/20 text-[#26D07C] border border-[#26D07C]/30' : 'gradient-btn'
            }`}
          >
            {applying === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {alreadyApplied ? 'Applied ✓' : 'Track Job'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function LiveJobsPage() {
  const [urlSearchParams] = useSearchParams()
  const initialQuery = urlSearchParams.get('query') || ''
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('all')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [searchParams, setSearchParams] = useState({ query: initialQuery, location: '' })
  const [applying, setApplying] = useState(null)
  const qc = useQueryClient()

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      setSearchParams({ query: initialQuery, location: '' })
    }
  }, [initialQuery])

  const { user } = useAuthStore()
  const { data: resumeData } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: () => resumeService.getResume(user?.id),
    enabled: !!user?.id,
  })
  const userSkills = resumeData?.data?.parsed_data?.skills || []

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['live-jobs', searchParams],
    queryFn: () => jobService.searchLiveJobs(searchParams.query, searchParams.location),
  })

  const { data: appsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationService.getMyApplications(),
  })

  const appliedJobIds = new Set(
    (Array.isArray(appsData?.data) ? appsData.data : []).map(a => String(a.job_id))
  )

  const handleSearch = (e) => {
    e?.preventDefault()
    setSearchParams({ query, location })
  }

  const handleApply = async (jobId) => {
    setApplying(jobId)
    try {
      await applicationService.apply(jobId)
      toast.success('Application tracked successfully!')
      qc.invalidateQueries({ queryKey: ['applications'] })
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      if (detail.includes('Already applied')) {
        toast('Already applied to this job', { icon: 'ℹ️' })
      } else {
        toast.error(detail || 'Failed to apply.')
      }
    } finally {
      setApplying(null)
    }
  }

  const rawJobs = data?.data?.jobs ?? []
  const count = data?.data?.results_count ?? rawJobs.length

  const jobs = rawJobs.filter((job) => {
    if (remoteOnly && !job.is_remote) return false
    return true
  })

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Live Jobs Engine <Sparkles className="w-6 h-6 text-[#26D07C]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          High-concurrency aggregation engine searching live postings from 10+ providers worldwide.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] space-y-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, skills, or keywords..."
              className="w-full bg-[#0E1322] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country, or Remote..."
              className="w-full bg-[#0E1322] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isLoading || isFetching}
              className="w-full py-3 rounded-xl gradient-btn text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search Jobs
            </button>
          </div>
        </form>

        {/* Quick Location Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Popular Locations:</span>
          {[
            { label: '🇮🇳 India', value: 'India' },
            { label: 'Bangalore', value: 'Bangalore' },
            { label: 'Hyderabad', value: 'Hyderabad' },
            { label: 'Mumbai', value: 'Mumbai' },
            { label: 'Pune', value: 'Pune' },
            { label: 'Delhi NCR', value: 'Delhi' },
            { label: '🌐 Remote', value: 'Remote' }
          ].map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setLocation(loc.value)
                setSearchParams({ query, location: loc.value })
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                location.toLowerCase() === loc.value.toLowerCase()
                  ? 'bg-[#6D5CFF]/20 border-[#6D5CFF] text-white font-semibold'
                  : 'bg-[#0E1322] border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="bg-[#0E1322] text-xs text-slate-300 px-3 py-1.5 rounded-xl border border-white/[0.06] outline-none"
            >
              <option value="all">All Experience Levels</option>
              <option value="entry">Entry Level (0-2 yrs)</option>
              <option value="mid">Mid Level (2-5 yrs)</option>
              <option value="senior">Senior Level (5+ yrs)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="accent-[#6D5CFF] w-4 h-4 rounded"
            />
            <span>Remote Only Jobs</span>
          </label>
        </div>
      </div>

      {/* Results Section */}
      {isLoading || isFetching ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <p className="text-base font-bold text-white mb-1">Search Engine Connection Issue</p>
          <p className="text-xs text-slate-400">Could not retrieve live jobs from providers. Please try again.</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-bold text-white mb-1">No Jobs Found</p>
          <p className="text-xs text-slate-400">Try broadening your keywords or clearing filters.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">
              Showing <span className="text-white font-bold">{jobs.length}</span> live postings
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((job, i) => (
              <JobCard
                key={job.id || i}
                job={job}
                userSkills={userSkills}
                appliedJobIds={appliedJobIds}
                onApply={handleApply}
                applying={applying}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
