import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { AuthProvider } from './context/AuthContext'
import SetupNeeded from './components/SetupNeeded'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Budget from './pages/Budget'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  // If Supabase credentials are not set in .env, show the friendly setup guide
  if (!isSupabaseConfigured) {
    return <SetupNeeded />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public auth route */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
