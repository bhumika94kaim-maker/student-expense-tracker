// Format a number as currency (default INR)
export function formatCurrency(amount, currency = 'INR') {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  return formatted
}

// Shorthand for displaying large amounts (e.g. ₹1.2L instead of ₹1,20,000)
export function formatShort(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return `₹${amount}`
}
