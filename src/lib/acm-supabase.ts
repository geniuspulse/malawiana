import { createClient } from '@supabase/supabase-js'

// ACM (Arthur Chibondo Media) shared auth Supabase
// Used for cross-site authentication — same account works on APM Chibondo, Malawiana, and Afropartisan
const acmUrl = process.env.NEXT_PUBLIC_ACM_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const acmAnonKey = process.env.NEXT_PUBLIC_ACM_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const acmSupabase = createClient(acmUrl, acmAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'acm-auth',
  },
})
