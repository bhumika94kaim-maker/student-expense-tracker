import { createClient } from '@supabase/supabase-js'

// These come from the .env file (copy .env.example to .env and fill in your values)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if the env variables are set
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create the Supabase client (only if configured)
let supabase = null

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
export default supabase
