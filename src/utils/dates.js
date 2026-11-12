// Get today's date as YYYY-MM-DD string (for input[type=date] default value)
export function todayString() {
  return new Date().toISOString().split('T')[0]
}

// Format a date string nicely for display (e.g. "12 Nov 2026")
export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Get the first day of the current month as YYYY-MM-DD
export function firstOfMonth(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// Format month label (e.g. "Nov 2026")
export function formatMonthLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

// Get a list of the last N months (most recent first)
export function getLastNMonths(n = 6) {
  const months = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`)
  }
  return months
}

// Get greeting based on current time
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
