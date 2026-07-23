import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Clock, Loader2, Sparkles } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => notificationService.getNotifications(false),
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => toast.error('Failed to mark as read.'),
  })

  const notifications = Array.isArray(data?.data) ? data.data : []
  const unread = notifications.filter(n => !n.is_read && !n.read_status)

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Notifications Center <Sparkles className="w-6 h-6 text-[#F93E9F]" />
          </h1>
          <p className="text-sm mt-1 text-slate-400">
            {unread.length > 0 ? `You have ${unread.length} unread alert${unread.length !== 1 ? 's' : ''}` : 'All notifications caught up!'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={() => unread.forEach(n => markReadMutation.mutate(n.id))}
            className="px-4 py-2 rounded-xl bg-[#101425] border border-[#6D5CFF]/40 text-xs font-semibold text-[#6D5CFF] hover:bg-[#6D5CFF]/15 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-16 text-center rounded-[20px] bg-[#101425]/90 border border-white/[0.06]">
          <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-bold text-white mb-1">No Notifications</p>
          <p className="text-xs text-slate-400">You are completely up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const isUnread = !n.is_read && !n.read_status
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-5 rounded-[20px] border transition-all flex items-start gap-4 ${
                  isUnread
                    ? 'bg-[#6D5CFF]/10 border-[#6D5CFF]/30 shadow-lg shadow-[#6D5CFF]/5'
                    : 'bg-[#101425]/90 border-white/[0.06]'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${isUnread ? 'bg-[#F93E9F] animate-pulse' : 'bg-transparent'}`} />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{n.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {isUnread && (
                      <button
                        onClick={() => markReadMutation.mutate(n.id)}
                        disabled={markReadMutation.isPending}
                        className="text-xs font-semibold text-[#6D5CFF] hover:text-[#F93E9F] transition-colors cursor-pointer"
                      >
                        {markReadMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Mark as Read'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
