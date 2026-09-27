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
  realtime: {
    transport: DummyWS
  }
})

const ACTIVE_SPONSORED = [
  {
    category_id: 'ce92c0e4-2b74-4ccb-859e-67ef2bae34a0', // Love
    template_id: 'b',
    content: "To anyone feeling invisible tonight: you are loved beyond measure, even by strangers you haven't met yet.",
    status: 'ACTIVE',
    bid_amount: 1.00,
    is_reserved_slot: false,
    actual_start: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#FDFBF7] dark:bg-[#1C1613]",
      font: "font-serif italic",
      textColor: "text-[#3D2C24] dark:text-[#F5EBE6]",
      durationSecs: 1800,
      sponsorName: "Elena R.",
      sponsorNote: "For anyone fighting quietly in the dark 💛"
    }
  },
  {
    category_id: 'c6e7f640-fdbf-4247-a731-98e704b0b39a', // Gratitude
    template_id: 'c',
    content: "A kind stranger on the 7 train returned my sketchbook today. You saved three years of memories. Thank you, New York.",
    status: 'ACTIVE',
    bid_amount: 1.00,
    is_reserved_slot: false,
    actual_start: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
      font: "font-serif",
      textColor: "text-[#18181B] dark:text-[#F4F4F5]",
      durationSecs: 1800,
      sponsorName: "Anonymous Artist",
      sponsorNote: "Artists supporting artists across borders 🎨"
    }
  },
  {
    category_id: '74edbc70-3fb5-405a-9000-6e9e3ef4d87b', // Celebration
    template_id: 'a',
    content: "Officially 1,000 days sober today. For anyone still fighting in the dark, the sunrise is worth every single step.",
    status: 'ACTIVE',
    bid_amount: 1.00,
    is_reserved_slot: false,
    actual_start: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-background",
      font: "font-sans font-normal",
      textColor: "text-primary",
      durationSecs: 1800,
      sponsorName: "Recovery Collective",
      sponsorNote: "One day at a time. Keep going! 🌅"
    }
  },
  {
    category_id: '476e47b1-5de5-42fa-85e2-6428fd8ab587', // Confession
    template_id: 'd',
    content: "I quit my corporate job this morning to open a neighborhood bookstore. I am terrified, but I have never felt more alive.",
    status: 'ACTIVE',
    bid_amount: 1.00,
    is_reserved_slot: false,
    actual_start: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#EFF6FF] dark:bg-[#070D18]",
      font: "font-sans font-light",
      textColor: "text-blue-950 dark:text-blue-100",
      durationSecs: 1800,
      sponsorName: "Corner Books Brooklyn",
      sponsorNote: "Take the leap of faith! 📚"
    }
  },
  {
    category_id: '0f21734e-e0f1-4809-822d-5b46eee306de', // General
    template_id: 'i',
    content: "Remember: breathe. You don't have to figure out the whole rest of your life by tomorrow morning. Just take the next small step.",
    status: 'ACTIVE',
    bid_amount: 1.00,
    is_reserved_slot: false,
    actual_start: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#FFF1F2] dark:bg-[#200D13]",
      font: "font-sans font-light",
      textColor: "text-rose-950 dark:text-rose-200",
      durationSecs: 1800,
      sponsorName: "Mindful Living",
      sponsorNote: "Pause, breathe, and be kind to yourself."
    }
  },
  {
    category_id: '6f8887bf-9091-4698-957a-2a69d5f32b85', // Announcement
    template_id: 'f',
    content: "Community garden clean-up in Kyoto this Saturday at 9 AM! Bring seeds, stories, and warm tea. Everyone is welcome.",
    status: 'ACTIVE',
    bid_amount: 1.00,
    is_reserved_slot: false,
    actual_start: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#EBF7EE] dark:bg-[#051109]",
      font: "font-mono",
      textColor: "text-[#064E22] dark:text-emerald-400",
      durationSecs: 1800,
      sponsorName: "Kyoto Green Initiative",
      sponsorNote: "Connecting neighborhoods through nature 🌿"
    }
  },
  {
    category_id: '277ce665-6d31-4181-b1a3-65b9e687bd50', // Rant
    template_id: 'h',
    content: "Can we please normalize saying 'I don't have the energy for this right now' without feeling guilty? Protect your peace.",
    status: 'ACTIVE',
    bid_amount: 1.00,
    is_reserved_slot: false,
    actual_start: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-neutral-100 dark:bg-black",
      font: "font-serif uppercase tracking-[0.2em]",
      textColor: "text-neutral-900 dark:text-white/95",
      durationSecs: 1800,
      sponsorName: "Night Owl Dev",
      sponsorNote: "Protect your peace and get some rest! ☕"
    }
  }
]

