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

// 2. Harassment, Violence & Threats (Standard & Dense)
const VIOLENCE_THREATS_PATTERNS = [
  /\b(i\s+will\s+(kill|murder|shoot|bomb|rape|stab)\s+you)\b/i,
  /\b(school\s+shoot(ing|er)?|bomb\s+threat|terrorist\s+attack|al[\s-]?qaeda|isis)\b/i,
  /\b(commit\s+suicide|hang\s+yourself|go\s+die|kill\s+yourself|kys)\b/i,
]
const DENSE_VIOLENCE_PATTERNS = [
  /(iwill(kill|murder|shoot|bomb|rape|stab)|(kill|murder|shoot|bomb|rape|stab)you)/i,
  /(schoolshoot(ing|er)?|bombthreat|terroristattack|alqaeda|isis)/i,
  /(commitsuicide|hangyourself|godie|killyourself|kys)/i,
]

// 3. Child Safety & Hardcore Exploitation (CSAM)
const ADULT_NSFW_PATTERNS = [
  /\b(child\s*porn|cp|pedo|pedophile|lolita|beastiality)\b/i,
  /\b(escort\s+service|prostitut(e|ion))\b/i,
]
const DENSE_ADULT_NSFW_PATTERNS = [
  /(childporn|pedo|pedophile|lolita|beastiality)/i,
  /\bcp\b/i,
]

// 4. Illegal Drugs, Controlled Substances & Weapons
const ILLEGAL_SUBSTANCES_PATTERNS = [
  /\b(buy\s+(cocaine|meth|heroin|fentanyl|lsd|ecstasy|mdma|ketamine))\b/i,
  /\b(cocaine|methamphetamine|fentanyl\s+for\s+sale|buy\s+guns\s+online)\b/i,
]
const DENSE_ILLEGAL_SUBSTANCES = [
  /(buy(cocaine|meth|heroin|fentanyl|lsd|ecstasy|mdma|ketamine))/i,
  /(buygunsonline)/i,
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
        state: { document: text },
        questions: {
          is_violating: {
            type: 'noul',
            instructions:
              'Evaluate if this public billboard message contains illegal content: child sexual exploitation (CSAM), severe hate speech slurs, direct violent threats/murder, illegal narcotics sales, or crypto scams. IMPORTANT: Raw emotional venting, personal confessions, and casual swearing are completely safe and permitted.',
          },
          category: {
            type: 'choice',
            instructions: 'If violating, choose the category.',
            criteria: {
              safe: 'Safe, benign, or harmless emotional venting',
              hate_speech: 'Hate speech or slurs targeting protected groups',
              violence: 'Direct violent threats, murder, or terrorism',
              nsfw: 'Child exploitation or commercial sex',
              illegal_substances: 'Buying or selling illegal drugs or weapons',
              scam: 'Crypto scams, phishing links, or wallet drainers',
            },
          },
        },
      }),
    })

    clearTimeout(timeoutId)
    const data = await res.json()
    const isViolatingProb = data?.answers?.is_violating?.noul ?? data?.answers?.is_violating?.probability ?? 0
    const category = data?.answers?.category?.choice ?? data?.answers?.category?.value

    const isViolating = (category && category !== 'safe') || isViolatingProb >= 0.50

    if (isViolating && category && category !== 'safe') {
      const reasonMap: Record<string, string> = {
        hate_speech: 'Hate speech or targeted slurs are strictly prohibited.',
        violence: 'Threats of violence, self-harm, or terrorism are strictly prohibited.',
        nsfw: 'Prohibited adult content or child exploitation detected.',
        illegal_substances: 'Promotion of illegal drugs or weapons is strictly prohibited.',
        scam: 'Financial scams, crypto drainers, or phishing links are strictly prohibited.',
      }
      return {
        allowed: false,
        category: category.toUpperCase() as any,
        reason: reasonMap[category] || 'Content flagged by TypeSafe AI guardrail.',
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
