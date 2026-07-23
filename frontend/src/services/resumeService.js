import api from '../api/axiosInstance'

export const resumeService = {
  // POST /resume/upload — multipart/form-data, field name: "file"
  upload: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data // { success, message, data: { resume_id, status } }
  },

  // GET /resume/{user_id} — requires numeric user_id from /auth/me
  getResume: async (userId) => {
    const res = await api.get(`/resume/${userId}`)
    return res.data // { success, data: { resume_id, parsed_data } }
  },
}
