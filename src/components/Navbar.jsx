import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart2, Wallet, Settings, IndianRupee } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getGreeting } from '../utils/dates'

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/reports', icon: <BarChart2 size={20} />, label: 'Reports' },
  { to: '/budget', icon: <Wallet size={20} />, label: 'Budget' },
  { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
]

// Desktop sidebar navigation
export function Sidebar() {
  const { user, profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Student'

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-slate-100 p-4 fixed top-0 left-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="bg-blue-600 p-2 rounded-xl">
          <IndianRupee size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-blue-900">PennyWise</span>
      </div>

      {/* Greeting */}
      <div className="px-2 mb-6 pb-4 border-b border-slate-100">
        <p className="text-xs text-slate-400">{getGreeting()},</p>
        <p className="text-sm font-semibold text-slate-700">{firstName}</p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* App name at bottom */}
      <div className="px-2 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">PennyWise v1.0</p>
        <p className="text-xs text-slate-300">OST College Project</p>
      </div>
    </aside>
  )
}

// Mobile bottom tab bar
export function BottomTabs() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
