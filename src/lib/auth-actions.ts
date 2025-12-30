'use server'

import { createServerClient } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string, username?: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username ?? email,
        username,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // Best-effort profile upsert to keep profile/display metadata in sync.
  if (data?.user) {
    try {
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        display_name: username ?? null,
        username: username ?? null,
        updated_at: new Date().toISOString(),
      })
    } catch {
      // Swallow errors so sign-up flow is not blocked if the table or RLS is not ready yet.
    }
  }

  redirect('/')
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createServerClient()

  await supabase.auth.signOut()

  redirect('/login')
}
