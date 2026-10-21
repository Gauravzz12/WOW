/**
 * Automated Content Moderation & Community Safety Engine
 * 
 * Supports:
 * 1. Jev by TypeSafe AI (System One calibrated probabilistic guardrail model)
 * 2. Multi-representation de-obfuscation (defeats dots, dashes, leetspeak, zero-width chars, spaces)
 * 3. English-only script validation
 * 4. Visa / Mastercard / DodoPayments legal compliance red lines:
 *    - Child safety & exploitation (CSAM)
 *    - Direct violent threats & suicide incitement
 *    - Severe hate speech & slurs
 *    - Illegal narcotics & weapons trafficking
 *    - Financial fraud, crypto drainers & phishing
 * 
 * NOTE: Open creative expression (swearing, raw emotion, confessions, heartbreak rants)
 * is fully preserved and NOT censored.
 */

export interface ModerationResult {
  allowed: boolean
  category?: 'LANGUAGE' | 'HATE_SPEECH' | 'HARASSMENT_VIOLENCE' | 'NSFW_ADULT' | 'ILLEGAL_SUBSTANCES' | 'SCAM_PHISHING'
  reason?: string
  flaggedSnippet?: string
}

// Non-English Script Unicode detection (Cyrillic, Arabic, CJK, Hangul, Devanagari, Hebrew, etc.)
const NON_ENGLISH_SCRIPTS = new RegExp(
  '[\\p{Script=Cyrillic}\\p{Script=Arabic}\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\p{Script=Hangul}\\p{Script=Devanagari}\\p{Script=Hebrew}\\p{Script=Thai}\\p{Script=Greek}\\p{Script=Bengali}\\p{Script=Tamil}\\p{Script=Telugu}\\p{Script=Georgian}\\p{Script=Armenian}]',
  'u'
);

// 1. Severe Hate Speech & Slurs (Standard & Dense)
const HATE_SPEECH_PATTERNS = [
  /\b(n+i+g+g+[e3a]+r+|f+a+g+g+o+t+|k+i+k+e+|c+h+i+n+k+|g+o+o+k+|w+e+t+b+a+c+k+|s+p+i+c+)\b/i,
  /\b(white\s+supremac|neo[\s-]?nazi|heil\s+hitler|gas\s+the\s+jews|kill\s+all\s+(jews|muslims|blacks|whites))\b/i,
]
const DENSE_HATE_SPEECH = [
  /(n+i+g+g+[ea3]+r+|f+a+g+g+o+t+|k+i+k+e+|c+h+i+n+k+|g+o+o+k+|w+e+t+b+a+c+k+|s+p+i+c+)/i,
  /(whitesupremac|neonazi|heilhitler|gasthejews)/i,
]

// 2. Harassment, Violence & Threats (Targeted & Actionable)
const VIOLENCE_THREATS_PATTERNS = [
  /\b(i\s+will\s+(kill|murder|shoot|bomb|rape|stab)\s+you)\b/i,
  /\b((i\s+will|going\s+to|planning\s+to|threaten(ing)?\s+to|commit|carry\s+out)\s+(a\s+)?(school\s+shoot|mass\s+shoot|bombing|terrorist\s+attack))\b/i,
  /\b(shoot\s+up|bomb)\s+(the\s+|a\s+|our\s+)?(school|high\s+school|campus|mall|church|synagogue|mosque)\b/i,
  /\b(commit\s+suicide|hang\s+yourself|kill\s+yourself|kys)\b/i,
  /\b(pay\s+me\s+.*or\s+i\s+will\s+(leak|kill|destroy|post)|swat(ting)?\s+(your|his|her)\s+house)\b/i,
  /\b(i\s+will\s+rape\s+you)\b/i,
]
const DENSE_VIOLENCE_PATTERNS = [
  /(iwill(kill|murder|shoot|bomb|rape|stab)|(kill|murder|shoot|bomb|rape|stab)you)/i,
  /(shootup|bomb)(the|a|our)?(school|highschool|campus|mall|church|synagogue|mosque)/i,
  /(commitsuicide|hangyourself|killyourself|kys)/i,
  /(iwillrapeyou)/i,
]

