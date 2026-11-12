import { supabase } from '../lib/supabaseClient'

// Get dashboard summary using the RPC function we set up in the DB
export async function getDashboardSummary() {
  const { data, error } = await supabase.rpc('dashboard_summary')
  return { data, error }
}

// Get full report summary using the RPC function
export async function getReportSummary(period = 'monthly', date = null) {
  const { data, error } = await supabase.rpc('report_summary', {
    p_period: period,
    p_date: date || new Date().toISOString().split('T')[0],
  })
  return { data, error }
}

// Get month-by-month savings for the savings chart
export async function getMonthlySavings(months = 6) {
  const { data, error } = await supabase.rpc('monthly_savings', { p_months: months })
  return { data, error }
}
