import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Surfaced early so a misconfigured .env fails loudly instead of with a
  // confusing network error later.
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README).',
  )
}

// The anon key is intended to be public — it is safe in the browser because
// access is meant to be governed by Row-Level Security. (RLS is NOT enforced
// yet in this starter — that is Task 1c.)
export const supabase = createClient(url, anonKey)