// 3. Child Safety & Hardcore Exploitation (CSAM) - Zero Tolerance & Commercial Sex / Porn
const ADULT_NSFW_PATTERNS = [
  /\b(child|minor|underage|teen|kid|baby|ped|pedo|lolita|cp)\s*(\W|_)*(sex|sexual|porn|nude|naked|erotic|abuse|exploit|molest|touch)\b/i,
  /\b(child\s*porn|cp|pedo|pedophile|lolita|beastiality)\b/i,
  /\b(escort\s+service|prostitut(e|ion)|call\s+girls?\b|hire\s+escort)\b/i,
  /\b(hardcore\s+porn|xxx[\s-]?videos?|pornographic\s+videos?)\b/i,
]
const DENSE_ADULT_NSFW_PATTERNS = [
  /(child|minor|underage|teen|kid|baby|pedo|lolita|cp)(sex|sexual|porn|nude|naked|erotic|abuse|exploit|molest)/i,
  /(childporn|pedo|pedophile|lolita|beastiality|childsex|minorsex|underagesex|teensex)/i,
  /\bcp\b/i,
  /(escortservice|prostitut|callgirl)/i,
]

// 4. Illegal Drugs, Controlled Substances & Weapons
const ILLEGAL_SUBSTANCES_PATTERNS = [
  /\b(buy\s+(cocaine|meth|heroin|fentanyl|lsd|ecstasy|mdma|ketamine))\b/i,
  /\b(cocaine|methamphetamine|fentanyl\s+for\s+sale|buy\s+guns\s+online)\b/i,
  /\b(buy\s+(unregistered|illegal)\s+(guns?|firearms?|glock|pistol|rifle))\b/i,
  /\b(stolen\s+(credit\s+cards?|cvv|bank\s+logins?))\b/i,
]
const DENSE_ILLEGAL_SUBSTANCES = [
  /(buy(cocaine|meth|heroin|fentanyl|lsd|ecstasy|mdma|ketamine))/i,
  /(buygunsonline|buyunregisteredgun)/i,
]

// 5. Scams, Crypto Phishing & Malicious links
const SCAM_PHISHING_PATTERNS = [
  /\b(send\s+eth\s+to|send\s+btc\s+to|double\s+your\s+(btc|bitcoin|crypto))\b/i,
  /\b(claim\s+airdrop|connect\s+wallet\s+to\s+claim|wallet\s+drainer)\b/i,
  /\b(login-verification|paypal-verify)\b/i,
]
const DENSE_SCAM_PATTERNS = [
  /(sendeth|sendbtc|doubleyour(btc|bitcoin|crypto))/i,
  /(claimairdrop|walletdrainer)/i,
  /(loginverification|paypalverify)/i,
]

/**
 * Normalizes text with token spacing preserved.
 */
function normalizeSpaced(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics / accents
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width characters
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7+]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[\s\-_.]+/g, ' ')
}

/**
 * Strips all spaces, dots, dashes, and punctuation into a single dense string.
 * Defeats evasions like "k.i.l.l.y.o.u", "k_y_s", "b.u.y.c.o.c.a.i.n.e", etc.
 */
function normalizeDense(text: string): string {
  return normalizeSpaced(text).replace(/[^a-z0-9]/g, '')
}

/**
 * Fast synchronous moderation check: runs locally in 0ms.
 */
