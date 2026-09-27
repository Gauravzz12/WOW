'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Admin-only logout action — used by the sidebar UserMenu when an admin session exists
export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
