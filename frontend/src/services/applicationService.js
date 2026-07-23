import api from '../api/axiosInstance'

export const applicationService = {
  // POST /applications/apply — JSON body: { job_id }
  apply: async (jobId) => {
    const res = await api.post('/applications/apply', { job_id: jobId })
    return res.data // { success, message, data: { id, user_id, job_id, status, created_at } }
  },

  // GET /applications — returns current user's applications
  getMyApplications: async () => {
    const res = await api.get('/applications')
    return res.data // { success, data: [...applications] }
  },
}
