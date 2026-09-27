export interface Template {
  id: string
  name: string
  bg: string
  font: string
  textColor: string
  dummyText: string
  isVip?: boolean
  vipBadge?: string
  vipIcon?: string
  vipTagline?: string
  cardBorder?: string
  accentGlow?: string
  categoryFit?: string[]
}

export const VIP_SPECIAL_TEMPLATES: Template[] = [
  {
    id: 'vip-birthday',
    name: 'Celebration Gala',
    bg: 'bg-gradient-to-br from-[#1C1304] via-[#0E0A02] to-[#2B1D06]',
    font: 'font-serif tracking-wide',
    textColor: 'text-[#FEF3C7] dark:text-[#FEF3C7]',
    cardBorder: 'border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.25)]',
    accentGlow: 'rgba(251,191,36,0.35)',
    isVip: true,
    vipBadge: '✦ CELEBRATION GALA ✦',
    vipIcon: '🎂',
    vipTagline: 'Luxury Champagne & Midnight Gold',
    categoryFit: ['celebration'],
    dummyText: 'Wishing the happiest 25th Birthday to my favorite human! May this year bring endless magic, health, and laughter.'
  },
  {
    id: 'vip-romance',
    name: 'Velvet Romance',
    bg: 'bg-gradient-to-br from-[#290714] via-[#140209] to-[#3B0A1D]',
    font: 'font-serif italic',
    textColor: 'text-[#FFE4E6] dark:text-[#FFE4E6]',
    cardBorder: 'border-rose-400/50 shadow-[0_0_40px_rgba(244,63,94,0.25)]',
    accentGlow: 'rgba(244,63,94,0.35)',
    isVip: true,
    vipBadge: '✦ LOVE DECLARATION ✦',
    vipIcon: '💖',
    vipTagline: 'Deep Midnight Rose & Starlight',
    categoryFit: ['love'],
    dummyText: 'To the love of my life: wherever the world takes us, you will always be my home and my greatest adventure.'
  },
  {
    id: 'vip-brand',
    name: 'Cyber Showcase',
    bg: 'bg-gradient-to-br from-[#031326] via-[#010914] to-[#06203D]',
    font: 'font-sans font-medium tracking-tight',
    textColor: 'text-[#E0F2FE] dark:text-[#E0F2FE]',
    cardBorder: 'border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.25)]',
    accentGlow: 'rgba(6,182,212,0.35)',
    isVip: true,
    vipBadge: '✦ OFFICIAL SHOWCASE ✦',
    vipIcon: '🚀',
    vipTagline: 'High-Tech Obsidian & Electric Cyan',
    categoryFit: ['promotion', 'announcement'],
    dummyText: 'We are officially live! Meet the next generation of creative tools built for dreamers, founders, and creators worldwide.'
  },
  {
    id: 'vip-wisdom',
    name: 'Timeless Heritage',
    bg: 'bg-gradient-to-br from-[#081C13] via-[#040D09] to-[#0E2C1E]',
    font: 'font-serif',
    textColor: 'text-[#ECFDF5] dark:text-[#ECFDF5]',
    cardBorder: 'border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    accentGlow: 'rgba(16,185,129,0.35)',
    isVip: true,
    vipBadge: '✦ WORDS OF WISDOM ✦',
    vipIcon: '📜',
    vipTagline: 'Gilded Antique & Emerald Forest',
    categoryFit: ['general', 'gratitude'],
    dummyText: 'The best time to plant a tree was twenty years ago. The second best time is right now. Never fear starting over.'
  },
  {
    id: 'vip-noir',
    name: 'Midnight Spotlight',
    bg: 'bg-gradient-to-b from-[#0C0B12] via-[#020204] to-[#0A0910]',
    font: 'font-mono',
    textColor: 'text-[#F3E8FF] dark:text-[#F3E8FF]',
    cardBorder: 'border-purple-400/50 shadow-[0_0_40px_rgba(168,85,247,0.25)]',
    accentGlow: 'rgba(168,85,247,0.35)',
    isVip: true,
    vipBadge: '✦ RAW SPOTLIGHT ✦',
    vipIcon: '🌙',
    vipTagline: 'OLED Obsidian & Velvet Amethyst',
    categoryFit: ['confession', 'rant'],
    dummyText: 'I have spent a lifetime waiting for permission that was never going to come. Today, I grant it to myself.'
  }
]

