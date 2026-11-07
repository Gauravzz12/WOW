// Single source of truth for the site's public URL.
// Set NEXT_PUBLIC_APP_URL (legacy alias: NEXT_PUBLIC_SITE_URL) in the deployment environment (e.g. Vercel) when a
// custom domain is connected; until then this falls back to the live Vercel
// domain. Never hardcode a domain anywhere else — import this instead.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://wow-murex-nu.vercel.app'
).replace(/\/+$/, '')
