// A single summary card shown on the dashboard
// Props: title, value, icon, color ('blue'|'green'|'red'|'amber'), subtitle
export default function SummaryCard({ title, value, icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    navy: 'bg-blue-100 text-blue-800',
  }

  const iconBg = colorMap[color] || colorMap.blue

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`${iconBg} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