export const STANDARD_TEMPLATES: Template[] = [
  { id: "a", name: "Pure", bg: "bg-background", font: "font-sans font-normal", textColor: "text-primary", cardBorder: "border-primary/15 hover:border-primary/40", dummyText: "Sometimes the simplest words carry the most weight." },
  { id: "b", name: "Letter", bg: "bg-[#FDFBF7] dark:bg-[#1C1613]", font: "font-serif italic", textColor: "text-[#3D2C24] dark:text-[#F5EBE6]", cardBorder: "border-amber-900/15 dark:border-amber-500/25", dummyText: "My dearest friend, I've been meaning to tell you..." },
  { id: "c", name: "Spotlight", bg: "bg-[#F4F4F5] dark:bg-[#0E0E11]", font: "font-serif", textColor: "text-[#18181B] dark:text-[#F4F4F5]", cardBorder: "border-neutral-300 dark:border-neutral-800", dummyText: "In the center of it all, there is only you." },
  { id: "d", name: "Midnight", bg: "bg-[#EFF6FF] dark:bg-[#070D18]", font: "font-sans font-light", textColor: "text-[#1e3a5f] dark:text-[#bfdbfe]", cardBorder: "border-blue-200 dark:border-blue-900/40", dummyText: "Late night thoughts that keep me awake." },
  { id: "f", name: "Terminal", bg: "bg-[#EBF7EE] dark:bg-[#051109]", font: "font-mono", textColor: "text-[#064E22] dark:text-[#6ee7b7]", cardBorder: "border-emerald-300 dark:border-emerald-500/30", dummyText: "> print('Hello world');" },
  { id: "g", name: "Vintage", bg: "bg-[#F4ECD8] dark:bg-[#1E1914]", font: "font-serif", textColor: "text-[#3E2723] dark:text-[#EDE3D2]", cardBorder: "border-amber-900/20 dark:border-amber-500/25", dummyText: "A memory faded by time, but never forgotten." },
  { id: "h", name: "Cinematic", bg: "bg-neutral-100 dark:bg-black", font: "font-serif uppercase tracking-[0.2em]", textColor: "text-[#171717] dark:text-[#f5f5f5]", cardBorder: "border-neutral-300 dark:border-neutral-800", dummyText: "BASED ON A TRUE STORY." },
  { id: "i", name: "Pastel", bg: "bg-[#FFF1F2] dark:bg-[#200D13]", font: "font-sans font-light", textColor: "text-[#4c0519] dark:text-[#fecdd3]", cardBorder: "border-rose-200 dark:border-rose-900/40", dummyText: "Soft as a cloud, sweet as a dream." },
  { id: "j", name: "Newspaper", bg: "bg-[#ECE6D8] dark:bg-[#151517]", font: "font-serif text-justify", textColor: "text-[#1a1a1a] dark:text-[#e5e5e5]", cardBorder: "border-neutral-400 dark:border-neutral-700", dummyText: "EXTRA EXTRA! READ ALL ABOUT IT!" },
]

export const ALL_TEMPLATES: Template[] = [
  ...VIP_SPECIAL_TEMPLATES,
  ...STANDARD_TEMPLATES
]

export interface CategoryMeta {
  icon: string
  badgeLabel: string
  tagline: string
  placeholder: string
  starters: string[]
  accentColor: string
  gradientAccent: string
}

