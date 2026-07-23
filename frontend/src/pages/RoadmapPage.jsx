import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Map, Plus, X, Loader2, BookOpen, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react'
import { matchingService } from '../services/matchingService'
import { resumeService } from '../services/resumeService'
import { useAuthStore } from '../store/authStore'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const levelConfig = {
  Beginner: { color: '#26D07C', bg: 'rgba(38, 208, 124, 0.15)', border: 'rgba(38, 208, 124, 0.3)' },
  Intermediate: { color: '#6D5CFF', bg: 'rgba(109, 92, 255, 0.15)', border: 'rgba(109, 92, 255, 0.3)' },
  Advanced: { color: '#F93E9F', bg: 'rgba(249, 62, 159, 0.15)', border: 'rgba(249, 62, 159, 0.3)' },
}

function TopicCard({ topic }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0E1322] overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div>
          <p className="text-xs font-bold text-white">{topic.topic}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{topic.estimated_duration}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && topic.recommended_resources?.length > 0 && (
        <div className="p-4 border-t border-white/[0.04] bg-[#080B17]/60 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Resources:</p>
          <ul className="space-y-1">
            {topic.recommended_resources.map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-[#6D5CFF] font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function RoadmapPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [skill, setSkill] = useState('')
  const [skills, setSkills] = useState([])
  const [targetRole, setTargetRole] = useState('')

  const { data: resumeData } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: () => resumeService.getResume(user?.id),
    enabled: !!user?.id,
  })

  const mutation = useMutation({
    mutationFn: (payload) => {
      const s = payload?.overrideSkills || skills
      const r = payload?.overrideRole || targetRole
      return matchingService.getLearningRoadmap(s, r)
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Roadmap generation failed.'
      toast.error(msg)
    }
  })

  const [autoLoaded, setAutoLoaded] = useState(false)

  // Auto-connect Skill Gap URL parameters or parsed resume missing skills
  useEffect(() => {
    if (autoLoaded) return
    const roleParam = searchParams.get('role')
    const skillsParam = searchParams.get('skills')

    if (roleParam && skillsParam) {
      const parsedList = skillsParam.split(',').map(x => x.trim()).filter(Boolean)
      setTargetRole(roleParam)
      setSkills(parsedList)
      mutation.mutate({ overrideSkills: parsedList, overrideRole: roleParam })
      setAutoLoaded(true)
    } else if (resumeData?.data?.parsed_data) {
      const pd = resumeData.data.parsed_data
      const defaultRole = `${pd.classified_domain || 'Full Stack'} Developer`
      const defaultSkills = ["Docker", "Kubernetes", "Redis", "Cloud Deployment"]
      setTargetRole(defaultRole)
      setSkills(defaultSkills)
      mutation.mutate({ overrideSkills: defaultSkills, overrideRole: defaultRole })
      setAutoLoaded(true)
    }
  }, [searchParams, resumeData, autoLoaded])

  const addSkill = () => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()])
      setSkill('')
    }
  }

  const removeSkill = (s) => setSkills(skills.filter(x => x !== s))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (skills.length === 0) { toast.error('Add at least one skill.'); return }
    if (!targetRole.trim()) { toast.error('Enter a target role.'); return }
    mutation.mutate()
  }

  const roadmap = mutation.data?.data

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Learning Roadmap <Sparkles className="w-6 h-6 text-[#F93E9F]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          Generate an AI step-by-step curriculum for mastering missing skills required for your target role.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Job Title / Role</label>
          <input
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Full Stack Developer, DevOps Lead, ML Engineer..."
            className="w-full bg-[#0E1322] text-xs text-white px-4 py-3 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Skills to Learn</label>
          <div className="flex gap-2 mb-3">
            <input
              value={skill}
              onChange={e => setSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type skill name (e.g. Kubernetes, Redis, System Design)..."
              className="flex-1 bg-[#0E1322] text-xs text-white px-4 py-3 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-3 rounded-xl bg-[#0E1322] border border-white/[0.06] text-xs font-semibold text-white hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#6D5CFF]/15 text-[#6D5CFF] border border-[#6D5CFF]/30"
                >
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3 rounded-xl gradient-btn text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing AI Roadmap...
            </>
          ) : (
            <>
              <Map className="w-4 h-4" /> Generate Learning Roadmap
            </>
          )}
        </button>
      </form>

      {/* Error Alert */}
      {mutation.isError && (
        <div className="p-6 rounded-[20px] bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-xs text-white font-semibold">AI roadmap generation failed. Please try again.</p>
        </div>
      )}

      {/* Roadmap Output */}
      {roadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {Object.entries(roadmap).map(([level, topics]) => {
            const cfg = levelConfig[level] ?? levelConfig.Beginner
            return (
              <div key={level} className="rounded-[20px] bg-[#101425]/90 border border-white/[0.06] overflow-hidden">
                <div
                  className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
                  style={{ background: cfg.bg }}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5" style={{ color: cfg.color }} />
                    <h3 className="text-sm font-bold tracking-tight" style={{ color: cfg.color }}>
                      {level} Modules
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10" style={{ color: cfg.color }}>
                    {topics?.length ?? 0} topics
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  {Array.isArray(topics) && topics.map((topic, i) => (
                    <TopicCard key={i} topic={topic} />
                  ))}
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
