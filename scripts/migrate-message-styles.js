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

const CANONICAL_TEMPLATES = {
  'a': {
    bg: 'bg-background',
    textColor: 'text-primary'
  },
  'b': {
    bg: 'bg-[#FDFBF7] dark:bg-[#1C1613]',
    textColor: 'text-[#3D2C24] dark:text-[#F5EBE6]'
  },
  'c': {
    bg: 'bg-[#F4F4F5] dark:bg-[#0E0E11]',
    textColor: 'text-[#18181B] dark:text-[#F4F4F5]'
  },
  'd': {
    bg: 'bg-[#EFF6FF] dark:bg-[#070D18]',
    textColor: 'text-blue-950 dark:text-blue-100'
  },
  'f': {
    bg: 'bg-[#EBF7EE] dark:bg-[#051109]',
    textColor: 'text-[#064E22] dark:text-emerald-400'
  },
  'g': {
    bg: 'bg-[#F4ECD8] dark:bg-[#1E1914]',
    textColor: 'text-[#3E2723] dark:text-[#EDE3D2]'
  },
  'h': {
    bg: 'bg-neutral-100 dark:bg-black',
    textColor: 'text-neutral-900 dark:text-white/95'
  },
  'i': {
    bg: 'bg-[#FFF1F2] dark:bg-[#200D13]',
    textColor: 'text-rose-950 dark:text-rose-200'
  },
  'j': {
    bg: 'bg-[#ECE6D8] dark:bg-[#151517]',
    textColor: 'text-neutral-900 dark:text-neutral-100'
  },
  'vip-birthday': {
    bg: 'bg-gradient-to-br from-[#1C1304] via-[#0E0A02] to-[#2B1D06]',
    textColor: 'text-[#FEF3C7] dark:text-[#FEF3C7]'
  },
  'vip-romance': {
    bg: 'bg-gradient-to-br from-[#290714] via-[#140209] to-[#3B0A1D]',
    textColor: 'text-[#FFE4E6] dark:text-[#FFE4E6]'
  },
  'vip-brand': {
    bg: 'bg-gradient-to-br from-[#031326] via-[#010914] to-[#06203D]',
    textColor: 'text-[#E0F2FE] dark:text-[#E0F2FE]'
  },
  'vip-wisdom': {
    bg: 'bg-gradient-to-br from-[#081C13] via-[#040D09] to-[#0E2C1E]',
    textColor: 'text-[#ECFDF5] dark:text-[#ECFDF5]'
  },
  'vip-noir': {
    bg: 'bg-gradient-to-b from-[#0C0B12] via-[#020204] to-[#0A0910]',
    textColor: 'text-[#F3E8FF] dark:text-[#F3E8FF]'
  }
}

async function migrate() {
  console.log('Fetching all messages from Supabase...')
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, template_id, style_config')

  if (error) {
    console.error('Failed to fetch messages:', error)
    process.exit(1)
  }

  console.log(`Found ${messages.length} messages to inspect.`)
  let updatedCount = 0

  for (const msg of messages) {
    let cfg = msg.style_config || {}
    if (typeof cfg === 'string') {
      try { cfg = JSON.parse(cfg) } catch { cfg = {} }
    }

    const tid = msg.template_id || cfg.templateId
    let targetBg = cfg.bg
    let targetTextColor = cfg.textColor

    if (tid && CANONICAL_TEMPLATES[tid]) {
      targetBg = CANONICAL_TEMPLATES[tid].bg
      targetTextColor = CANONICAL_TEMPLATES[tid].textColor
    } else {
      // Check bg patterns
      const curBg = cfg.bg || ''
      if (curBg.includes('#FDFBF7')) {
        targetBg = CANONICAL_TEMPLATES['b'].bg
        targetTextColor = CANONICAL_TEMPLATES['b'].textColor
      } else if (curBg.includes('#F4F4F5')) {
        targetBg = CANONICAL_TEMPLATES['c'].bg
        targetTextColor = CANONICAL_TEMPLATES['c'].textColor
      } else if (curBg.includes('#EFF6FF')) {
        targetBg = CANONICAL_TEMPLATES['d'].bg
        targetTextColor = CANONICAL_TEMPLATES['d'].textColor
      } else if (curBg.includes('emerald')) {
        targetBg = CANONICAL_TEMPLATES['f'].bg
        targetTextColor = CANONICAL_TEMPLATES['f'].textColor
      } else if (curBg.includes('#F4ECD8')) {
        targetBg = CANONICAL_TEMPLATES['g'].bg
        targetTextColor = CANONICAL_TEMPLATES['g'].textColor
      } else if (curBg.includes('neutral-100')) {
        targetBg = CANONICAL_TEMPLATES['h'].bg
        targetTextColor = CANONICAL_TEMPLATES['h'].textColor
      } else if (curBg.includes('#FFF1F2')) {
        targetBg = CANONICAL_TEMPLATES['i'].bg
        targetTextColor = CANONICAL_TEMPLATES['i'].textColor
      } else if (curBg.includes('#ECE6D8')) {
        targetBg = CANONICAL_TEMPLATES['j'].bg
        targetTextColor = CANONICAL_TEMPLATES['j'].textColor
      }
    }

    if (targetBg !== cfg.bg || targetTextColor !== cfg.textColor) {
      const newConfig = {
        ...cfg,
        bg: targetBg,
        textColor: targetTextColor
      }

      const { error: updateErr } = await supabase
        .from('messages')
        .update({ style_config: newConfig })
        .eq('id', msg.id)

      if (updateErr) {
        console.error(`Failed to update msg ${msg.id}:`, updateErr)
      } else {
        updatedCount++
      }
    }
  }

  console.log(`Successfully migrated ${updatedCount} message styles to dual-theme!`)
}

migrate()
