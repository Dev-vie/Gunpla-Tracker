import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client for auth and data operations
 * Use this in Client Components
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
