import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  IndianRupee,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  PieChart,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, isValidPassword, friendlyAuthError } from '../utils/validators'

export default function AuthPage() {
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // If already authenticated, redirect straight to dashboard
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Clear errors when toggling between login and signup
  function toggleMode(loginMode) {
    setIsLogin(loginMode)
    setErrors({})
  }

  // Validate inputs before submitting to Supabase
  function validate() {
    const errs = {}
    if (!isLogin && (!fullName || fullName.trim().length < 2)) {
      errs.fullName = 'Please enter your full name (at least 2 letters).'
    }
    if (!email) {
      errs.email = 'Email address is required.'
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address (e.g. name@college.edu).'
    }
    if (!password) {
      errs.password = 'Password is required.'
    } else if (!isValidPassword(password)) {
      errs.password = 'Password must be at least 8 characters long.'
    }
    if (!isLogin && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})

    const clientErrors = validate()
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        // Sign in existing user
        const { error } = await signIn(email.trim(), password)
        if (error) {
          const friendly = friendlyAuthError(error)
          setErrors({ form: friendly })
          toast.error(friendly)
        } else {
          toast.success('Logged in successfully!')
          navigate('/dashboard')
        }
      } else {
        // Sign up new user
        const { data, error } = await signUp(email.trim(), password, fullName.trim())
        if (error) {
          const friendly = friendlyAuthError(error)
          setErrors({ form: friendly })
          toast.error(friendly)
        } else {
          toast.success('Account created! Welcome to PennyWise.')
          // If auto-confirmed, redirect to dashboard
          if (data?.session) {
            navigate('/dashboard')
          } else {
            toast.success('You can now log in with your credentials.')
            setIsLogin(true)
          }
        }
      }
    } catch (err) {
      const msg = err?.message || 'Network error. Please try again.'
      setErrors({ form: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Column: Form Card */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-8 md:px-12 lg:px-16 max-w-xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          {/* Mobile & Header Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-sm text-white">
              <IndianRupee size={22} />
            </div>
            <div>
              <span className="text-xl font-bold text-blue-900 tracking-tight">PennyWise</span>
              <p className="text-[11px] text-slate-400 font-medium">Student Expense & Budget Tracker</p>
            </div>
          </div>

          {/* Form Title & Subtitle */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome back!' : 'Create student account'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isLogin
                ? 'Sign in to access your expenses, budgets, and savings reports.'
                : 'Join PennyWise to take control of your college spending today.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Level Error Alert */}
          {errors.form && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sahil Sharma"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password {isLogin ? '' : '(min. 8 characters)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Remember Me (Login only) */}
            {isLogin && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600">Remember me</span>
                </label>
                <span className="text-[11px] text-slate-400">Saved in browser session</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl text-sm hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to PennyWise' : 'Complete Registration'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Helper Link */}
          <div className="mt-6 text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
            {isLogin ? (
              <p>
                New student?{' '}
                <button
                  type="button"
                  onClick={() => toggleMode(false)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => toggleMode(true)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          PennyWise • 2nd-Year B.Tech IT College Project (OST)
        </p>
      </div>

      {/* Right Column: Hero Gradient Panel (Desktop Only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative background glow circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Top Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-blue-100 border border-white/10">
            <ShieldCheck size={14} className="text-blue-300" />
            <span>Secure Student Financial Tracker</span>
          </div>
          <span className="text-xs text-blue-200">v1.0 Live</span>
        </div>

        {/* Center Content & Feature Highlights */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Master your student budget, one rupee at a time.
            </h2>
            <p className="mt-3 text-base text-blue-100/90 leading-relaxed">
              Designed specifically for college life. Track daily canteen chai, mess dues, transit passes, and hostel rent with zero clutter.
            </p>
          </div>

          {/* Interactive Feature Pills */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-300 shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Daily Expense Logging</p>
                <p className="text-xs text-blue-200">Record UPI, Cash, or Card payments in seconds.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <div className="bg-amber-500/20 p-2 rounded-lg text-amber-300 shrink-0">
                <TrendingDown size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Smart Category Budgets</p>
                <p className="text-xs text-blue-200">Visual progress alerts before you overspend on Food or Shopping.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
              <div className="bg-blue-400/20 p-2 rounded-lg text-blue-200 shrink-0">
                <PieChart size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Visual Analytics & Reports</p>
                <p className="text-xs text-blue-200">Recharts donuts, area graphs, and month-by-month savings trends.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Subject Tag */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
          <span>OST (Open Source Technologies) Subject</span>
          <span>B.Tech IT College Project</span>
        </div>
      </div>
    </div>
  )
}
