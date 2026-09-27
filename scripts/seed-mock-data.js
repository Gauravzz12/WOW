const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

class DummyWS {
  constructor() {}
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  realtime: { transport: DummyWS }
})

async function seed() {
  console.log('--- Seeding mock data for all tabs ---')

  // 1. Fetch categories
  const { data: categories, error: catError } = await supabase.from('categories').select('id, slug, name')
  if (catError || !categories) {
    console.error('Failed to fetch categories:', catError)
    process.exit(1)
  }

  const catMap = {}
  categories.forEach(c => {
    catMap[c.slug] = c.id
  })

  // 2. Mark any previously active messages as COMPLETED to avoid conflicts
  await supabase
    .from('messages')
    .update({ status: 'COMPLETED', actual_end: new Date().toISOString() })
    .in('status', ['ACTIVE', 'QUEUED', 'PENDING_PAYMENT'])

  const now = Date.now()
  const recentStart = new Date(now - 10 * 60 * 1000).toISOString() // 10 mins ago

  // 3. NORMAL TAB
  // Active Normal Message (on stage)
  const activeNormal = {
    category_id: catMap['celebration'] || categories[0].id,
    template_id: 'b',
    content: "To anyone doubting themselves right now: every master was once a beginner, and every storm eventually runs out of rain. Keep going.",
    status: 'ACTIVE',
    bid_amount: 35.00,
    is_reserved_slot: false,
    actual_start: recentStart,
    style_config: {
      bg: "bg-[#FDFBF7] dark:bg-[#1C1613]",
      font: "font-serif italic",
      textColor: "text-[#3D2C24] dark:text-[#F5EBE6]",
      cardBorder: "border-amber-900/15 dark:border-amber-500/25",
      durationSecs: 7200
    }
  }

  // Normal Queue (Priority Queue items)
  const normalQueue = [
    {
      category_id: catMap['gratitude'] || categories[0].id,
      template_id: 'c',
      content: "To the stranger on the subway who handed me a tissue when I was silently weeping: you gave me the strength to make it through that week.",
      status: 'QUEUED',
      bid_amount: 28.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
        font: "font-serif",
        textColor: "text-[#18181B] dark:text-[#F4F4F5]",
        cardBorder: "border-neutral-300 dark:border-neutral-800"
      }
    },
    {
      category_id: catMap['love'] || categories[0].id,
      template_id: 'b',
      content: "Happy 4th Anniversary, Maya. In a world full of noise, your laugh is the only song I ever want on repeat.",
      status: 'QUEUED',
      bid_amount: 20.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-[#FDFBF7] dark:bg-[#1C1613]",
        font: "font-serif italic",
        textColor: "text-[#3D2C24] dark:text-[#F5EBE6]"
      }
    },
    {
      category_id: catMap['announcement'] || categories[0].id,
      template_id: 'd',
      content: "We just open-sourced our climate dataset. Over 50 million data points free forever for researchers worldwide.",
      status: 'QUEUED',
      bid_amount: 14.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-[#EFF6FF] dark:bg-[#070D18]",
        font: "font-sans font-light",
        textColor: "text-[#1e3a5f] dark:text-[#bfdbfe]"
      }
    },
    {
      category_id: catMap['confession'] || categories[0].id,
      template_id: 'a',
      content: "I told everyone I love living alone in the city, but truth is, I leave the radio on just to feel like someone is home.",
      status: 'QUEUED',
      bid_amount: 8.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-background",
        font: "font-serif italic",
        textColor: "text-primary"
      }
    },
    {
      category_id: catMap['general'] || categories[0].id,
      template_id: 'c',
      content: "Never trade your inner peace for anyone else's expectations. Your pace is your own.",
      status: 'QUEUED',
      bid_amount: 4.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
        font: "font-sans font-normal",
        textColor: "text-[#18181B] dark:text-[#F4F4F5]"
      }
    }
  ]

  // 4. SPECIAL TAB (VIP - FIXED 3-HOUR SLOTS ON GLOBAL UTC MASTER CLOCK)
  // Align mock special messages strictly to the 8 standard universal UTC 3-hour slots
  const nowUtc = new Date()
  const currentUtcSlotHour = Math.floor(nowUtc.getUTCHours() / 3) * 3
  const activeSlotStart = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate(), currentUtcSlotHour, 0, 0, 0))
  const activeSlotEnd = new Date(activeSlotStart.getTime() + 3 * 3600 * 1000)

  const queueSlot1Start = new Date(activeSlotEnd)
  const queueSlot1End = new Date(queueSlot1Start.getTime() + 3 * 3600 * 1000)

  const queueSlot2Start = new Date(queueSlot1End)
  const queueSlot2End = new Date(queueSlot2Start.getTime() + 3 * 3600 * 1000)

  const queueSlot3Start = new Date(queueSlot2End)
  const queueSlot3End = new Date(queueSlot3Start.getTime() + 3 * 3600 * 1000)

  // Active Special Message (on stage)
  const activeSpecial = {
    category_id: catMap['love'] || categories[0].id,
    template_id: 'vip-romance',
    content: "To Sophia: from our first coffee in Paris to ten years and three continents later. You are my home, my anchor, and my greatest adventure.",
    status: 'ACTIVE',
    bid_amount: 30.00,
    is_reserved_slot: true,
    actual_start: activeSlotStart.toISOString(),
    scheduled_start: activeSlotStart.toISOString(),
    scheduled_end: activeSlotEnd.toISOString(),
    style_config: {
      bg: "bg-gradient-to-br from-[#290714] via-[#140209] to-[#3B0A1D]",
      font: "font-serif italic",
      textColor: "text-[#FFE4E6] dark:text-[#FFE4E6]",
      cardBorder: "border-rose-400/50 shadow-[0_0_40px_rgba(244,63,94,0.25)]",
      accentGlow: "rgba(244,63,94,0.35)",
      isVip: true,
      vipBadge: "✦ LOVE DECLARATION ✦",
      vipIcon: "💖",
      vipTagline: "Deep Midnight Rose & Starlight",
      durationSecs: 10800
    }
  }

  // Special Queue (Fixed 3-Hour Time Slots)
  const specialQueue = [
    {
      category_id: catMap['celebration'] || categories[0].id,
      template_id: 'vip-birthday',
      content: "Happy 30th Birthday Leo! The entire London studio is raising a glass to you tonight. Here's to your next chapter!",
      status: 'QUEUED',
      bid_amount: 30.00,
      is_reserved_slot: true,
      scheduled_start: queueSlot1Start.toISOString(),
      scheduled_end: queueSlot1End.toISOString(),
      style_config: {
        bg: "bg-gradient-to-br from-[#1C1304] via-[#0E0A02] to-[#2B1D06]",
        font: "font-serif tracking-wide",
        textColor: "text-[#FEF3C7] dark:text-[#FEF3C7]",
        cardBorder: "border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.25)]",
        accentGlow: "rgba(251,191,36,0.35)",
        isVip: true,
        vipBadge: "✦ CELEBRATION GALA ✦",
        vipIcon: "🎂",
        durationSecs: 10800
      }
    },
    {
      category_id: catMap['promotion'] || categories[0].id,
      template_id: 'vip-brand',
      content: "Introducing Project Aurora: Next-generation distributed AI tools designed for creators. Public beta opens tonight.",
      status: 'QUEUED',
      bid_amount: 30.00,
      is_reserved_slot: true,
      scheduled_start: queueSlot2Start.toISOString(),
      scheduled_end: queueSlot2End.toISOString(),
      style_config: {
        bg: "bg-gradient-to-br from-[#031326] via-[#010914] to-[#06203D]",
        font: "font-sans font-medium tracking-tight",
        textColor: "text-[#E0F2FE] dark:text-[#E0F2FE]",
        cardBorder: "border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.25)]",
        accentGlow: "rgba(6,182,212,0.35)",
        isVip: true,
        vipBadge: "✦ OFFICIAL SHOWCASE ✦",
        vipIcon: "🚀",
        brandName: "Project Aurora",
        brandUrl: "https://aurora.dev",
        durationSecs: 10800
      }
    },
    {
      category_id: catMap['gratitude'] || categories[0].id,
      template_id: 'vip-wisdom',
      content: "In memory of Professor Eleanor Vance (1942–2025). Thank you for teaching thousands of students how to look at the stars with wonder.",
      status: 'QUEUED',
      bid_amount: 30.00,
      is_reserved_slot: true,
      scheduled_start: queueSlot3Start.toISOString(),
      scheduled_end: queueSlot3End.toISOString(),
      style_config: {
        bg: "bg-gradient-to-br from-[#081C13] via-[#040D09] to-[#0E2C1E]",
        font: "font-serif",
        textColor: "text-[#ECFDF5] dark:text-[#ECFDF5]",
        cardBorder: "border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.25)]",
        accentGlow: "rgba(16,185,129,0.35)",
        isVip: true,
        vipBadge: "✦ WORDS OF WISDOM ✦",
        vipIcon: "📜",
        durationSecs: 10800
      }
    }
  ]

  // 5. SPONSORED TAB
  // Active Sponsored Messages (on stage in grid)
  const activeSponsored = [
    {
      category_id: catMap['love'] || categories[0].id,
      template_id: 'b',
      content: "To anyone feeling invisible tonight: you are loved beyond measure, even by strangers you haven't met yet.",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-[#FDFBF7] dark:bg-[#1C1613]",
        font: "font-serif italic",
        textColor: "text-[#3D2C24] dark:text-[#F5EBE6]",
        durationSecs: 7200,
        sponsorName: "Elena R.",
        sponsorNote: "For anyone fighting in the dark: never lose hope, sunrise is coming 💛"
      }
    },
    {
      category_id: catMap['gratitude'] || categories[0].id,
      template_id: 'c',
      content: "A kind stranger on the 7 train returned my sketchbook today. You saved three years of memories. Thank you, New York.",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
        font: "font-serif",
        textColor: "text-[#18181B] dark:text-[#F4F4F5]",
        durationSecs: 7200,
        sponsorName: "Anonymous Artist",
        sponsorNote: "Artists supporting artists across the world. Keep creating your boldest vision 🎨"
      }
    },
    {
      category_id: catMap['celebration'] || categories[0].id,
      template_id: 'a',
      content: "Officially 1,000 days sober today. For anyone still fighting in the dark, the sunrise is worth every single step.",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-background",
        font: "font-sans font-normal",
        textColor: "text-primary",
        durationSecs: 7200,
        sponsorName: "Recovery Collective",
        sponsorNote: "One day at a time. Every small step forward is a victory 🌅"
      }
    },
    {
      category_id: catMap['confession'] || categories[0].id,
      template_id: 'd',
      content: "I quit my corporate job this morning to open a neighborhood bookstore. I am terrified, but I have never felt more alive.",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-[#EFF6FF] dark:bg-[#070D18]",
        font: "font-sans font-light",
        textColor: "text-blue-950 dark:text-blue-100",
        durationSecs: 7200,
        sponsorName: "Corner Books Brooklyn",
        sponsorNote: "Take the leap of faith! The best chapters of life lie ahead 📚",
        brandName: "Corner Books",
        brandUrl: "https://cornerbooks.nyc"
      }
    },
    {
      category_id: catMap['general'] || categories[0].id,
      template_id: 'c',
      content: "Remember: breathe. You don't have to figure out the whole rest of your life by tomorrow morning. Just take the next small step.",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
        font: "font-serif italic",
        textColor: "text-[#18181B] dark:text-[#F4F4F5]",
        durationSecs: 7200,
        sponsorName: "Mindful Living",
        sponsorNote: "Remember to pause and breathe. You are doing better than you know ✨"
      }
    },
    {
      category_id: catMap['announcement'] || categories[0].id,
      template_id: 'f',
      content: "Free community coding workshop this Saturday at Central Library. All ages and absolute beginners welcome!",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-[#EBF7EE] dark:bg-[#051109]",
        font: "font-mono",
        textColor: "text-[#064E22] dark:text-[#6ee7b7]",
        durationSecs: 7200,
        sponsorName: "Tech For Everyone",
        sponsorNote: "Free workshops every Saturday. Technology and coding are for every curious mind 💻"
      }
    },
    {
      category_id: catMap['rant'] || categories[0].id,
      template_id: 'c',
      content: "Stop replying 'per my last email' when you never answered the actual question in the first place!",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
        font: "font-sans font-semibold",
        textColor: "text-[#18181B] dark:text-[#F4F4F5]",
        durationSecs: 7200,
        sponsorName: "Office Coffee Club",
        sponsorNote: "Dedicated to honest conversations, good coffee, and true collaboration every single day ☕"
      }
    },
    {
      category_id: catMap['love'] || categories[0].id,
      template_id: 'b',
      content: "Mom, finishing medical school today. Everything I am, I learned from watching you work three jobs with a smile.",
      status: 'ACTIVE',
      bid_amount: 1.00,
      is_reserved_slot: false,
      actual_start: recentStart,
      style_config: {
        bg: "bg-[#FDFBF7] dark:bg-[#1C1613]",
        font: "font-serif italic",
        textColor: "text-[#3D2C24] dark:text-[#F5EBE6]",
        durationSecs: 7200,
        sponsorName: "Dr. Marcus Chen",
        sponsorNote: "Dedicated with deep gratitude to immigrant parents working tirelessly for their children 🩺"
      }
    }
  ]

  // Sponsored Queue (Waiting Room awaiting sponsorship)
  const waitingRoomQueue = [
    {
      category_id: catMap['celebration'] || categories[0].id,
      template_id: 'a',
      content: "Our rescue shelter in Austin just celebrated 500 successful adoptions this year! Thank you to every foster family.",
      status: 'PENDING_PAYMENT',
      bid_amount: 1.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-background",
        font: "font-sans",
        textColor: "text-primary"
      }
    },
    {
      category_id: catMap['gratitude'] || categories[0].id,
      template_id: 'c',
      content: "Thank you to the night shift emergency workers, nurses, and transit drivers who keep humanity safe while we sleep.",
      status: 'PENDING_PAYMENT',
      bid_amount: 1.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
        font: "font-serif",
        textColor: "text-[#18181B] dark:text-[#F4F4F5]"
      }
    },
    {
      category_id: catMap['confession'] || categories[0].id,
      template_id: 'b',
      content: "I finally apologized to my brother after 7 years of stubborn silence. It took 3 minutes and lifted a thousand pounds off my chest.",
      status: 'PENDING_PAYMENT',
      bid_amount: 1.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-[#FDFBF7] dark:bg-[#1C1613]",
        font: "font-serif italic",
        textColor: "text-[#3D2C24] dark:text-[#F5EBE6]"
      }
    },
    {
      category_id: catMap['general'] || categories[0].id,
      template_id: 'a',
      content: "The courage to be yourself in a world that tries to make you like everyone else is the hardest battle you will ever fight.",
      status: 'PENDING_PAYMENT',
      bid_amount: 1.00,
      is_reserved_slot: false,
      style_config: {
        bg: "bg-background",
        font: "font-sans",
        textColor: "text-primary"
      }
    }
  ]

  // Combine and insert all messages
  const allMessages = [
    activeNormal,
    ...normalQueue,
    activeSpecial,
    ...specialQueue,
    ...activeSponsored,
    ...waitingRoomQueue
  ]

  console.log(`Inserting ${allMessages.length} total messages across Normal, Special, and Sponsored...`)

  const { data: inserted, error: insertError } = await supabase
    .from('messages')
    .insert(allMessages)
    .select('id, content, status, is_reserved_slot, bid_amount')

  if (insertError) {
    console.error('Insert error:', insertError)
    process.exit(1)
  }

  console.log(`Successfully inserted ${inserted.length} messages!`)

  // Reset and sync reserved_slots for the seeded special messages
  const specialMsgs = inserted.filter(m => m.is_reserved_slot)
  const activeSpecialMsg = specialMsgs.find(m => m.status === 'ACTIVE')
  const queuedSpecialMsgs = specialMsgs.filter(m => m.status === 'QUEUED')

  // Clear previous reserved slots
  await supabase.from('reserved_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const reservedSlotsToSeed = [
    {
      scheduled_start: activeSlotStart.toISOString(),
      scheduled_end: activeSlotEnd.toISOString(),
      status: 'BOOKED',
      bid_amount: 30,
      message_id: activeSpecialMsg?.id
    },
    {
      scheduled_start: queueSlot1Start.toISOString(),
      scheduled_end: queueSlot1End.toISOString(),
      status: 'BOOKED',
      bid_amount: 30,
      message_id: queuedSpecialMsgs[0]?.id
    },
    {
      scheduled_start: queueSlot2Start.toISOString(),
      scheduled_end: queueSlot2End.toISOString(),
      status: 'BOOKED',
      bid_amount: 30,
      message_id: queuedSpecialMsgs[1]?.id
    },
    {
      scheduled_start: queueSlot3Start.toISOString(),
      scheduled_end: queueSlot3End.toISOString(),
      status: 'BOOKED',
      bid_amount: 30,
      message_id: queuedSpecialMsgs[2]?.id
    }
  ]

  const { error: slotSeedError } = await supabase.from('reserved_slots').insert(reservedSlotsToSeed)
  if (slotSeedError) {
    console.warn('Notice: reserved_slots sync warning:', slotSeedError.message)
  } else {
    console.log(`✓ Synchronized ${reservedSlotsToSeed.length} booked UTC slots in reserved_slots`)
  }

  // Log breakdown
  console.log('✓ Normal Active:', 1)
  console.log('✓ Normal Queue:', normalQueue.length)
  console.log('✓ Special Active:', 1)
  console.log('✓ Special Queue:', specialQueue.length)
  console.log('✓ Sponsored Active:', activeSponsored.length)
  console.log('✓ Sponsored Waiting Room Queue:', waitingRoomQueue.length)
  console.log('--- Mock data seed complete! ---')
}

seed().catch(err => {
  console.error('Unexpected error during seed:', err)
  process.exit(1)
})