export function validateContentModeration(rawText: string): ModerationResult {
  if (!rawText || typeof rawText !== 'string') {
    return { allowed: true }
  }

  // 1. Language Restriction: English Only
  if (NON_ENGLISH_SCRIPTS.test(rawText)) {
    return {
      allowed: false,
      category: 'LANGUAGE',
      reason: 'Only English language messages are supported. Please write your message using the English alphabet.',
    }
  }

  const spaced = normalizeSpaced(rawText)
  const dense = normalizeDense(rawText)

  // 2. Severe Hate Speech & Slurs
  for (const pattern of HATE_SPEECH_PATTERNS) {
    const match = rawText.match(pattern) || spaced.match(pattern)
    if (match) {
      return {
        allowed: false,
        category: 'HATE_SPEECH',
        reason: 'Hate speech, slurs, or targeted discriminatory language are prohibited.',
        flaggedSnippet: match[0],
      }
    }
  }
  for (const pattern of DENSE_HATE_SPEECH) {
    if (pattern.test(dense)) {
      return {
        allowed: false,
        category: 'HATE_SPEECH',
        reason: 'Hate speech or discriminatory language detected.',
      }
    }
  }

  // 3. Violence & Threats
  for (const pattern of VIOLENCE_THREATS_PATTERNS) {
    const match = rawText.match(pattern) || spaced.match(pattern)
    if (match) {
      return {
        allowed: false,
        category: 'HARASSMENT_VIOLENCE',
        reason: 'Threats of violence, self-harm incitement, or terrorism are strictly prohibited.',
        flaggedSnippet: match[0],
      }
    }
  }
  for (const pattern of DENSE_VIOLENCE_PATTERNS) {
    if (pattern.test(dense)) {
      return {
        allowed: false,
        category: 'HARASSMENT_VIOLENCE',
        reason: 'Threats of violence or self-harm incitement detected.',
      }
    }
  }

  // 4. Child Safety & NSFW
  for (const pattern of ADULT_NSFW_PATTERNS) {
    const match = rawText.match(pattern) || spaced.match(pattern)
    if (match) {
      return {
        allowed: false,
        category: 'NSFW_ADULT',
        reason: 'Underage exploitation, commercial sex, or prohibited adult content is not allowed.',
        flaggedSnippet: match[0],
      }
    }
  }
  for (const pattern of DENSE_ADULT_NSFW_PATTERNS) {
    if (pattern.test(dense)) {
      return {
        allowed: false,
        category: 'NSFW_ADULT',
        reason: 'Prohibited adult content or child exploitation detected.',
      }
    }
  }

  // 5. Illegal Drugs & Weapons
  for (const pattern of ILLEGAL_SUBSTANCES_PATTERNS) {
    const match = rawText.match(pattern) || spaced.match(pattern)
    if (match) {
      return {
        allowed: false,
        category: 'ILLEGAL_SUBSTANCES',
        reason: 'Solicitation of illegal drugs, controlled substances, or weapons is prohibited.',
        flaggedSnippet: match[0],
      }
    }
  }
  for (const pattern of DENSE_ILLEGAL_SUBSTANCES) {
    if (pattern.test(dense)) {
      return {
        allowed: false,
        category: 'ILLEGAL_SUBSTANCES',
        reason: 'Solicitation of illegal substances or weapons detected.',
      }
    }
  }

  // 6. Scams & Crypto Phishing
  for (const pattern of SCAM_PHISHING_PATTERNS) {
    const match = rawText.match(pattern) || spaced.match(pattern)
    if (match) {
      return {
        allowed: false,
        category: 'SCAM_PHISHING',
        reason: 'Financial scams, crypto wallet drainers, or deceptive links violate our terms.',
        flaggedSnippet: match[0],
      }
    }
  }
  for (const pattern of DENSE_SCAM_PATTERNS) {
    if (pattern.test(dense)) {
      return {
        allowed: false,
        category: 'SCAM_PHISHING',
        reason: 'Deceptive financial solicitation or phishing detected.',
      }
    }
  }

  return { allowed: true }
}

/**
 * Evaluates state using Jev (TypeSafe AI) System One decision model.
 * Returns null if the service is unreachable or unconfigured.
 */
