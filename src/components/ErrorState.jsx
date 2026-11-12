import { AlertCircle, RefreshCw } from 'lucide-react'

// Show when something fails to load
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <AlertCircle size={32} className="text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">Connection failed</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  )
}
