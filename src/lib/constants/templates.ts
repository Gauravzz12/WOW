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
  categoryFit?: string[]
  /** A subtle accent line/dot color to visually distinguish templates at a glance */
  accent?: string
}

export const VIP_SPECIAL_TEMPLATES: Template[] = [
  {
    id: 'vip-birthday',
    name: 'Celebration Gala',
    bg: 'bg-[#FFF8E7] dark:bg-[#1C1304]',
    font: 'font-serif tracking-wide',
    textColor: 'text-[#5C3D00] dark:text-[#FEF3C7]',
    cardBorder: 'border-amber-400/50',
    accent: 'bg-amber-400',
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
    bg: 'bg-[#FFF0F3] dark:bg-[#290714]',
    font: 'font-serif italic',
    textColor: 'text-[#6B0F2A] dark:text-[#FFE4E6]',
    cardBorder: 'border-rose-400/50',
    accent: 'bg-rose-400',
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
    bg: 'bg-[#EDF7FF] dark:bg-[#031326]',
    font: 'font-sans font-medium tracking-tight',
    textColor: 'text-[#0C3B66] dark:text-[#E0F2FE]',
    cardBorder: 'border-cyan-400/50',
    accent: 'bg-cyan-400',
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
    bg: 'bg-[#EDFAF3] dark:bg-[#081C13]',
    font: 'font-serif',
    textColor: 'text-[#0F4D2E] dark:text-[#ECFDF5]',
    cardBorder: 'border-emerald-400/50',
    accent: 'bg-emerald-400',
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
    bg: 'bg-[#F3F0FF] dark:bg-[#0C0B12]',
    font: 'font-mono',
    textColor: 'text-[#3B1F6E] dark:text-[#F3E8FF]',
    cardBorder: 'border-purple-400/50',
    accent: 'bg-purple-400',
    isVip: true,
    vipBadge: '✦ RAW SPOTLIGHT ✦',
    vipIcon: '🌙',
    vipTagline: 'OLED Obsidian & Velvet Amethyst',
    categoryFit: ['confession', 'rant'],
    dummyText: 'I have spent a lifetime waiting for permission that was never going to come. Today, I grant it to myself.'
  },
  {
    id: 'night-edition',
    name: 'Night Edition',
    bg: 'bg-[#141118]',
    font: 'font-playfair',
    textColor: 'text-[#F5EFE6]',
    cardBorder: 'border-amber-400/50',
    accent: 'bg-[#F59E0B]',
    isVip: true,
    vipBadge: '✦ NIGHT EDITION ✦',
    vipIcon: '🌌',
    vipTagline: 'The Night Stage — Cream on Ink',
    categoryFit: ['general', 'celebration', 'announcement'],
    dummyText: 'When the world goes quiet, one voice remains. Tonight, it is yours.'
  }
]

