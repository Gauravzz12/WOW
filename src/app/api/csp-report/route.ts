import { NextRequest } from 'next/server'

/**
 * CSP violation report collector.
 *
 * The site's Content-Security-Policy ships in Report-Only mode (see
 * next.config.mjs). Until now violations surfaced only in each visitor's
 * browser console — nobody ever saw them. Browsers now POST reports here
 * (legacy `report-uri` format and the modern Reporting API format), and
 * each report is written to the function log as one structured line:
 *
 *   [csp-report] {"directive":"script-src","blocked":"inline","document":"https://…/create",…}
 *
 * Search Vercel function logs for "[csp-report]" to review real-world
 * violations before the policy is flipped from Report-Only to enforcing.
 *
 * Deliberately unauthenticated (browsers send these reports without
 * credentials) and deliberately log-only: an unauthenticated endpoint
 * that wrote to the database would be a free spam/abuse sink. Always
 * answers 204 so a malformed or hostile report never causes noise.
 */

export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 64 * 1024

function pick(obj: any, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k]
    if (typeof v === 'string' && v.length > 0) return v.slice(0, 512)
    if (typeof v === 'number') return String(v)
  }
  return undefined
}

function logReport(raw: any) {
  // Legacy format: { "csp-report": { "document-uri": …, "blocked-uri": …, … } }
  // Reporting API:  [ { "type": "csp-violation", "url": …, "body": { "blockedURL": …, … } } ]
  const entries: any[] = Array.isArray(raw)
    ? raw.filter((e) => e && (e.type === 'csp-violation' || e.body))
    : raw?.['csp-report']
      ? [raw['csp-report']]
      : []

  for (const entry of entries.slice(0, 10)) {
    const body = entry.body || entry
    const summary = {
      directive: pick(body, 'violated-directive', 'effectiveDirective'),
      blocked: pick(body, 'blocked-uri', 'blockedURL'),
      document: pick(body, 'document-uri', 'documentURL') || pick(entry, 'url'),
      source: pick(body, 'source-file', 'sourceFile'),
      line: pick(body, 'line-number', 'lineNumber'),
      disposition: pick(body, 'disposition'),
    }
    console.log('[csp-report]', JSON.stringify(summary))
  }
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    if (text.length > 0 && text.length <= MAX_BODY_BYTES) {
      try {
        logReport(JSON.parse(text))
      } catch {
        // Not JSON (or not a shape we know) — nothing useful to record.
      }
    }
  } catch {
    // Reading the body failed — still answer 204 below.
  }
  return new Response(null, { status: 204 })
}
