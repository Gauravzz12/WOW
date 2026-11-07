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

/**
 * Unified, curated templates for all broadcast modes (Normal, Special, Sponsored).
 * All templates are available to everyone — no separate VIP or tier-gated restrictions.
 */
export const ALL_TEMPLATES: Template[] = [
  // 1. Clean & Modern
  {
    id: "a",
    name: "Clean Slate",
    bg: "bg-white dark:bg-[#0A0A0A]",
    font: "font-sans font-normal",
    textColor: "text-[#171717] dark:text-[#F3F3F3]",
    cardBorder: "border-neutral-200 dark:border-neutral-800",
    accent: "bg-neutral-500",
    categoryFit: ['general', 'announcement'],
    dummyText: "Sometimes the simplest words carry the most weight."
  },
  // 2. Vintage Letter
  {
    id: "b",
    name: "Old Letter",
    bg: "bg-[#FDFBF7] dark:bg-[#1A1612] bg-dot-amber-900/[0.08] dark:bg-dot-amber-500/[0.05]",
    font: "font-serif italic",
    textColor: "text-[#3D2C24] dark:text-[#F5EBE6]",
    cardBorder: "border-amber-900/15 dark:border-amber-500/25",
    accent: "bg-amber-700 dark:bg-amber-500",
    categoryFit: ['love', 'gratitude', 'confession'],
    dummyText: "My dearest friend, I've been meaning to tell you..."
  },
  // 3. Romantic Vow
  {
    id: "vow",
    name: "Velvet Romance",
    bg: "bg-[#FFF0F3] dark:bg-[#20060D]",
    font: "font-serif italic font-medium",
    textColor: "text-[#881337] dark:text-[#FFE4E6]",
    cardBorder: "border-rose-300 dark:border-rose-500/40",
    accent: "bg-[#E11D48]",
    categoryFit: ['love'],
    dummyText: "I choose you, in every lifetime, in every universe, always."
  },
  // 4. Celebration Gala
  {
    id: "gala",
    name: "Champagne Gala",
    bg: "bg-[#FFFDF5] dark:bg-[#1A1508]",
    font: "font-playfair font-semibold tracking-wide",
    textColor: "text-[#78350F] dark:text-[#FEF3C7]",
    cardBorder: "border-amber-300 dark:border-amber-500/50",
    accent: "bg-[#F59E0B]",
    categoryFit: ['celebration', 'promotion'],
    dummyText: "To the milestones behind us and the brilliant adventures ahead. Cheers!"
  },
  // 5. Midnight Twilight
  {
    id: "twilight",
    name: "Midnight Starlight",
    bg: "bg-[#F5F3FF] dark:bg-[#0B0916]",
    font: "font-outfit font-light tracking-wide",
    textColor: "text-[#4C1D95] dark:text-[#E9D5FF]",
    cardBorder: "border-violet-300 dark:border-violet-500/40",
    accent: "bg-[#7C3AED]",
    categoryFit: ['confession', 'general'],
    dummyText: "In the vast silence between stars, your name is what I hear."
  },
  // 6. The Broadsheet
  {
    id: "broadsheet",
    name: "The Broadsheet",
    bg: "bg-[#FAF9F5] dark:bg-[#121214]",
    font: "font-playfair font-bold",
    textColor: "text-[#141414] dark:text-[#EDEDE6]",
    cardBorder: "border-neutral-300 dark:border-neutral-700",
    accent: "bg-[#B91C1C]",
    categoryFit: ['announcement', 'general'],
    dummyText: "EXTRA! EXTRA! Read all about it — the headline is you."
  },
  // 7. Cyber Pulse
  {
    id: "cyber",
    name: "Cyber Pulse",
    bg: "bg-[#F0F9FF] dark:bg-[#030F1A]",
    font: "font-mono font-medium tracking-tight",
    textColor: "text-[#0369A1] dark:text-[#38BDF8]",
    cardBorder: "border-cyan-300 dark:border-cyan-500/50",
    accent: "bg-[#06B6D4]",
    categoryFit: ['promotion', 'announcement'],
    dummyText: "SYSTEM BROADCAST: Build the future. It's officially live."
  },
  // 8. Botanical Meadow
  {
    id: "botanical",
    name: "Botanical Meadow",
    bg: "bg-[#F2F8F4] dark:bg-[#06150D] bg-dot-green-800/[0.08] dark:bg-dot-green-500/[0.05]",
    font: "font-serif",
    textColor: "text-[#14532D] dark:text-[#A7F3D0]",
    cardBorder: "border-emerald-300 dark:border-emerald-600/40",
    accent: "bg-[#10B981]",
    categoryFit: ['gratitude', 'general'],
    dummyText: "Like a tree, let your roots grow deep and reach for the light."
  },
  // 9. Molten Ember
  {
    id: "ember",
    name: "Molten Ember",
    bg: "bg-[#FFF5ED] dark:bg-[#1A0A03]",
    font: "font-sans font-bold tracking-tight",
    textColor: "text-[#7C2D12] dark:text-[#FCD9B8]",
    cardBorder: "border-orange-300 dark:border-orange-500/40",
    accent: "bg-[#EA580C]",
    categoryFit: ['rant'],
    dummyText: "Enough. Some truths refuse to stay quiet any longer."
  },
  // 10. Personal Journal
  {
    id: "journal",
    name: "Personal Journal",
    bg: "bg-[#FFFDF5] dark:bg-[#1A1813]",
    font: "font-caveat text-xl sm:text-2xl",
    textColor: "text-[#4A3D2C] dark:text-[#E2D5C3]",
    cardBorder: "border-l-4 border-l-amber-400 border-amber-200 dark:border-amber-900/40",
    accent: "bg-[#D97706]",
    categoryFit: ['confession', 'gratitude'],
    dummyText: "Dear diary, today something incredible happened..."
  },
  // 11. Sweet Valentine
  {
    id: "valentine",
    name: "Sweet Valentine",
    bg: "bg-[#FFF0F3] dark:bg-[#250A14]",
    font: "font-caveat text-2xl",
    textColor: "text-[#9F1239] dark:text-[#FDA4AF]",
    cardBorder: "border-rose-200 dark:border-rose-500/35",
    accent: "bg-[#F43F5E]",
    categoryFit: ['love'],
    dummyText: "You make the ordinary moments feel like poetry."
  },
  // 12. Golden Monument
  {
    id: "monument",
    name: "Golden Monument",
    bg: "bg-[#FAFAFA] dark:bg-[#111112]",
    font: "font-cinzel uppercase tracking-widest",
    textColor: "text-[#292524] dark:text-[#E7E5E4]",
    cardBorder: "border-b-[4px] border-stone-400 dark:border-stone-600",
    accent: "bg-stone-500",
    categoryFit: ['celebration', 'general'],
    dummyText: "CARVED IN STONE. A LEGACY TO BE REMEMBERED."
  },
  // 13. Retro Terminal
  {
    id: "f",
    name: "Retro Terminal",
    bg: "bg-[#EBF7EE] dark:bg-[#051109]",
    font: "font-mono",
    textColor: "text-[#064E22] dark:text-[#6EE7B7]",
    cardBorder: "border-emerald-300 dark:border-emerald-500/40",
    accent: "bg-[#059669]",
    categoryFit: ['promotion', 'announcement'],
    dummyText: "> print('Hello world. We are finally live.');"
  },
  // 14. Oceanic Depths
  {
    id: "oceanic",
    name: "Oceanic Depths",
    bg: "bg-[#F0FDFA] dark:bg-[#031E1D]",
    font: "font-outfit",
    textColor: "text-[#0F766E] dark:text-[#5EEAD4]",
    cardBorder: "border-teal-200 dark:border-teal-500/40",
    accent: "bg-[#14B8A6]",
    categoryFit: ['gratitude', 'general'],
    dummyText: "Deep currents and quiet ripples. Peace is a choice."
  },
  // 15. Vintage Typewriter
  {
    id: "typewriter",
    name: "Vintage Typewriter",
    bg: "bg-[#F6F5F2] dark:bg-[#141413]",
    font: "font-mono font-medium",
    textColor: "text-[#262626] dark:text-[#D4D4D4]",
    cardBorder: "border-neutral-300 dark:border-neutral-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.05)]",
    accent: "bg-neutral-600",
    categoryFit: ['confession', 'general'],
    dummyText: "Keystrokes echoing in an empty room at midnight."
  },
  // 16. Golden Dawn
  {
    id: "first-light",
    name: "Golden Dawn",
    bg: "bg-[#FDF6EC] dark:bg-[#1A1306]",
    font: "font-serif",
    textColor: "text-[#6B4423] dark:text-[#F3E3C2]",
    cardBorder: "border-amber-300 dark:border-amber-500/40",
    accent: "bg-[#D97706]",
    categoryFit: ['gratitude', 'celebration'],
    dummyText: "Thank you for being the first light in my darkest season."
  },
  // 17. Celestial Twilight
  {
    id: "celestial",
    name: "Celestial Twilight",
    bg: "bg-[#FAF5FF] dark:bg-[#0E061E]",
    font: "font-outfit font-light tracking-wide",
    textColor: "text-[#6B21A8] dark:text-[#DDD0F5]",
    cardBorder: "border-violet-300 dark:border-violet-500/40",
    accent: "bg-[#9333EA]",
    categoryFit: ['confession', 'love'],
    dummyText: "There is something I have never told anyone, until now."
  },
  // 18. Telegram Wire
  {
    id: "telegram",
    name: "Telegram Wire",
    bg: "bg-[#F7F3E8] dark:bg-[#161410]",
    font: "font-mono uppercase tracking-wider",
    textColor: "text-[#33302A] dark:text-[#E8E2D2]",
    cardBorder: "border-stone-300 dark:border-stone-600",
    accent: "bg-[#57534E]",
    categoryFit: ['announcement', 'general'],
    dummyText: "WIRE DISPATCH. THE NEWS CANNOT WAIT. STOP."
  }
]

/** Backward compatibility alias */
export const STANDARD_TEMPLATES: Template[] = ALL_TEMPLATES

/** Backward compatibility: no separate VIP templates */
export const VIP_SPECIAL_TEMPLATES: Template[] = []

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
