import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar, BottomTabs } from './Navbar'
import Skeleton from './Skeleton'

// Protects routes that need authentication
// Also wraps authenticated pages with Sidebar (desktop) and BottomTabs (mobile)
export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="md:ml-60 min-h-screen pb-20 md:pb-8 p-4 md:p-8 max-w-7xl">
        <Outlet />
      </main>

      {/* Mobile Bottom Tabs */}
      <BottomTabs />
    </div>
  )
}
