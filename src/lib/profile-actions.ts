'use server'

import { createServerClient } from '@/lib/auth-server'
import { revalidatePath } from 'next/cache'

interface UpdateProfileInput {
  displayName?: string | null
  username?: string | null
}

export async function getProfile() {
  const supabase = await createServerClient()
    
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, username, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return {
    user,
    profile: data ?? null,
  }
}

export async function updateProfile({ displayName, username }: UpdateProfileInput) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Debug: inspect session/user and confirm RLS visibility for this user
  const { data: sessionData } = await supabase.auth.getSession()
  const sessionUserId = sessionData?.session?.user?.id || null
  console.log('profile.update session user', sessionUserId)
  console.log('profile.update getUser user', user.id)

  const { error: visibilityError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (visibilityError) {
    throw new Error(`RLS select failed for user ${user.id}: ${visibilityError.message}`)
  }

  const trimmedDisplayName = displayName?.trim() || null
  const trimmedUsername = username?.trim() || null

  const upsertPayload: Record<string, string | null> = {
    user_id: user.id,
    display_name: trimmedDisplayName,
    username: trimmedUsername,
    updated_at: new Date().toISOString(),
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'user_id' })
    .select('display_name, username, updated_at')
    .single()

  if (error) {
    console.error('profile.update upsert error', {
      message: error.message,
      code: error.code,
      userId: user.id,
      sessionUserId,
    })
    throw new Error(
      `Upsert failed for user ${user.id} (session ${sessionUserId ?? 'null'}): ${error.message}`
    )
  }

  const metadataDisplayName = trimmedDisplayName || trimmedUsername || user.email

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      display_name: metadataDisplayName,
      username: trimmedUsername,
    },
  })

  if (metadataError) {
    throw new Error(metadataError.message)
  }

  revalidatePath('/')
  revalidatePath('/profile')

  return profile
}
