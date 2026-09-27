'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  verifyAdminPassword, 
  getExpectedAdminToken, 
  ADMIN_COOKIE_CONFIG 
} from '@/lib/adminAuth'

export async function loginWithPassword(formData: FormData) {
  const password = formData.get('password') as string

  if (!password || !verifyAdminPassword(password)) {
    return { error: 'Invalid master access key. Access denied.' }
  }

  const token = await getExpectedAdminToken()
  const cookieStore = cookies()
  
  cookieStore.set(
    ADMIN_COOKIE_CONFIG.name,
    token,
    ADMIN_COOKIE_CONFIG.options
  )

  return { success: true }
}

export async function logoutAdmin() {
  const cookieStore = cookies()
  cookieStore.delete(ADMIN_COOKIE_CONFIG.name)
  redirect('/admin/login')
}
