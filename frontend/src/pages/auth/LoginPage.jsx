import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      // Step 1: Login — MUST use form-urlencoded (OAuth2PasswordRequestForm)
      const tokenData = await authService.login(email, password)
      useAuthStore.getState().setToken(tokenData.access_token)

      // Step 2: Fetch user profile
      const meData = await authService.getMe()
      const user = meData.data

      // Step 3: Persist both
      login(tokenData.access_token, user)

      toast.success(`Welcome back, ${user.email}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] shadow-2xl backdrop-blur-xl">
      <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome Back</h1>
      <p className="text-xs text-slate-400 mb-6">Sign in to your CareerPulse account to continue</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full px-4 py-3 rounded-xl text-xs bg-[#0E1322] border border-white/[0.06] text-white outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-[11px] mt-1 text-rose-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-10 rounded-xl text-xs bg-[#0E1322] border border-white/[0.06] text-white outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] mt-1 text-rose-400">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-btn text-xs font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-center mt-6 text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[#F93E9F] hover:underline">
          Create one now
        </Link>
      </p>
    </div>
  )
}
