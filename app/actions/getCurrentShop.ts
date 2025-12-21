// lib/server/getCurrentShop.ts
'use server'

import { createClient } from '@/utils/supabase/server'

export async function getCurrentShop() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: shop } = await supabase
    .from('barber_shops')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!shop) throw new Error('Shop not found')

  return shop
}
