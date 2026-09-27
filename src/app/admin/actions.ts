'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSessionToken, ADMIN_COOKIE_CONFIG } from '@/lib/adminAuth'
import { runQueueAdvance } from '@/lib/queueAdvance'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function assertAdmin() {
  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_COOKIE_CONFIG.name)?.value
  const isValid = await verifyAdminSessionToken(token)
  if (!isValid) {
    throw new Error('Unauthorized: Admin access required')
  }
}

export async function removeMessage(messageId: string) {
  try {
    await assertAdmin()
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' }
  }

  const { error } = await supabaseAdmin
    .from('messages')
    .update({ status: 'REMOVED' })
    .eq('id', messageId)

  if (error) {
    return { error: error.message }
  }

  // Immediately advance queue so the next queued message is displayed!
  await runQueueAdvance()

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function updateCategoryDuration(categoryId: string, formData: FormData) {
  try {
    await assertAdmin()
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' }
  }

  const baseDuration = Number(formData.get('base_duration'))
  const maxDuration = Number(formData.get('max_duration'))

  if (!baseDuration || !maxDuration) {
    return { error: 'Invalid durations' }
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .update({ 
      base_duration: baseDuration,
      max_duration: maxDuration 
    })
    .eq('id', categoryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
