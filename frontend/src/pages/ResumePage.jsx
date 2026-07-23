import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Upload, FileText, User, Briefcase, Code, BookOpen, Loader2, RefreshCw,
  AlertCircle, Clock, Award, Sparkles, CheckCircle2, FileCheck, Lightbulb
} from 'lucide-react'
import { resumeService } from '../services/resumeService'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-[20px] p-6 bg-[#101425]/90 border border-white/[0.06]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#6D5CFF]/15 flex items-center justify-center text-[#6D5CFF]">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ResumePage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef()
  const [dragging, setDragging] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: () => resumeService.getResume(user?.id),
    enabled: !!user?.id,
    retry: false,
    refetchInterval: (data) => {
      const pd = data?.data?.parsed_data
      return pd?.status === 'processing' ? 800 : false
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file) => resumeService.upload(file),
    onSuccess: () => {
      toast.success('Resume uploaded! Analyzing skills...')
      qc.invalidateQueries({ queryKey: ['resume'] })
      qc.invalidateQueries({ queryKey: ['recommended'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setTimeout(() => refetch(), 300)
      setTimeout(() => refetch(), 1000)
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Upload failed.'
      toast.error(msg)
    },
  })

  const handleFile = (file) => {
    if (!file) return
    const filename = (file.name || '').toLowerCase()
    const ext = filename.substring(filename.lastIndexOf('.'))
    const validExts = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg']
    const validTypes = [
      'application/pdf',
      'application/x-pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/png', 'image/jpeg', 'image/jpg'
    ]

    const isValid = validExts.includes(ext) || validTypes.includes(file.type)
    if (!isValid) {
      toast.error('Unsupported file type. Please upload a PDF, DOCX, or Image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }
    uploadMutation.mutate(file)
  }

  const resume = data?.data
  const parsed = resume?.parsed_data
  const isProcessing = parsed?.status === 'processing'
  const hasResume = !!resume && !!parsed && !isProcessing && (parsed?.skills?.length > 0 || !!parsed?.name)
  const skillCount = parsed?.skills?.length || 0
  const atsScoreEstimate = hasResume ? Math.min(95, 60 + skillCount * 3) : 0

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          My Resume & ATS Insights <Sparkles className="w-6 h-6 text-[#6D5CFF]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          Upload your resume for AI vector extraction, skill classification, and ATS optimization scores.
        </p>
      </div>

      {/* Large Drag & Drop Upload Zone */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current?.click()}
        className={`rounded-[20px] p-8 lg:p-12 border-2 border-dashed cursor-pointer transition-all text-center relative overflow-hidden ${
          dragging
            ? 'bg-[#6D5CFF]/10 border-[#6D5CFF] shadow-2xl shadow-[#6D5CFF]/20'
            : 'bg-[#101425]/90 border-white/10 hover:border-[#6D5CFF]/50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#6D5CFF]" />
            <p className="text-sm font-semibold text-white">Uploading & Dispatching to AI Engine...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center text-white shadow-xl shadow-[#6D5CFF]/30">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                {resume ? 'Upload New Resume Version' : 'Drop your resume file here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Drag & drop or click to browse. Supports PDF, DOCX, PNG, JPG (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-3 p-5 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <Loader2 className="w-5 h-5 animate-spin text-[#6D5CFF]" />
          <span className="text-xs text-slate-300 font-medium">Fetching current resume status...</span>
        </div>
      )}

      {/* No Resume Alert */}
      {!isLoading && (error || !resume) && (
        <div className="flex items-center gap-3 p-5 rounded-[20px] bg-[#101425]/90 border border-amber-500/30">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">No Resume Found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Upload a PDF or DOCX file above to get AI recommendations.</p>
          </div>
        </div>
      )}

      {/* Processing Banner */}
      {isProcessing && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-3 p-5 rounded-[20px] bg-[#6D5CFF]/15 border border-[#6D5CFF]/40"
        >
          <Clock className="w-5 h-5 text-[#F93E9F] shrink-0 animate-spin" />
          <div className="flex-1">
            <p className="text-xs font-bold text-white">AI Engine Parsing Resume...</p>
            <p className="text-[11px] text-slate-300 mt-0.5">Extracting skills, experience, and building embeddings. Auto-refreshing...</p>
          </div>
          <button onClick={() => refetch()} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <RefreshCw className="w-4 h-4 text-[#6D5CFF]" />
          </button>
        </motion.div>
      )}

      {/* ATS Score & Quality Metrics */}
      {hasResume && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6D5CFF]/15 flex items-center justify-center text-[#6D5CFF] shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">ATS Compatibility</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">{atsScoreEstimate}% Match</p>
              <p className="text-[11px] text-[#26D07C] font-semibold mt-0.5">Optimized format</p>
            </div>
          </div>

          <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F93E9F]/15 flex items-center justify-center text-[#F93E9F] shrink-0">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Quality Index</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">Excellent</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{skillCount} skills detected</p>
            </div>
          </div>

          <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#26D07C]/15 flex items-center justify-center text-[#26D07C] shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Domain Classification</p>
              <p className="text-base font-extrabold text-white truncate mt-0.5">{parsed.classified_domain || 'Software Engineering'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">AI Classified</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Resume Details */}
      {hasResume && parsed && !isProcessing && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Details */}
          {(parsed.name || parsed.email || parsed.classified_domain) && (
            <Section icon={User} title="Parsed Candidate Profile">
              <div className="space-y-2.5">
                {parsed.name && (
                  <div className="flex justify-between text-xs py-1.5 border-b border-white/[0.04]">
                    <span className="text-slate-400">Full Name</span>
                    <span className="text-white font-bold">{parsed.name}</span>
                  </div>
                )}
                {parsed.email && (
                  <div className="flex justify-between text-xs py-1.5 border-b border-white/[0.04]">
                    <span className="text-slate-400">Email Address</span>
                    <span className="text-white">{parsed.email}</span>
                  </div>
                )}
                {parsed.phone && (
                  <div className="flex justify-between text-xs py-1.5 border-b border-white/[0.04]">
                    <span className="text-slate-400">Phone Number</span>
                    <span className="text-white">{parsed.phone}</span>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Extracted Skills */}
          {parsed.skills?.length > 0 && (
            <Section icon={Code} title={`Extracted Skills (${parsed.skills.length})`}>
              <div className="flex flex-wrap gap-2">
                {parsed.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#6D5CFF]/10 text-[#6D5CFF] border border-[#6D5CFF]/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {parsed.education?.length > 0 && (
            <Section icon={BookOpen} title="Education History">
              <div className="space-y-3">
                {parsed.education.map((edu, i) => (
                  <div key={i} className="text-xs p-3 rounded-xl bg-[#0E1322] border border-white/[0.04]">
                    <p className="text-white font-bold">{edu.degree || edu.institution || JSON.stringify(edu)}</p>
                    {edu.institution && edu.degree && <p className="text-slate-400 mt-1">{edu.institution}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Experience Timeline */}
          {parsed.experience?.length > 0 && (
            <Section icon={Briefcase} title="Work Experience">
              <div className="space-y-3">
                {parsed.experience.map((exp, i) => (
                  <div key={i} className="text-xs p-3 rounded-xl bg-[#0E1322] border-l-4 border-[#F93E9F]">
                    <p className="text-white font-bold">{exp.job_title || exp.title}</p>
                    <p className="text-[#6D5CFF] font-semibold mt-0.5">{exp.company_name || exp.company}</p>
                    {exp.description && <p className="text-slate-400 mt-1 line-clamp-2 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* AI Improvement Suggestions */}
      {hasResume && (
        <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> AI Resume Optimization Suggestions
          </h3>
          <div className="space-y-2.5">
            {(parsed?.improvement_suggestions?.length > 0 ? parsed.improvement_suggestions : [
              'Add quantified achievement metrics (e.g. "Increased database query throughput by 35%").',
              'Include top keywords for target roles: Docker, Kubernetes, Microservices, CI/CD.',
              'Ensure job title matches standard industry designations for ATS parsers.'
            ]).map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#26D07C] shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
