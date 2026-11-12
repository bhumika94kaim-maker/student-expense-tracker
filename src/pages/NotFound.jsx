import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">404</h1>
        <p className="text-base font-semibold text-slate-700 mb-1">Page Not Found</p>
        <p className="text-sm text-slate-500 mb-6">The page you are looking for does not exist.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Home size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
