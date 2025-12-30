'use server'

import { createServerClient } from '@/lib/auth-server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database.types'

type GunplaKitInsert = Database['public']['Tables']['gunpla_kits']['Insert']
type GunplaKitUpdate = Database['public']['Tables']['gunpla_kits']['Update']

export async function createGunplaKit(data: GunplaKitInsert) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: kit, error } = await supabase
    .from('gunpla_kits')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  return kit
}

export async function updateGunplaKit(id: string, data: GunplaKitUpdate) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const { data: existingKit } = await supabase
    .from('gunpla_kits')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingKit || existingKit.user_id !== user.id) {
    throw new Error('Unauthorized')
  }

  const { data: kit, error } = await supabase
    .from('gunpla_kits')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath(`/edit/${id}`)
  return kit
}

export async function deleteGunplaKit(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const { data: existingKit } = await supabase
    .from('gunpla_kits')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingKit || existingKit.user_id !== user.id) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('gunpla_kits').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}

export async function getGunplaKits(filter?: 'owned' | 'wishlist') {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('gunpla_kits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filter === 'owned') {
    query = query.eq('owned', true)
  } else if (filter === 'wishlist') {
    query = query.eq('owned', false)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getGunplaKitById(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('gunpla_kits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
