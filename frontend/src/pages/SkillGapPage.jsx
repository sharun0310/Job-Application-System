import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, Search, Loader2, AlertCircle, CheckCircle, XCircle, Sparkles, Award } from 'lucide-react'
import { matchingService } from '../services/matchingService'
import { jobService } from '../services/jobService'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function SkillGapPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [jobId, setJobId] = useState(searchParams.get('job_id') || '')
  const [submittedId, setSubmittedId] = useState(searchParams.get('job_id') || null)

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getJobs(0, 50),
  })
  const jobs = Array.isArray(jobsData?.data) ? jobsData.data : []

  useEffect(() => {
    if (!submittedId && jobs.length > 0) {
      const firstId = jobs[0].id
      setJobId(firstId)
      setSubmittedId(firstId)
    }
  }, [jobs, submittedId])

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['skill-gap', submittedId],
    queryFn: async () => {
      try {
        return await matchingService.getSkillGap(submittedId)
      } catch (err) {
        // 400/404 errors from backend are client errors — handle gracefully
        const res = err.response
        if (res && (res.status === 400 || res.status === 404)) {
          return res.data
        }
        throw err
      }
    },
    enabled: !!submittedId,
    retry: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (jobId) setSubmittedId(jobId)
  }

  const isClientError = data && data.success === false
  const analysis = data?.data
  const targetJob = jobs.find(j => String(j.id) === String(submittedId))
  const targetRoleName = targetJob?.title || 'Target Job Role'

  // Connected Query: Automatically fetch Learning Roadmap for detected missing skills
  const { data: roadmapData, isLoading: roadmapLoading } = useQuery({
    queryKey: ['connected-roadmap', submittedId, analysis?.missing_skills],
    queryFn: () => matchingService.getLearningRoadmap(analysis?.missing_skills || [], targetRoleName),
    enabled: !!analysis?.missing_skills?.length,
  })

  const roadmap = roadmapData?.data

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Skill Gap & Learning Roadmap <Sparkles className="w-6 h-6 text-[#6D5CFF]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          AI skill gap analysis and auto-generated learning roadmap connected in a single workflow.
        </p>
      </div>

      {/* Job Selector Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          {jobs.length > 0 ? (
            <select
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              className="w-full bg-[#0E1322] text-xs text-white px-4 py-3 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/60 transition-all"
            >
              <option value="">Select a target job posting...</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} (#{j.id})</option>
              ))}
            </select>
          ) : (
            <input
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              placeholder="Enter Target Job ID (e.g. 1)"
              type="number"
              min="1"
              className="w-full bg-[#0E1322] text-xs text-white px-4 py-3 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={!jobId || isLoading || isFetching}
          className="px-6 py-3 rounded-xl gradient-btn text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
        >
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Run AI Analysis & Generate Roadmap
        </button>
      </form>

      {/* Client-side Error */}
      {isClientError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-[20px] bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-white">{data.message}</p>
            {data.errors?.map((e, i) => (
              <p key={i} className="text-xs text-slate-300 mt-1">{e}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Server Error */}
      {error && !isClientError && (
        <div className="p-6 rounded-[20px] bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-xs text-white font-semibold">Analysis failed. Please select a valid job ID.</p>
        </div>
      )}

      {/* Loading State */}
      {(isLoading || isFetching) && (
        <div className="p-8 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#6D5CFF]" />
          <p className="text-xs text-slate-300 font-semibold">AI is comparing vector embeddings & generating personalized learning roadmap...</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isClientError && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Overall Score Meter Card */}
          <div className="p-8 rounded-[20px] bg-gradient-to-r from-[#101425] via-[#161B33] to-[#101425] border border-white/[0.08] text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#6D5CFF]/10 blur-3xl pointer-events-none" />

            <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Overall ATS Match Score</p>
            <div className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-2 flex items-center justify-center gap-1">
              <span
                style={{
                  color: analysis.overall_score >= 70 ? '#26D07C' : analysis.overall_score >= 50 ? '#FBBF24' : '#F93E9F'
                }}
              >
                {analysis.overall_score}
              </span>
              <span className="text-2xl text-slate-500 font-medium">/100</span>
            </div>

            {/* Category Breakdown */}
            {analysis.category_scores && (
              <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-white/[0.06]">
                {Object.entries(analysis.category_scores).map(([cat, score]) => (
                  <div key={cat} className="text-center px-4 py-2 rounded-xl bg-[#0E1322] border border-white/[0.04]">
                    <p className="text-[11px] text-slate-400 capitalize font-medium">{cat}</p>
                    <p className="text-base font-bold text-white mt-0.5">{score}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Missing Skills Tags */}
            {analysis.missing_skills?.length > 0 && (
              <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-[#F93E9F]" />
                  <h3 className="text-base font-bold text-white">Missing Skill Requirements</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F93E9F]/10 text-[#F93E9F] border border-[#F93E9F]/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Direct CTA to navigate to Roadmap Page with missing skills */}
                <button
                  type="button"
                  onClick={() => {
                    const roleParam = encodeURIComponent(targetRoleName)
                    const skillsParam = encodeURIComponent((analysis.missing_skills || []).join(','))
                    navigate(`/roadmap?role=${roleParam}&skills=${skillsParam}`)
                  }}
                  className="w-full mt-5 py-3 rounded-xl gradient-btn text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#6D5CFF]/20 hover:scale-[1.01] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#26D07C]" /> Transfer Missing Skills to Learning Roadmap →
                </button>
              </div>
            )}

            {/* Improvement Recommendations */}
            {analysis.improvement_suggestions?.length > 0 && (
              <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-[#26D07C]" />
                  <h3 className="text-base font-bold text-white">Actionable Recommendations</h3>
                </div>
                <div className="space-y-2.5">
                  {analysis.improvement_suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-[#26D07C] font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Connected AI Learning Roadmap */}
          <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#6D5CFF]" /> Auto-Generated Learning Roadmap for {targetRoleName}
            </h3>
            <p className="text-xs text-slate-400">Step-by-step curriculum targeting your detected missing skills.</p>

            {roadmapLoading ? (
              <div className="flex items-center gap-2 py-6 text-xs text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-[#6D5CFF]" /> Generating tailored curriculum...
              </div>
            ) : roadmap ? (
              <div className="grid gap-4 md:grid-cols-3 pt-2">
                {Object.entries(roadmap).map(([level, topics]) => (
                  <div key={level} className="p-4 rounded-xl bg-[#0E1322] border border-white/[0.04] space-y-3">
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{level} Stage</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#6D5CFF]/15 text-[#6D5CFF]">{Array.isArray(topics) ? topics.length : 0} topics</span>
                    </p>
                    {Array.isArray(topics) && topics.map((t, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#101425] border border-white/[0.04]">
                        <p className="text-xs font-bold text-white">{t.topic}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{t.estimated_duration}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  )
}
