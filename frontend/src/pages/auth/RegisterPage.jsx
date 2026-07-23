import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      // Step 1: Register — JSON body
      await authService.register(email, password, 'student')

      // Step 2: Auto-login after register
      const tokenData = await authService.login(email, password)
      useAuthStore.getState().setToken(tokenData.access_token)

      // Step 3: Fetch full profile
      const meData = await authService.getMe()
      login(tokenData.access_token, meData.data)

      toast.success('Account created! Welcome to CareerPulse 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Registration failed.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 rounded-[20px] bg-[#101425]/90 border border-white/[0.06] shadow-2xl backdrop-blur-xl">
      <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Create Account</h1>
      <p className="text-xs text-slate-400 mb-6">Join CareerPulse for AI-powered job matches & resume parsing</p>

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
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 pr-10 rounded-xl text-xs bg-[#0E1322] border border-white/[0.06] text-white outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
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

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
          <input
            type="password"
            placeholder="Repeat password"
            className="w-full px-4 py-3 rounded-xl text-xs bg-[#0E1322] border border-white/[0.06] text-white outline-none focus:border-[#6D5CFF]/60 transition-all placeholder:text-slate-500"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: val => val === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && <p className="text-[11px] mt-1 text-rose-400">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-btn text-xs font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </>
          ) : (
            <>
              Get Started <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-center mt-6 text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#F93E9F] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
