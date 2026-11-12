// Check if email looks valid
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Password must be at least 8 characters
export function isValidPassword(password) {
  return password && password.length >= 8
}

// Amount must be a positive number
export function isValidAmount(amount) {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0
}

// Map Supabase auth error messages to friendly text
export function friendlyAuthError(error) {
  if (!error) return null
  const msg = error.message || ''
  if (msg.includes('already registered') || msg.includes('User already registered')) {
    return 'This email is already registered. Please log in instead.'
  }
  if (msg.includes('Invalid login credentials')) {
    return 'Wrong email or password. Please try again.'
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link first.'
  }
  if (msg.includes('Password should be at least')) {
    return 'Password must be at least 8 characters.'
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a minute and try again.'
  }
  return msg || 'Something went wrong. Please try again.'
}
