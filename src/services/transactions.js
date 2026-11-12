import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 10

// Fetch transactions with optional filters and pagination
export async function getTransactions({ page = 0, type, categoryId, search, startDate, endDate, sortBy = 'date', sortDir = 'desc' } = {}) {
  let query = supabase
    .from('transactions')
    .select('*, categories(name, icon)', { count: 'exact' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (type) query = query.eq('type', type)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (search) query = query.ilike('description', `%${search}%`)
  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data, error, count } = await query
  return { data, error, count, pageSize: PAGE_SIZE }
}

// Add a new transaction
export async function addTransaction(tx) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('User not authenticated') }

  const row = { ...tx, user_id: user.id }
  const { data, error } = await supabase
    .from('transactions')
    .insert([row])
    .select('*, categories(name, icon)')
    .single()
  return { data, error }
}

// Update an existing transaction
export async function updateTransaction(id, updates) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select('*, categories(name, icon)')
    .single()
  return { data, error }
}

// Delete a transaction by id
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  return { error }
}

// Delete all transactions for the current user
export async function deleteAllTransactions() {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete all rows (RLS restricts to own rows)
  return { error }
}

// Fetch all categories for the current user
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name')
  return { data, error }
}

// Add a custom category
export async function addCategory(name, icon = '📦') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('User not authenticated') }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ user_id: user.id, name, icon, is_default: false }])
    .select()
    .single()
  return { data, error }
}
