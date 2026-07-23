import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { UserCheck, Code, Cpu, Play, Sparkles, CheckCircle2, ChevronRight, MessageSquare, Loader2, Award, RefreshCw } from 'lucide-react'
import { jobService } from '../services/jobService'
import { resumeService } from '../services/resumeService'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const prepCategories = [
  {
    id: 'hr',
    title: 'HR & Behavioral',
    icon: UserCheck,
    color: '#6D5CFF',
    gradient: 'from-[#6D5CFF]/20 to-purple-900/10',
    borderColor: 'rgba(109, 92, 255, 0.3)',
    count: '45+ Questions',
    question: "Tell me about a challenging situation at work where you faced conflicting priorities or tight deadlines. How did you handle it?",
    keywords: "STAR method, Priority, Communication, Result",
    desc: 'Master Tell me about yourself, strengths, conflict resolution, and situational queries.'
  },
  {
    id: 'technical',
    title: 'Technical & System Design',
    icon: Cpu,
    color: '#F93E9F',
    gradient: 'from-[#F93E9F]/20 to-pink-900/10',
    borderColor: 'rgba(249, 62, 159, 0.3)',
    count: '60+ Concepts',
    question: "Tell me about a challenging project where you had to optimize API latency or database queries under heavy load. How did you diagnose and resolve the bottleneck?",
    keywords: "PostgreSQL, Indexing, Caching, Redis, Load Balancing",
    desc: 'Deep dive into microservices, OOP, databases, caching, and scalable architecture.'
  },
  {
    id: 'coding',
    title: 'Coding & Data Structures',
    icon: Code,
    color: '#26D07C',
    gradient: 'from-[#26D07C]/20 to-emerald-900/10',
    borderColor: 'rgba(38, 208, 124, 0.3)',
    count: '120+ Challenges',
    question: "How would you design an efficient algorithm to detect duplicates in a stream of 10 million real-time log records with minimal memory footprint?",
    keywords: "Hash Set, Bloom Filter, Time Complexity, O(1) Lookup",
    desc: 'Practice LeetCode style problems, Big-O analysis, arrays, trees, and dynamic programming.'
  }
]

