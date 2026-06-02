import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(value) {
  if (!value) {
    return ''
  }

  return value.trim().replace(/\/(?:rest|storage|auth|functions)\/v1\/?$/, '')
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  return supabase
}
