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
  // ── Creative Premium Templates ────────────────────────────────────────────
  {
    id: "k",
    name: "✦ Aurora",
    bg: "bg-[#0A0F1E] dark:bg-[#0A0F1E]",
    font: "font-playfair italic",
    textColor: "text-[#a5f3fc] dark:text-[#a5f3fc]",
    cardBorder: "border-cyan-400/40 shadow-[0_0_60px_rgba(103,232,249,0.15)]",
    dummyText: "Some nights, the sky writes poetry only the silent ones can read."
  },
  {
    id: "l",
    name: "⚡ Cyberpunk",
    bg: "bg-[#0D0D0D] dark:bg-[#0D0D0D]",
    font: "font-mono font-bold tracking-widest",
    textColor: "text-[#39FF14] dark:text-[#39FF14]",
    cardBorder: "border-[#39FF14]/50 shadow-[0_0_30px_rgba(57,255,20,0.2)]",
    dummyText: "SYSTEM OVERRIDE: YOUR TRUTH IS NOW BROADCASTING."
  },
  {
    id: "m",
    name: "🌅 Sunset",
    bg: "bg-[#1A0A00] dark:bg-[#1A0A00]",
    font: "font-cinzel tracking-wide",
    textColor: "text-[#FFA07A] dark:text-[#FFA07A]",
    cardBorder: "border-orange-400/40 shadow-[0_0_40px_rgba(255,160,122,0.15)]",
    dummyText: "Every sunset is a reminder that endings can be breathtakingly beautiful."
  },
  {
    id: "n",
    name: "🌌 Starlight",
    bg: "bg-[#05071A] dark:bg-[#05071A]",
    font: "font-outfit font-light tracking-wide",
    textColor: "text-[#E8DAFF] dark:text-[#E8DAFF]",
    cardBorder: "border-violet-400/30 shadow-[0_0_50px_rgba(167,139,250,0.12)]",
    dummyText: "In the vast silence between stars, your name is what I hear."
  },
  {
    id: "o",
    name: "🍃 Wabi-Sabi",
    bg: "bg-[#F5F0E8] dark:bg-[#1C1A15]",
    font: "font-playfair",
    textColor: "text-[#5C4A32] dark:text-[#D4B896]",
    cardBorder: "border-amber-800/20 dark:border-amber-600/25",
    dummyText: "There is profound beauty in impermanence — let it move you."
  },
  {
    id: "p",
    name: "💜 Amethyst",
    bg: "bg-[#1A0A2E] dark:bg-[#1A0A2E]",
    font: "font-caveat text-3xl",
    textColor: "text-[#E9D5FF] dark:text-[#E9D5FF]",
    cardBorder: "border-purple-400/40 shadow-[0_0_40px_rgba(168,85,247,0.2)]",
    dummyText: "Written at 3am, meant for someone the universe hasn't let me meet yet."
  },
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
      "We built this because the existing solutions were all broken. After 14 months in the dark, here's what we made...",
      "Just one person. One laptop. One obsessive idea. Today, it goes live.",
      "We're not disrupting an industry — we're just building the tool we wish had existed when we needed it most.",
      "Quietly launched to 5 users last Tuesday. We now have 12,000. This is what we built and why it matters.",
      "Two years ago I couldn't afford the software my competitors were using. So I built my own. It's yours now, for free.",
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
      "Three years ago today you almost didn't make it. Today you are 35 and absolutely unstoppable. Happy birthday, my warrior.",
      "1,461 days sober. Four years. I remember the night I thought I'd never see morning — I'm glad I was wrong.",
      "To my husband on our 10th anniversary: I'd choose the exact same Tuesday, the same coffee shop, the same nervous hello.",
      "She turns 7 today. Seven years of the most chaotic, beautiful, exhausting love I have ever known.",
      "We did it. After six rounds, three hospitals, and more prayers than I can count — she is officially cancer-free.",
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
      "I have rehearsed this sentence in my head for 847 days. I am in love with you. I'm done practicing.",
      "You asked why I look at you like that. It's because I've memorized the exact sound your laugh makes and I'd recognize it in any crowd.",
      "Seven time zones apart and somehow you're still the first person I want to tell everything to.",
      "I don't believe in love at first sight. I believe in love at 11:47pm when someone says exactly the right thing.",
      "To the person who made me stop believing I was too much — you're the first one who made me feel like just enough.",
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
      "I accepted the job offer. I told my family I was still deciding. The truth is I've already packed a box.",
      "I've been pretending to be okay for so long that some days I forget what not-okay even feels like anymore.",
      "Nobody at my office knows I have a degree from a top 5 university. I keep it quiet because the gap between who I was and who I am is too painful to explain.",
      "I drove past my old house last month. Sat outside for 40 minutes. Didn't knock. I still don't know what I would have said.",
      "The promotion I didn't get? I cried in a parking garage for 90 minutes, then went back inside and smiled through three more meetings.",
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
      "You sat with me in the hospital parking lot for three hours saying nothing. That silence was the kindest thing anyone has ever done for me.",
      "Dr. Ramirez — you told me the truth when every other doctor softened it. That honesty gave me six more months to prepare. I am endlessly grateful.",
      "To the woman at the shelter who let me take a second coat without saying a word — I think about you every winter.",
      "You read my first draft and you didn't lie. You told me it needed work, and then you showed me how. That is a rare kind of love.",
      "My parents gave up their retirement savings so I could finish school. They never once mentioned it. I found out last week, by accident.",
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
      "An open letter to every person who told a young woman she was 'too ambitious': she just got the corner office. I'd like you to explain yourselves.",
      "This Saturday, 9am, Riverside Park. We're cleaning it up ourselves because nobody else will. Bring gloves. Bring friends. Bring anyone.",
      "To the city council: we have sent 14 emails, filed 3 petitions, and attended 6 meetings. This is the last polite request.",
      "Reminder that kindness is not weakness. It takes more strength to be gentle in a harsh world than to go numb.",
      "Attention to every night-shift worker in this country: you are invisible to most people and essential to all of them. That is worth saying out loud.",
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
      "I am done performing happiness for people who have never once asked how I actually am.",
      "Hustle culture nearly killed me. I worked 80-hour weeks for three years building someone else's dream. I am not grateful for the 'experience.'",
      "The meeting that 'could have been an email' isn't a joke — it's a symptom of people using busyness to feel important.",
      "We romanticize suffering. We call it resilience. We call it grit. Sometimes it's just damage being passed off as strength.",
      "Stop telling burned-out people to 'practice self-care.' The problem isn't that they aren't taking enough bubble baths.",
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
      "At 40 I finally understood: the rooms you leave are sometimes the bravest thing you'll ever do.",
      "The kindest thing I ever did for my future self was to stop explaining myself to people who had already decided who I was.",
      "Nobody tells you that grief doesn't end — it just gets quieter. And some days the quiet is harder than the noise.",
      "Somewhere between 'I'll figure it out when I'm older' and being older, I realized nobody actually figures it out. We just get better at pretending.",
      "The advice I'd give my 23-year-old self: the people who make you feel like you need to earn their basic respect — leave.",
    ],
    accentColor: '#8b5cf6',
    gradientAccent: 'from-violet-500/20 via-purple-500/10 to-transparent'
  }
}