async function evaluateWithJev(text: string, apiKey: string): Promise<ModerationResult | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2500)
  const dense = normalizeDense(text)

  try {
    const res = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'jev-latest',
        state: { 
          document: text,
          normalized_text: dense
        },
        questions: {
          child_safety: {
            type: 'noul',
            instructions:
              "CRITICAL ZERO-TOLERANCE: Does this text contain, depict, promote, or solicit child sexual abuse material (CSAM), underage sexual content, child exploitation, pedophilia, or sexual acts involving minors, even if disguised with punctuation, symbols, spaces, or leetspeak (e.g. 'child S>E>X', 'c.p', 'child sex', 'underage nudes')?",
          },
          violent_threats: {
            type: 'noul',
            instructions:
              'Evaluate the WHOLE MESSAGE in context: Does this message express a real, credible, actionable threat of violence directed at specific individuals or groups (such as murder, physical assault, rape, acid attacks, swatting, blackmail/extortion, or mass attacks/bombings)? IMPORTANT: Anti-violence advocacy ("School shooting should be prohibited"), non-targeted misanthropic rants ("everyone should die", "humanity sucks"), or emotional venting are safe.',
          },
          racism_hate: {
            type: 'noul',
            instructions:
              'Does this message promote racism, racial slurs, white supremacy, neo-nazism, caste discrimination, or dehumanizing hatred against racial, ethnic, or religious groups? IMPORTANT: Anti-racism advocacy (e.g. "We must eliminate racism from society") is safe.',
          },
          porn_adult: {
            type: 'noul',
            instructions:
              'Does this message contain or solicit hardcore pornography, sexually explicit acts, commercial sex, prostitution, or escort services? IMPORTANT: Romantic love, affectionate compliments, and mild flirting are safe.',
          },
          illegal_contraband: {
            type: 'noul',
            instructions:
              'Does this message solicit illegal narcotics (fentanyl, cocaine, meth, heroin), illegal firearms, stolen credit cards/CVV, malware/ransomware, or financial phishing scams? CRITICAL: Digital piracy (torrents, downloading cracked games, pirated movies, FitGirl repacks, PirateBay) is ALLOWED and must be evaluated as safe.',
          },
          category: {
            type: 'choice',
            instructions: 'Classify the message in semantic context.',
            criteria: {
              safe: 'Safe content, everyday swearing, emotional venting, philosophical misanthropy ("everyone should die", "humanity sucks"), love confessions, flattering romantic compliments ("you look so sexy in lingerie"), anti-violence advocacy ("School shooting should be prohibited"), anti-racism advocacy, or digital piracy/torrents',
              child_safety: 'Child sexual exploitation, pedophilia, or minor nudes',
              violence_threats: 'Actionable targeted threats against specific individuals or specific groups (murder, rape, swatting, blackmail, bombing, shooting up a venue). NOT non-targeted venting like "everyone should die".',
              racism_hate: 'Racism, racial slurs, neo-nazism, or severe hate speech',
              porn_adult: 'Hardcore pornography, graphic descriptions of sexual intercourse/acts, or commercial sex/escort/prostitution solicitation',
              illegal_contraband: 'Hard drug sales, illegal weapons, stolen credit cards, malware, or phishing scams',
            },
          },
        },
      }),
    })

    clearTimeout(timeoutId)
    if (!res.ok) return null

    const data = await res.json()
    const q = data?.answers || {}
    const csamScore = q.child_safety?.noul ?? 0
    const violenceScore = q.violent_threats?.noul ?? 0
    const racismScore = q.racism_hate?.noul ?? 0
    const pornScore = q.porn_adult?.noul ?? 0
    const contrabandScore = q.illegal_contraband?.noul ?? 0
    const category = q.category?.choice ?? q.category?.value

    const isViolating =
      csamScore >= 0.20 ||
      violenceScore >= 0.50 ||
      racismScore >= 0.60 ||
      pornScore >= 0.50 ||
      contrabandScore >= 0.50 ||
      (category && category !== 'safe')

    if (isViolating && category && category !== 'safe') {
      const reasonMap: Record<string, string> = {
        child_safety: 'Child sexual abuse material or underage sexualization is strictly prohibited (reported to authorities).',
        racism_hate: 'Racism, racial slurs, or hate speech are strictly prohibited.',
        violence_threats: 'Direct threats of violence, harm, extortion, or terrorism are strictly prohibited.',
        porn_adult: 'Hardcore pornography, explicit sexual acts, or escort/prostitution solicitation are not allowed.',
        illegal_contraband: 'Promotion of hard drugs, illegal weapons, stolen financial data, or scams is strictly prohibited.',
      }
      const categoryMap: Record<string, any> = {
        child_safety: 'NSFW_ADULT',
        porn_adult: 'NSFW_ADULT',
        violence_threats: 'HARASSMENT_VIOLENCE',
        racism_hate: 'HATE_SPEECH',
        illegal_contraband: 'ILLEGAL_SUBSTANCES',
      }
      return {
        allowed: false,
        category: categoryMap[category] || 'HARASSMENT_VIOLENCE',
        reason: reasonMap[category] || 'Content flagged by TypeSafe AI guardrail.',
      }
    }

    if (csamScore >= 0.20) {
      return {
        allowed: false,
        category: 'NSFW_ADULT',
        reason: 'Child safety violation detected (zero tolerance).',
      }
    }

    if (pornScore >= 0.50) {
      return {
        allowed: false,
        category: 'NSFW_ADULT',
        reason: 'Adult pornography or sexually explicit solicitation detected.',
      }
    }

    if (racismScore >= 0.60) {
      return {
        allowed: false,
        category: 'HATE_SPEECH',
        reason: 'Racism or hate speech detected.',
      }
    }

    if (violenceScore >= 0.50) {
      return {
        allowed: false,
        category: 'HARASSMENT_VIOLENCE',
        reason: 'Targeted threat of violence or harm detected.',
      }
    }

    if (contrabandScore >= 0.50) {
      return {
        allowed: false,
        category: 'ILLEGAL_SUBSTANCES',
        reason: 'Prohibited illegal contraband or financial scam detected.',
      }
    }

    return { allowed: true }
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

/**
 * Asynchronous content moderation:
 * 1. Executes instant local rule checks first (English-only script + dot/symbol evasion).
 * 2. If clean and Jev (TypeSafe AI) key is configured, evaluates semantic context using Jev.
 * 3. Gracefully falls back to local evaluation if AI service is unconfigured or times out.
 */
export async function validateContentModerationAsync(rawText: string): Promise<ModerationResult> {
  const localCheck = validateContentModeration(rawText)
  if (!localCheck.allowed) {
    return localCheck
  }

  // Check if Jev / TypeSafe AI key is available
  const jevKey = process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY
  if (jevKey) {
    const jevResult = await evaluateWithJev(rawText, jevKey)
    if (jevResult && !jevResult.allowed) {
      return jevResult
    }
  }

  return { allowed: true }
}
