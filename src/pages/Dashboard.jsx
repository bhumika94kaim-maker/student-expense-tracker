import { LogOut, User, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getGreeting } from '../utils/dates'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const greeting = getGreeting()

  async function handleLogout() {
    await signOut()
    toast.success('Signed out successfully.')
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Personalized Greeting & Sign Out */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-medium text-xs mb-1">
            <Sparkles size={14} />
            <span>{greeting}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {displayName}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-medium text-slate-700">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors active:scale-95"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Placeholder card for upcoming Phase 4 */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-center">
        <h2 className="text-base font-semibold text-blue-900 mb-1">
          Authentication Verified Successfully
        </h2>
        <p className="text-xs text-blue-700 max-w-md mx-auto">
          Phase 3 is active! Your session is securely stored and protected by Supabase Auth with Row Level Security.
        </p>
      </div>
    </div>
  )
}
