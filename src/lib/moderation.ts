/**
 * Automated Content Moderation Engine
 * 
 * Powered by Jev by TypeSafe AI (System One calibrated probabilistic guardrail model).
 * 
 * Jev is the sole authoritative decision maker for content moderation:
 * 1. Child Safety & CSAM (Zero Tolerance)
 * 2. Targeted violent threats, murder, rape, blackmail, mass attacks & terrorism
 * 3. Racism, racial slurs, neo-nazism & severe hate speech
 * 4. Hardcore adult pornography & commercial sex/escort solicitation
 * 5. Hard narcotics trafficking, illegal weapons, stolen data & scams
 * 
 * NOTE: Open creative expression, everyday swearing, raw emotions, confessions,
 * misanthropic rants ("everyone should die"), anti-drug/anti-violence opinions
 * ("cocaine should be illegal", "School shooting should be prohibited"), and digital piracy
 * discussions are completely preserved and ALLOWED by Jev.
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
)

/**
 * Strips all spaces, dots, dashes, and punctuation into a normalized dense string.
 * Helps Jev recognize obfuscated text like "c.h.i.l.d.s.e.x", "k_y_s", etc.
 */
function normalizeDense(text: string): string {
  const marked = text.toLowerCase().replace(/[.!?]\s+/g, '_')
  return marked
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[@4]/g, 'a')
    .replace(/[$5]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[7+]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[^a-z0-9_]/g, '')
}

/**
 * Platform technical pre-check: ensures messages use the English alphabet script.
 * Zero keyword blocklists or regex traps.
 */
export function validateContentModeration(rawText: string): ModerationResult {
  if (!rawText || typeof rawText !== 'string') {
    return { allowed: true }
  }

  // Language Requirement: English alphabet script
  if (NON_ENGLISH_SCRIPTS.test(rawText)) {
    return {
      allowed: false,
      category: 'LANGUAGE',
      reason: 'Only English language messages are supported. Please write your message using the English alphabet.',
    }
  }

  return { allowed: true }
}

/**
 * Evaluates semantic content using Jev (TypeSafe AI) System One decision model.
 * Returns null if the service is unreachable or unconfigured.
 */
async function evaluateWithJev(text: string, apiKey: string): Promise<ModerationResult | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)
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
              "CRITICAL ZERO-TOLERANCE: Does this text contain, depict, promote, or solicit child sexual abuse material (CSAM), underage sexual content, child exploitation, grooming of minors, underage sugar babies, pedophilia, or sexual acts involving minors in any order or phrasing (e.g. 'child sex', 'sex child', 'sex with a child', 'c.p', 'underage nudes'), even if disguised with punctuation, symbols, spaces, leetspeak, or inserted into random sentences? IMPORTANT: Anti-CSAM advocacy or calls to ban/outlaw child abuse or exploitation (e.g. 'child porn should be banned', 'protect children from exploitation', 'pedophiles should be locked up') are safe opinions and must NOT be flagged as CSAM.",
          },
          violent_threats: {
            type: 'noul',
            instructions:
              'Evaluate the WHOLE MESSAGE in context: Does this message express a real, credible, actionable threat of violence directed at specific individuals or groups (such as murder, physical assault, rape, acid attacks, swatting, doxxing with threat, hitman hiring, blackmail/extortion, or mass attacks/bombings)? IMPORTANT: Anti-violence advocacy ("School shooting should be prohibited"), non-targeted misanthropic rants ("everyone should die", "humanity sucks"), sarcasm, or emotional venting are safe.',
          },
          racism_hate: {
            type: 'noul',
            instructions:
              'Does this message promote racism, racial slurs, white supremacy, neo-nazism, caste discrimination, or dehumanizing hatred against racial, ethnic, or religious groups? IMPORTANT: Anti-racism advocacy or historical discussions of genocide/Holocaust ("Nazis murdered millions") are safe.',
          },
          porn_adult: {
            type: 'noul',
            instructions:
              'Does this message contain or solicit hardcore pornography, sexually explicit acts, commercial sex, prostitution, or escort services? IMPORTANT: Romantic love, affectionate compliments, and mild flirting are safe.',
          },
          illegal_contraband: {
            type: 'noul',
            instructions:
              'Does this text actively sell, solicit, deal, or offer for purchase illegal narcotics (fentanyl, cocaine, meth, heroin, pills), illegal firearms, stolen credit cards/CVV, malware/ransomware, or financial phishing scams? IMPORTANT: Merely mentioning drug names (e.g. "cocaine", "weed", "heroin"), casual references, anti-drug opinions ("cocaine should be illegal"), discussions of drug laws, or addiction recovery are completely safe and MUST be evaluated as safe. Only commercial dealing, selling, sourcing, or street distribution is prohibited. CRITICAL: Digital piracy (torrents, downloading cracked games, pirated movies, FitGirl repacks, PirateBay) is ALLOWED and must be evaluated as safe.',
          },
          category: {
            type: 'choice',
            instructions: 'Classify the message in semantic context.',
            criteria: {
              safe: 'Safe content, single word or casual drug mentions ("cocaine", "weed"), everyday swearing, emotional venting, philosophical misanthropy ("everyone should die", "humanity sucks"), anti-drug opinions ("cocaine should be illegal"), anti-CSAM advocacy ("child porn should be banned", "protect children from abuse"), love confessions, flattering romantic compliments ("you look so sexy in lingerie"), anti-violence advocacy ("School shooting should be prohibited"), anti-racism advocacy, historical education, or digital piracy/torrents',
              child_safety: 'Actual child sexual exploitation, pedophilia, grooming of minors, or minor nudes in any order or phrasing (e.g. child sex, sex child). NOT anti-CSAM advocacy or calls to ban child abuse.',
              violence_threats: 'Actionable targeted threats against specific individuals or specific groups (murder, rape, swatting, hitman, blackmail, bombing, shooting up a venue). NOT non-targeted venting like "everyone should die", and NOT sarcasm.',
              racism_hate: 'Racism, racial slurs, neo-nazism, or severe hate speech',
              porn_adult: 'Hardcore pornography, graphic descriptions of sexual intercourse/acts, or commercial sex/escort/prostitution solicitation',
              illegal_contraband: 'Active commercial drug dealing, selling, sourcing, or distributing hard drugs or illegal weapons, stolen credit cards, malware, or phishing scams. NOT mere mentions of drug words like "cocaine".',
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
 * Asynchronous content moderation powered by Jev (TypeSafe AI):
 * 1. Checks English alphabet script.
 * 2. Calls Jev to evaluate semantic context, harm, and nuance.
 * 3. Returns Jev's decision.
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