export const STANDARD_TEMPLATES: Template[] = [
  // Page 1
  { 
    id: "a", 
    name: "Clean Slate", 
    bg: "bg-white dark:bg-[#0A0A0A]", 
    font: "font-sans font-normal", 
    textColor: "text-[#1A1A1A] dark:text-[#F0F0F0]", 
    cardBorder: "border-neutral-200 dark:border-neutral-800", 
    accent: "bg-neutral-400",
    dummyText: "Sometimes the simplest words carry the most weight." 
  },
  { 
    id: "b", 
    name: "Old Letter", 
    bg: "bg-[#FDFBF7] dark:bg-[#1C1613] bg-dot-amber-900/[0.08] dark:bg-dot-amber-500/[0.05]", 
    font: "font-serif italic", 
    textColor: "text-[#3D2C24] dark:text-[#F5EBE6]", 
    cardBorder: "border-amber-900/15 dark:border-amber-500/25",
    accent: "bg-amber-700 dark:bg-amber-500",
    dummyText: "My dearest friend, I've been meaning to tell you..." 
  },
  { 
    id: "f", 
    name: "Console", 
    bg: "bg-[#EBF7EE] dark:bg-[#051109]", 
    font: "font-mono", 
    textColor: "text-[#064E22] dark:text-[#6ee7b7]", 
    cardBorder: "border-emerald-300 dark:border-emerald-500/30 rounded-[4px]",
    accent: "bg-emerald-500",
    dummyText: "> print('Hello world');" 
  },
  { 
    id: "h", 
    name: "Marquee", 
    bg: "bg-neutral-100 dark:bg-black", 
    font: "font-serif uppercase tracking-[0.2em]", 
    textColor: "text-[#171717] dark:text-[#f5f5f5]", 
    cardBorder: "border-neutral-300 dark:border-neutral-800 border-4",
    accent: "bg-neutral-800 dark:bg-neutral-200",
    dummyText: "BASED ON A TRUE STORY." 
  },
  {
    id: "n",
    name: "Twilight",
    bg: "bg-[#F5F3FF] dark:bg-[#0D0B1A]",
    font: "font-outfit font-light tracking-wide",
    textColor: "text-[#4C1D95] dark:text-[#E8DAFF]",
    cardBorder: "border-violet-300 dark:border-violet-400/30 rounded-[2rem]",
    accent: "bg-violet-500",
    dummyText: "In the vast silence between stars, your name is what I hear."
  },
  {
    id: "l",
    name: "Mainframe",
    bg: "bg-[#F0F4F8] dark:bg-[#0A0E14]",
    font: "font-mono font-bold tracking-widest uppercase",
    textColor: "text-[#1B2838] dark:text-[#CBD5E1]",
    cardBorder: "border-slate-300 dark:border-slate-600 shadow-[4px_4px_0px_0px_rgba(148,163,184,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(71,85,105,0.3)] rounded-none",
    accent: "bg-slate-500",
    dummyText: "SYS.MSG // BROADCAST INITIATED // STAND BY"
  },
  
  // Page 2
  {
    id: "journal",
    name: "Journal",
    bg: "bg-[#FFFDF5] dark:bg-[#1A1813]",
    font: "font-caveat text-xl",
    textColor: "text-[#4A3D2C] dark:text-[#E2D5C3]",
    cardBorder: "border-l-4 border-l-amber-400 border-y-amber-200 border-r-amber-200 dark:border-y-amber-900/50 dark:border-r-amber-900/50",
    accent: "bg-amber-600",
    dummyText: "Dear diary, today something incredible happened..."
  },
  {
    id: "blueprint",
    name: "Blueprint",
    bg: "bg-[#E6F0FA] dark:bg-[#0A1929]",
    font: "font-outfit font-medium",
    textColor: "text-[#1E3A8A] dark:text-[#93C5FD]",
    cardBorder: "border-blue-300 dark:border-blue-800/50 rounded-sm",
    accent: "bg-blue-500",
    dummyText: "Architecture of a thought. Draft v1.0.1"
  },
  {
    id: "botanical",
    name: "Meadow",
    bg: "bg-[#F2F7F2] dark:bg-[#0A120A] bg-dot-green-800/[0.08] dark:bg-dot-green-500/[0.05]",
    font: "font-serif",
    textColor: "text-[#14532D] dark:text-[#A7F3D0]",
    cardBorder: "border-green-300 dark:border-green-900/50",
    accent: "bg-green-600",
    dummyText: "Like a tree, let your roots grow deep and strong."
  },
  {
    id: "typewriter",
    name: "Typewriter",
    bg: "bg-[#F5F5F5] dark:bg-[#121212]",
    font: "font-mono font-medium",
    textColor: "text-[#262626] dark:text-[#D4D4D4]",
    cardBorder: "border-neutral-300 dark:border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] rounded-[2px]",
    accent: "bg-neutral-600",
    dummyText: "Keystrokes echoing in an empty room."
  },
  {
    id: "valentine",
    name: "Valentine",
    bg: "bg-[#FFF0F2] dark:bg-[#2B0E15]",
    font: "font-caveat text-2xl",
    textColor: "text-[#9F1239] dark:text-[#FDA4AF]",
    cardBorder: "border-rose-200 dark:border-rose-900/40 rounded-[2.5rem]",
    accent: "bg-rose-500",
    dummyText: "You have my whole heart, for my whole life."
  },
  {
    id: "monument",
    name: "Monument",
    bg: "bg-[#FAFAFA] dark:bg-[#111111]",
    font: "font-cinzel",
    textColor: "text-[#333333] dark:text-[#CCCCCC]",
    cardBorder: "border-b-[6px] border-gray-300 dark:border-gray-700 rounded-b-none",
    accent: "bg-gray-400",
    dummyText: "CARVED IN STONE. A LEGACY TO REMEMBER."
  },

  // Page 3
  {
    id: "midnight",
    name: "Slate",
    bg: "bg-[#EBF0F5] dark:bg-[#050B14]",
    font: "font-playfair",
    textColor: "text-[#0F172A] dark:text-[#94A3B8]",
    cardBorder: "border-slate-300 dark:border-slate-800",
    accent: "bg-slate-700 dark:bg-slate-400",
    dummyText: "The quietest hour holds the loudest thoughts."
  },
  {
    id: "oceanic",
    name: "Oceanic",
    bg: "bg-[#F0FDFA] dark:bg-[#042F2E]",
    font: "font-outfit",
    textColor: "text-[#0F766E] dark:text-[#5EEAD4]",
    cardBorder: "border-teal-200 dark:border-teal-900/50 rounded-tl-[3rem] rounded-br-[3rem]",
    accent: "bg-teal-500",
    dummyText: "Deep currents and quiet ripples."
  },
  {
    id: "golden-age",
    name: "Golden Age",
    bg: "bg-[#FFFAF0] dark:bg-[#1A160C] bg-dot-yellow-900/[0.05] dark:bg-dot-yellow-500/[0.05]",
    font: "font-playfair italic",
    textColor: "text-[#B45309] dark:text-[#FCD34D]",
    cardBorder: "border-yellow-200 dark:border-yellow-900/50 rounded-[2px]",
    accent: "bg-yellow-500",
    dummyText: "A nostalgic memory from a brighter era."
  },

  // Page 4 — Editorial additions
  {
    id: "broadsheet",
    name: "Broadsheet",
    bg: "bg-[#FBFAF7] dark:bg-[#121212]",
    font: "font-playfair",
    textColor: "text-[#141414] dark:text-[#EDEDE6]",
    cardBorder: "border-neutral-300 dark:border-neutral-700",
    accent: "bg-[#B91C1C]",
    categoryFit: ['announcement', 'general'],
    dummyText: "Extra! Extra! Read all about it — the headline is you."
  },
  {
    id: "vow",
    name: "Vow",
    bg: "bg-[#FDF2F4] dark:bg-[#20060D]",
    font: "font-playfair italic",
    textColor: "text-[#701A2E] dark:text-[#FBDCE2]",
    cardBorder: "border-rose-300 dark:border-rose-400/30",
    accent: "bg-[#E11D48]",
    categoryFit: ['love'],
    dummyText: "I choose you, in every lifetime, in every universe, always."
  },
  {
    id: "first-light",
    name: "First Light",
    bg: "bg-[#FDF6EC] dark:bg-[#1D1508]",
    font: "font-serif",
    textColor: "text-[#6B4423] dark:text-[#F3E3C2]",
    cardBorder: "border-amber-300 dark:border-amber-500/30",
    accent: "bg-[#D97706]",
    categoryFit: ['gratitude', 'celebration'],
    dummyText: "Thank you for being the first light in my darkest season."
  },
  {
    id: "ember",
    name: "Ember",
    bg: "bg-[#FFF4ED] dark:bg-[#1C0B03]",
    font: "font-sans font-semibold",
    textColor: "text-[#7C2D12] dark:text-[#FCD9B8]",
    cardBorder: "border-orange-300 dark:border-orange-500/30",
    accent: "bg-[#EA580C]",
    categoryFit: ['rant'],
    dummyText: "Enough. Some truths refuse to stay quiet any longer."
  },
  {
    id: "confessional",
    name: "Confessional",
    bg: "bg-[#F4F1FA] dark:bg-[#0E0A1A]",
    font: "font-serif italic",
    textColor: "text-[#3B2764] dark:text-[#DDD0F5]",
    cardBorder: "border-violet-300 dark:border-violet-400/30",
    accent: "bg-[#7C3AED]",
    categoryFit: ['confession'],
    dummyText: "There is something I have never told anyone, until now."
  },
  {
    id: "summit",
    name: "Summit",
    bg: "bg-[#EEF4F6] dark:bg-[#061419]",
    font: "font-outfit font-medium",
    textColor: "text-[#123B4F] dark:text-[#CFE8EF]",
    cardBorder: "border-cyan-600/30 dark:border-cyan-500/40",
    accent: "bg-[#0891B2]",
    categoryFit: ['promotion', 'announcement'],
    dummyText: "We climbed quietly. Today, the view is for everyone."
  },
  {
    id: "telegram",
    name: "Telegram",
    bg: "bg-[#F7F3E8] dark:bg-[#161410]",
    font: "font-mono uppercase tracking-wider",
    textColor: "text-[#33302A] dark:text-[#E8E2D2]",
    cardBorder: "border-stone-300 dark:border-stone-600",
    accent: "bg-[#57534E]",
    categoryFit: ['announcement', 'general'],
    dummyText: "WIRE DISPATCH. THE NEWS CANNOT WAIT. STOP."
  }
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
  accentBg: string
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
    accentBg: 'bg-cyan-500/15'
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
    accentBg: 'bg-amber-500/15'
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
    accentBg: 'bg-rose-500/15'
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
    accentBg: 'bg-purple-500/15'
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
    accentBg: 'bg-teal-500/15'
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
    accentBg: 'bg-blue-500/15'
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
    accentBg: 'bg-red-500/15'
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
    accentBg: 'bg-violet-500/15'
  }
}
