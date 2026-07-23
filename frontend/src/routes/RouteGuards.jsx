import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  return children
}

export const PublicRoute = ({ children }) => {
  const { token, user } = useAuthStore()
  if (token && user) return <Navigate to="/dashboard" replace />
  return children
}
