import api from '../api/axiosInstance'

export const authService = {
  // POST /auth/register — JSON body
  register: async (email, password, role = 'student') => {
    const res = await api.post('/auth/register', { email, password, role })
    return res.data // { success, message, data: { id, email } }
  },

  // POST /auth/login — MUST use application/x-www-form-urlencoded (OAuth2PasswordRequestForm)
  login: async (email, password) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data // { access_token, token_type }
  },

  // GET /auth/me — Returns current user profile
  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data // { success, message, data: { id, email, role, ... } }
  },

  // POST /auth/logout — Stateless, just for completeness
  logout: async () => {
    await api.post('/auth/logout')
  },
}
