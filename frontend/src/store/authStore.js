import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null, // { id, email, role, is_active, whatsapp_number }

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),

      login: (token, user) => set({ token, user }),

      logout: () => {
        set({ token: null, user: null })
      },

      isAuthenticated: () => {
        const state = useAuthStore.getState()
        return !!state.token && !!state.user
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
