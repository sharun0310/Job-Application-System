import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react'
import { jobService } from '../services/jobService'

const samplePrompts = [
  "How can I tailor my resume for a Senior Full Stack Engineer position?",
  "What are the top 5 questions asked in system design interviews?",
  "Analyze my current skills gap for a DevOps Lead role.",
  "Give me advice on negotiating salary for a remote software role."
]

// Helper to format basic markdown (bold, lists, headers, newlines)
function formatMessageContent(text) {
  if (!text) return null

  // Split by line breaks
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        let content = line.trim()
        if (!content) return <div key={idx} className="h-1" />

        // Headings
        if (content.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-white text-base mt-2 mb-1">
              {renderFormattedText(content.replace('### ', ''))}
            </h4>
          )
        }
        if (content.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-bold text-white text-lg mt-3 mb-1">
              {renderFormattedText(content.replace('## ', ''))}
            </h3>
          )
        }

        // Bullet points
        if (content.startsWith('• ') || content.startsWith('* ') || content.startsWith('- ')) {
          const bulletText = content.replace(/^[•*\-]\s+/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#6D5CFF] font-bold text-sm">•</span>
              <span className="flex-1">{renderFormattedText(bulletText)}</span>
            </div>
          )
        }

        // Numbered list
        if (/^\d+\.\s+/.test(content)) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#F93E9F] font-semibold">{content.match(/^\d+\./)[0]}</span>
              <span className="flex-1">{renderFormattedText(content.replace(/^\d+\.\s+/, ''))}</span>
            </div>
          )
        }

        return <p key={idx}>{renderFormattedText(content)}</p>
      })}
    </div>
  )
}

function renderFormattedText(text) {
  // Simple regex parser for **bold** and *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

export default function ChatbotPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your **CareerPulse AI Advisor**. I can help optimize your resume, prepare you for interviews, analyze skill gaps, and guide your career journey. How can I help you today?"
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (textToSend = input) => {
    const messageText = textToSend.trim()
    if (!messageText || isTyping) return

    const userMsg = { id: Date.now(), sender: 'user', text: messageText }
    const updatedMessages = [...messages, userMsg]

    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)

    try {
      // Pass full message history to backend for context awareness
      const historyForBackend = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }))

      const response = await jobService.sendChatMessage(messageText, historyForBackend)
      const botReply = response?.data?.reply || "I'm sorry, I couldn't process that request right now."

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply
        }
      ])
    } catch (err) {
      console.error('Chatbot API error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I experienced a temporary connection issue. Please check that the backend is running and try again!"
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Career Chatbot <Sparkles className="w-6 h-6 text-[#6D5CFF]" />
          </h1>
          <p className="text-sm mt-0.5 text-slate-400">
            24/7 AI-powered career assistant for resume optimization, salary insights & interview guidance.
          </p>
        </div>
        <button
          onClick={() =>
            setMessages([
              {
                id: Date.now(),
                sender: 'bot',
                text: "Conversation reset. How else can I assist your career growth?"
              }
            ])
          }
          className="px-3.5 py-1.5 rounded-xl bg-[#101425] border border-white/[0.06] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 hover:border-white/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] flex flex-col overflow-hidden relative">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                    isBot
                      ? 'bg-gradient-to-r from-[#6D5CFF] to-[#F93E9F] shadow-lg shadow-[#6D5CFF]/20'
                      : 'bg-[#1C243B] border border-white/10'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div
                  className={`p-4 rounded-2xl max-w-2xl text-sm leading-relaxed ${
                    isBot
                      ? 'bg-[#0E1322] border border-white/[0.06] text-slate-200 rounded-tl-none'
                      : 'gradient-btn text-white font-medium rounded-tr-none'
                  }`}
                >
                  {formatMessageContent(msg.text)}
                </div>
              </motion.div>
            )
          })}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#6D5CFF] to-[#F93E9F] flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#0E1322] border border-white/[0.06] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6D5CFF] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-[#F93E9F] animate-ping delay-150" />
                <span className="w-2 h-2 rounded-full bg-[#26D07C] animate-ping delay-300" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        {messages.length < 3 && (
          <div className="px-4 lg:px-6 py-2 border-t border-white/[0.04] bg-[#0E1322]/50 flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="text-xs px-3 py-1.5 rounded-full bg-[#101425] border border-white/[0.06] text-slate-300 hover:text-white hover:border-[#6D5CFF]/50 transition-all text-left truncate max-w-xs cursor-pointer disabled:opacity-50"
              >
                ✨ {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 lg:p-4 border-t border-white/[0.06] bg-[#080B17]/60 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask CareerPulse AI anything about your job hunt..."
            disabled={isTyping}
            className="flex-1 bg-[#0E1322] text-sm text-white px-4 py-3 rounded-xl border border-white/[0.06] outline-none focus:border-[#6D5CFF]/50 transition-colors placeholder:text-slate-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="gradient-btn px-5 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