const WAITING_SPONSORED = [
  {
    category_id: '476e47b1-5de5-42fa-85e2-6428fd8ab587', // Confession
    template_id: 'b',
    content: "I pretend to be confident around my younger siblings so they don't lose hope, but truth is I'm just as scared as they are.",
    status: 'PENDING_PAYMENT',
    bid_amount: 1.00,
    is_reserved_slot: false,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#FDFBF7] dark:bg-[#1C1613]",
      font: "font-serif italic",
      textColor: "text-[#3D2C24] dark:text-[#F5EBE6]",
      durationSecs: 1800
    }
  },
  {
    category_id: 'ce92c0e4-2b74-4ccb-859e-67ef2bae34a0', // Love
    template_id: 'a',
    content: "Eight years ago you chose me, and every single morning since then, I still wake up feeling like the luckiest soul on earth.",
    status: 'PENDING_PAYMENT',
    bid_amount: 1.00,
    is_reserved_slot: false,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-background",
      font: "font-sans font-normal",
      textColor: "text-primary",
      durationSecs: 1800
    }
  },
  {
    category_id: 'c6e7f640-fdbf-4247-a731-98e704b0b39a', // Gratitude
    template_id: 'c',
    content: "To the oncology nurse who held my hand during chemotherapy round four: your warmth kept me breathing when medicine wasn't enough.",
    status: 'PENDING_PAYMENT',
    bid_amount: 1.00,
    is_reserved_slot: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]",
      font: "font-serif",
      textColor: "text-[#18181B] dark:text-[#F4F4F5]",
      durationSecs: 1800
    }
  },
  {
    category_id: '74edbc70-3fb5-405a-9000-6e9e3ef4d87b', // Celebration
    template_id: 'j',
    content: "First in my entire family to graduate college! This diploma belongs to my immigrant parents who worked three shifts so I could study.",
    status: 'PENDING_PAYMENT',
    bid_amount: 1.00,
    is_reserved_slot: false,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    style_config: {
      bg: "bg-[#ECE6D8] dark:bg-[#151517]",
      font: "font-serif text-justify",
      textColor: "text-neutral-900 dark:text-neutral-100",
      durationSecs: 1800
    }
  }
]

async function seed() {
  console.log('Cleaning up existing 1.00 sponsored messages...')
  await supabase.from('messages').delete().eq('bid_amount', 1.00)

  console.log('Seeding 7 active sponsored messages...')
  const { data: activeData, error: activeErr } = await supabase
    .from('messages')
    .insert(ACTIVE_SPONSORED)
    .select('id, content')

  if (activeErr) {
    console.error('Error inserting active sponsored:', activeErr)
    process.exit(1)
  }
  console.log(`Successfully inserted ${activeData.length} active sponsored messages.`)

  console.log('Seeding 4 waiting-room messages...')
  const { data: waitingData, error: waitingErr } = await supabase
    .from('messages')
    .insert(WAITING_SPONSORED)
    .select('id, content')

  if (waitingErr) {
    console.error('Error inserting waiting messages:', waitingErr)
    process.exit(1)
  }
  console.log(`Successfully inserted ${waitingData.length} in-waiting messages.`)

  console.log('Done! All sample data seeded successfully.')
}

seed()
