import { supabase } from '../lib/supabaseClient'

// Get the budget for a specific month (YYYY-MM-DD format, first of month)
export async function getBudget(month) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, category_budgets(*, categories(name, icon))')
    .eq('month', month)
    .single()
  return { data, error }
}

// Save or update the overall monthly budget
export async function saveBudget(month, totalBudget) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert({ month, total_budget: totalBudget }, { onConflict: 'user_id,month' })
    .select()
    .single()
  return { data, error }
}

// Save per-category budget limits (replaces all existing for this budget)
export async function saveCategoryBudgets(budgetId, limits) {
  // First delete the old limits
  await supabase.from('category_budgets').delete().eq('budget_id', budgetId)
  
  // Then insert the new ones
  if (limits.length === 0) return { error: null }
  
  const rows = limits.map(l => ({
    budget_id: budgetId,
    category_id: l.category_id,
    limit_amount: l.limit_amount,
  }))
  
  const { error } = await supabase.from('category_budgets').insert(rows)
  return { error }
}

// Get the last month's budget so user can copy it
export async function getLastMonthBudget(currentMonth) {
  // currentMonth is "YYYY-MM-01" – go back one month
  const d = new Date(currentMonth)
  d.setMonth(d.getMonth() - 1)
  const lastMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  
  return getBudget(lastMonth)
}

// Get the current month's spending per category (for progress bars)
export async function getCategorySpending(month) {
  const start = month
  const end = new Date(month)
  end.setMonth(end.getMonth() + 1)
  const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('type', 'expense')
    .gte('date', start)
    .lt('date', endStr)

  if (error) return { data: null, error }

  // Group by category_id and sum amounts
  const spending = {}
  for (const row of data || []) {
    spending[row.category_id] = (spending[row.category_id] || 0) + parseFloat(row.amount)
  }
  
  return { data: spending, error: null }
}
