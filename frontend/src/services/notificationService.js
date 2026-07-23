import api from '../api/axiosInstance'

export const notificationService = {
  // GET /notifications/ — note trailing slash is required
  getNotifications: async (unreadOnly = false) => {
    const res = await api.get('/notifications/', { params: { unread_only: unreadOnly } })
    return res.data // { success, data: [...notifications] }
  },

  // PUT /notifications/{id}/read — no body required
  markAsRead: async (notificationId) => {
    const res = await api.put(`/notifications/${notificationId}/read`)
    return res.data // { success, data: notification }
  },
}
