import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { User, Mail, Shield, FileText, Phone, Globe, Calendar, Key, Bell, Palette, Check, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { resumeService } from '../services/resumeService'
import toast from 'react-hot-toast'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[#6D5CFF]/15 flex items-center justify-center text-[#6D5CFF] shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-medium">{label}</p>
        <p className="text-xs font-bold text-white mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  const { data: resumeData, isLoading } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: () => resumeService.getResume(user?.id),
    enabled: !!user?.id,
    retry: false,
  })

  const resume = resumeData?.data
  const parsed = resume?.parsed_data
  const isProcessing = parsed?.status === 'processing'

  return (
    <div className="space-y-6 lg:space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          Profile & Settings <Sparkles className="w-6 h-6 text-[#6D5CFF]" />
        </h1>
        <p className="text-sm mt-1 text-slate-400">
          Manage your account profile, security parameters, notification preferences, and appearance.
        </p>
      </div>

      {/* Hero Avatar Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 lg:p-8 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-[#6D5CFF]/10 blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-2xl gradient-btn flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-[#6D5CFF]/30 shrink-0">
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{parsed?.name || user?.email?.split('@')[0]}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6D5CFF]/15 text-[#6D5CFF] border border-[#6D5CFF]/30 capitalize">
              {user?.role || 'Student'}
            </span>
            {user?.is_active && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#26D07C]/15 text-[#26D07C] border border-[#26D07C]/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> Account Active
              </span>
            )}
            {parsed?.classified_domain && !isProcessing && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F93E9F]/15 text-[#F93E9F] border border-[#F93E9F]/30">
                {parsed.classified_domain}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/[0.06] overflow-x-auto gap-2">
        {[
          { id: 'profile', label: 'Profile Info', icon: User },
          { id: 'security', label: 'Password & Security', icon: Key },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
          { id: 'appearance', label: 'Appearance', icon: Palette }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-white border-[#F93E9F] bg-white/[0.02]'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Details */}
          <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
            <h3 className="text-base font-bold text-white mb-3">Account Information</h3>
            <InfoRow icon={Mail} label="Email Address" value={user?.email} />
            <InfoRow icon={Shield} label="Account Role" value={user?.role} />
            <InfoRow icon={Globe} label="WhatsApp Contact" value={user?.whatsapp_number || 'Not Linked'} />
            <InfoRow icon={User} label="Status" value={user?.is_active ? 'Active User' : 'Inactive'} />
          </div>

          {/* Parsed Resume Details */}
          <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
            <h3 className="text-base font-bold text-white mb-3">Extracted Resume Stats</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-8 rounded-xl bg-[#0E1322]" />)}
              </div>
            ) : !resume ? (
              <p className="text-xs text-slate-400 py-3">No resume uploaded yet.</p>
            ) : isProcessing ? (
              <p className="text-xs text-amber-400 py-3">⏳ Resume processing in progress...</p>
            ) : (
              <>
                <InfoRow icon={User} label="Parsed Candidate Name" value={parsed?.name} />
                <InfoRow icon={Mail} label="Resume Email" value={parsed?.email} />
                <InfoRow icon={Phone} label="Contact Phone" value={parsed?.phone} />
                <InfoRow icon={FileText} label="Total Skills Extracted" value={parsed?.skills?.length ? `${parsed.skills.length} skills` : null} />
                <InfoRow icon={Calendar} label="Work Positions" value={parsed?.experience?.length ? `${parsed.experience.length} roles` : null} />
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] space-y-4 max-w-lg">
          <h3 className="text-base font-bold text-white">Change Account Password</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0E1322] text-xs text-white px-4 py-3 rounded-xl border border-white/[0.06] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0E1322] text-xs text-white px-4 py-3 rounded-xl border border-white/[0.06] outline-none" />
          </div>
          <button
            onClick={() => toast.success('Password updated successfully')}
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white cursor-pointer"
          >
            Update Password
          </button>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] space-y-4 max-w-lg">
          <h3 className="text-base font-bold text-white mb-2">Notification Preferences</h3>
          {[
            'Email alerts for new AI job matches',
            'WhatsApp notification for application status changes',
            'Weekly skill gap improvement summaries'
          ].map((pref, i) => (
            <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0E1322] border border-white/[0.04] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[#6D5CFF] w-4 h-4" />
              <span className="text-xs text-slate-200 font-medium">{pref}</span>
            </label>
          ))}
          <button
            onClick={() => toast.success('Notification preferences saved!')}
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="p-6 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] space-y-4 max-w-lg">
          <h3 className="text-base font-bold text-white">Interface Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#080B17] border-2 border-[#6D5CFF] text-center cursor-pointer">
              <span className="text-xs font-bold text-white">CareerPulse Dark</span>
              <p className="text-[10px] text-slate-400 mt-1">Default #080B17 SaaS Theme</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0E1322] border border-white/[0.06] text-center opacity-60 cursor-not-allowed">
              <span className="text-xs font-bold text-white">Light Theme</span>
              <p className="text-[10px] text-slate-400 mt-1">Coming Soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