export default function InterviewPrepPage() {
  const { user } = useAuthStore()
  const [activeCategory, setActiveCategory] = useState('technical')
  const [isSimulating, setIsSimulating] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [customQuestion, setCustomQuestion] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const { data: resumeData } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: () => resumeService.getResume(user?.id),
    enabled: !!user?.id,
  })

  const userSkills = resumeData?.data?.parsed_data?.skills || ["Python", "System Architecture", "SQL", "React"]
  const category = prepCategories.find((c) => c.id === activeCategory) || prepCategories[1]
  const currentQuestion = customQuestion || category.question

  const handleGenerateCustomQuestion = async () => {
    setIsGeneratingQuestion(true)
    const skillsStr = userSkills.join(', ')
    const prompt = `Generate a high-frequency, realistic ${category.title} interview question tailored specifically for a candidate with these skills: ${skillsStr}. Return ONLY the interview question text in 1-2 sentences without commentary.`

    try {
      const res = await jobService.sendChatMessage(prompt)
      if (res?.data?.reply) {
        setCustomQuestion(res.data.reply.trim())
        setFeedback(null)
        setUserAnswer('')
        toast.success('Generated new custom interview question!')
      }
    } catch (err) {
      toast.error('Failed to generate question.')
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

  const handleEvaluate = async () => {
    if (!userAnswer.trim() || isEvaluating) return
    setIsEvaluating(true)

    const prompt = `Act as an expert technical interviewer evaluating a candidate's response.
Question: "${category.question}"
Candidate Answer: "${userAnswer}"

Please evaluate this answer concisely:
1. Score out of 10
2. Key Strengths
3. Areas for Improvement (STAR method & technical accuracy)
4. Model Answer Suggestion`

    try {
      const response = await jobService.sendChatMessage(prompt)
      const reply = response?.data?.reply || "Good effort! Try quantifying your results using specific metrics."
      setFeedback(reply)
      toast.success('AI Interview Feedback Generated!')
    } catch (err) {
      console.error(err)
      toast.error('Could not evaluate answer. Please try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Interview Prep <Sparkles className="w-6 h-6 text-[#F93E9F]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          AI-driven interview simulation tailored to your target job profile and technical stack.
        </p>
      </div>

      {/* 3 Core Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {prepCategories.map((cat) => {
          const Icon = cat.icon
          const isSelected = activeCategory === cat.id
          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -4 }}
              onClick={() => {
                setActiveCategory(cat.id)
                setFeedback(null)
              }}
              className={`p-6 rounded-[20px] cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-gradient-to-b ' + cat.gradient + ' border-2'
                  : 'bg-[#101425]/90 border-white/[0.06] hover:border-white/20'
              }`}
              style={{ borderColor: isSelected ? cat.color : undefined }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${cat.color}1E`, color: cat.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${cat.color}15`, color: cat.color }}
                >
                  {cat.count}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">{cat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{cat.desc}</p>
              <div className="flex items-center text-xs font-semibold" style={{ color: cat.color }}>
                {isSelected ? 'Selected Category' : 'Start Practice'} <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Mock Interview Simulator Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 lg:p-8 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] relative overflow-hidden"
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#6D5CFF]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6D5CFF]/10 text-[#6D5CFF] mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI Mock Interviewer Active ({category.title})
            </div>
            <h2 className="text-xl font-bold text-white">Live AI Interactive Practice</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Get real-time feedback on your answer structure (STAR method), technical depth, and key terminology.
            </p>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="gradient-btn px-6 py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
          >
            {isSimulating ? (
              <>
                <MessageSquare className="w-4 h-4" /> End Session
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Start AI Mock Session
              </>
            )}
          </button>
        </div>

        {isSimulating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-white/[0.06] space-y-4"
          >
            <div className="p-4 rounded-xl bg-[#080B17] border border-[#6D5CFF]/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6D5CFF] to-[#F93E9F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  AI
                </div>
                <div>
                  <p className="text-xs text-[#F93E9F] font-semibold mb-1">AI Interviewer Question ({category.title})</p>
                  <p className="text-sm text-white font-medium">{currentQuestion}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGenerateCustomQuestion}
                disabled={isGeneratingQuestion}
                className="px-3 py-1.5 rounded-lg bg-[#6D5CFF]/20 text-[#6D5CFF] border border-[#6D5CFF]/30 text-xs font-bold hover:bg-[#6D5CFF]/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {isGeneratingQuestion ? 'Generating...' : 'New Question'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1322] border border-white/[0.06]">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your response using the STAR method (Situation, Task, Action, Result)..."
                className="w-full bg-transparent text-sm text-white outline-none resize-none h-28 placeholder:text-slate-500"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-white/[0.06]">
                <span className="text-xs text-slate-400">AI key signals: {category.keywords}</span>
                <button
                  onClick={handleEvaluate}
                  disabled={!userAnswer.trim() || isEvaluating}
                  className="px-5 py-2 rounded-xl bg-[#26D07C]/20 text-[#26D07C] border border-[#26D07C]/40 text-xs font-bold hover:bg-[#26D07C]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                  {isEvaluating ? 'Evaluating...' : 'Submit & Evaluate Response'}
                </button>
              </div>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-[#080B17] border border-[#26D07C]/30 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#26D07C] mb-1">
                  <Award className="w-4 h-4" /> AI Interviewer Evaluation & Feedback
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{feedback}</div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Practice Topic Checklist */}
      <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
        <h3 className="text-base font-semibold text-white mb-4">Recommended Topic Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'System Architecture & Microservices',
            'Database Indexing & Query Optimization',
            'React Fiber & Virtual DOM Performance',
            'Async Processing & Message Queues',
            'REST vs GraphQL vs gRPC Protocols',
            'CI/CD Pipelines & Docker Containerization'
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#0E1322] border border-white/[0.04]">
              <CheckCircle2 className="w-4 h-4 text-[#26D07C] shrink-0" />
              <span className="text-xs text-slate-300 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
