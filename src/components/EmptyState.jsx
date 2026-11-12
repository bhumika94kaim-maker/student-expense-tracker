import { PackageOpen } from 'lucide-react'

// Show this when a list has no items
export default function EmptyState({ title = 'Nothing here yet', message = 'Add your first item to get started.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-blue-50 rounded-full p-4 mb-4">
        <PackageOpen size={32} className="text-blue-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{message}</p>
    </div>
  )
}
