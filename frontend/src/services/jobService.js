import api from '../api/axiosInstance'

export const jobService = {
  // GET /jobs?skip=0&limit=100
  getJobs: async (skip = 0, limit = 100) => {
    const res = await api.get('/jobs', { params: { skip, limit } })
    return res.data // { success, data: [...jobs] }
  },

  // GET /jobs/{job_id}
  getJob: async (jobId) => {
    const res = await api.get(`/jobs/${jobId}`)
    return res.data // { success, data: job }
  },

  // GET /live-jobs/search?query=&location=
  searchLiveJobs: async (query = '', location = '') => {
    const res = await api.get('/live-jobs/search', { params: { query, location } })
    return res.data // { success, data: { results_count, jobs: [...] } }
  },

  // POST /chatbot/chat
  sendChatMessage: async (message, history = [], context = null) => {
    const res = await api.post('/chatbot/chat', { message, history, context })
    return res.data // { success, data: { reply: "..." } }
  },
}

