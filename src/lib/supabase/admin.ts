import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazily-created, cached service-role client.
//
// Construction must never throw: route modules construct clients at import
// time, and `next build` imports every route while collecting page data —
// with no env vars set, supabase-js throws "supabaseUrl is required" and the
// build fails. When the real env vars are absent we fall back to inert
// placeholder values so construction succeeds; actual queries then fail at
// request time (which is the only moment they could ever succeed anyway).
// When env IS present, behaviour is exactly as before.
let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
  return cached
}
