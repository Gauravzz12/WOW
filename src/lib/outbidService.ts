import { createClient } from '@supabase/supabase-js'
import { sendOutbidEmail } from './email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkAndNotifyOutbids(newBidAmount: number) {
  // Find queued normal messages whose bid is lower than the new bid,
  // and who have a reminder_email set.
  const { data: outbidMessages } = await supabaseAdmin
    .from('messages')
    .select('id, content, bid_amount, reminder_email')
    .eq('status', 'QUEUED')
    .eq('is_reserved_slot', false)
    .lt('bid_amount', newBidAmount)
    .not('reminder_email', 'is', null)
    .order('bid_amount', { ascending: false })

  if (!outbidMessages || outbidMessages.length === 0) return

  // Calculate their new ranks.
  // We need to know their exact rank, which is the number of queued messages with bid >= their bid.
  for (const msg of outbidMessages) {
    const { count } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'QUEUED')
      .eq('is_reserved_slot', false)
      .gte('bid_amount', msg.bid_amount)
    
    if (count !== null) {
      // They just dropped in rank, send email
      await sendOutbidEmail(msg.reminder_email, msg.content, count, msg.id)
    }
  }
}