export const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  promotion: {
    icon: '🚀',
    badgeLabel: 'Brand Promotion & Showcase',
    tagline: 'Introduce your product, startup, agency, or craft to the global audience.',
    placeholder: 'What are you launching or sharing with the world? Tell your story, state your mission...',
    starters: [
      "Today we're officially launching to the world! Meet...",
      "Built with obsession for creators: introducing...",
      "After months of building in silence, our new project is live..."
    ],
    accentColor: '#06b6d4',
    gradientAccent: 'from-cyan-500/20 via-blue-500/10 to-transparent'
  },
  celebration: {
    icon: '🎂',
    badgeLabel: 'Birthday & Milestone',
    tagline: 'Honor a birthday, anniversary, sobriety milestone, or life-changing triumph.',
    placeholder: 'Whose birthday or milestone are we celebrating? Write your heartfelt wish...',
    starters: [
      "Happy 25th Birthday to my favorite human! May this year...",
      "Officially 1,000 days sober today. The sunrise is worth every single step.",
      "Happy 5th Anniversary! From our first coffee to today..."
    ],
    accentColor: '#f59e0b',
    gradientAccent: 'from-amber-500/20 via-yellow-500/10 to-transparent'
  },
  love: {
    icon: '💖',
    badgeLabel: 'Love Confession & Romance',
    tagline: 'Pour your heart out — secret confessions, vows, and whispers across distance.',
    placeholder: 'Who is this love letter for? What have you been holding in your heart...',
    starters: [
      "To the one who turned my quiet world into color: I love you.",
      "I have loved you in silence for four years, and tonight I want the world to know...",
      "Distance is just geography when someone means everything to you."
    ],
    accentColor: '#f43f5e',
    gradientAccent: 'from-rose-500/20 via-pink-500/10 to-transparent'
  },
  confession: {
    icon: '🤫',
    badgeLabel: 'Raw Secret & Confession',
    tagline: 'Unburden your soul with the words you have never dared say out loud.',
    placeholder: 'What truth are you carrying alone? The stage is safe and anonymous...',
    starters: [
      "Nobody in my real life knows this, but...",
      "I quit my corporate job today without a safety net, and I feel completely alive.",
      "I pretend to be tough so nobody worries, but truth is I'm just as scared."
    ],
    accentColor: '#a855f7',
    gradientAccent: 'from-purple-500/20 via-violet-500/10 to-transparent'
  },
  gratitude: {
    icon: '🙏',
    badgeLabel: 'Heartfelt Gratitude',
    tagline: 'Say thank you to someone who held your hand when medicine or words were not enough.',
    placeholder: 'Who changed your life? Say the thank-you that never got sent...',
    starters: [
      "To the stranger who helped me on the subway today: you saved my faith in people.",
      "Mom and Dad: this college degree is yours. Thank you for every sacrifice.",
      "Thank you for staying by my side when everyone else walked away."
    ],
    accentColor: '#14b8a6',
    gradientAccent: 'from-teal-500/20 via-emerald-500/10 to-transparent'
  },
  announcement: {
    icon: '📢',
    badgeLabel: 'Global Announcement',
    tagline: 'Broadcast important community news, public calls-to-action, or open letters.',
    placeholder: 'What does the world need to hear right now?',
    starters: [
      "Attention world: Starting today, remember to...",
      "Hosting a community clean-up this Saturday at 9 AM! Everyone welcome...",
      "An open letter to everyone feeling exhausted right now..."
    ],
    accentColor: '#3b82f6',
    gradientAccent: 'from-blue-500/20 via-indigo-500/10 to-transparent'
  },
  rant: {
    icon: '🔥',
    badgeLabel: 'Unfiltered Truth & Rant',
    tagline: 'Speak raw truth without sugarcoating. Let off steam.',
    placeholder: 'What is driving you mad? Speak your mind without apologies...',
    starters: [
      "Can we please normalize saying 'I don't have the energy for this' without feeling guilty?",
      "Stop giving advice to people who just need you to listen.",
      "Life is too short to stay in rooms where you have to shrink to fit in."
    ],
    accentColor: '#ef4444',
    gradientAccent: 'from-red-500/20 via-orange-500/10 to-transparent'
  },
  general: {
    icon: '📜',
    badgeLabel: 'Life Lessons & Wisdom',
    tagline: 'Timeless reflections, philosophy, and words to live by.',
    placeholder: 'What life lesson took you years to understand? Share your hard-earned wisdom...',
    starters: [
      "A hard lesson that took me 30 years to learn: peace is greater than being right.",
      "You don't have to figure out your whole life by tomorrow morning. Just take one step.",
      "The heaviest burdens we carry are the words we never had the courage to say."
    ],
    accentColor: '#8b5cf6',
    gradientAccent: 'from-violet-500/20 via-purple-500/10 to-transparent'
  }
}
