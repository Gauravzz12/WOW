/**
 * Pure TypeScript HTML Sanitizer
 * Strips all dangerous tags, scripts, event handlers, and styles.
 *
 * The allowlist mirrors exactly what RichTextEditor (Tiptap: StarterKit +
 * TextStyle + Color + FontFamily + multicolor Highlight) can produce, so
 * formatting visible in the compose preview survives to the live message:
 * - tags: p, span, mark, strong, b, em, i, s, strike, u, br,
 *         ul, ol, li, blockquote, code, pre
 * - styles: color, background-color (3/4/6/8-digit hex, rgb/a, hsl/a, words),
 *           font-family (editor values only), text-align
 */

const ALLOWED_TAGS = new Set([
  'p', 'span', 'mark', 'strong', 'b', 'em', 'i', 's', 'strike', 'u', 'br',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
])

// Font stacks the editor itself offers (see RichTextEditor FONTS) plus plain
// generic families for pasted content. Anything else is dropped.
const ALLOWED_FONT_FAMILIES = new Set([
  'var(--font-inter)',
  'var(--font-cormorant)',
  'var(--font-playfair)',
  'var(--font-outfit)',
  'var(--font-caveat)',
  'var(--font-cinzel)',
  'var(--font-space-mono)',
  'monospace',
  'serif',
  'sans-serif',
])

const COLOR_RE = /^(?:#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?%\s*,\s*\d+(?:\.\d+)?%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|[a-zA-Z]+)$/

// Only allow safe CSS properties: color, background-color, font-family, font-size, text-align
function sanitizeStyle(styleStr: string): string {
  if (!styleStr) return ''
  const declarations = styleStr.split(';')
  const safeDeclarations: string[] = []

  for (const decl of declarations) {
    // Split on the FIRST colon only — values may legally contain colons.
    const colonIdx = decl.indexOf(':')
    if (colonIdx === -1) continue
    const prop = decl.slice(0, colonIdx).trim().toLowerCase()
    const val = decl.slice(colonIdx + 1).trim()
    if (!prop || !val) continue

    if (prop === 'color' || prop === 'background-color') {
      if (COLOR_RE.test(val)) {
        safeDeclarations.push(`${prop}: ${val}`)
      }
    } else if (prop === 'font-family') {
      // Strict allowlist: strip quotes for comparison, keep canonical value.
      const normalized = val.replace(/["']/g, '').trim().toLowerCase()
      if (ALLOWED_FONT_FAMILIES.has(normalized)) {
        safeDeclarations.push(`${prop}: ${normalized}`)
      }
    } else if (prop === 'font-size') {
      // Allow sizes between 10px and 50px, or safe rem units (0.75rem to 3rem)
      const normalized = val.replace(/["']/g, '').trim().toLowerCase()
      if (/^(?:[1-4][0-9]|50)px$/.test(normalized) || /^(?:0\.[7-9]|[1-3](?:\.[0-9]+)?)rem$/.test(normalized)) {
        safeDeclarations.push(`${prop}: ${normalized}`)
      }
    } else if (prop === 'text-align') {
      if (/^(?:left|center|right|justify)$/.test(val)) {
        safeDeclarations.push(`${prop}: ${val}`)
      }
    }
  }

  return safeDeclarations.join('; ')
}

export function sanitizeHtmlText(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return ''

  // 1. Remove dangerous blocks and their content completely
  let clean = dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')

  // 2. Remove all event handlers (onload, onerror, onclick, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')

  // 3. Remove javascript: or data: URIs
  clean = clean.replace(/(?:href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '')

  // 4. Tag Whitelisting and Attribute Cleaning
  clean = clean.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) {
      // Strip disallowed tags entirely
      return ''
    }

    if (match.startsWith('</')) {
      return `</${tag}>`
    }

    if (tag === 'br') {
      return '<br />'
    }

    // Extract allowed attributes: class and style
    let cleanedAttrs = ''

    // Check class attribute
    const classMatch = attrs.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    if (classMatch) {
      const classVal = (classMatch[1] || classMatch[2] || classMatch[3] || '').trim()
      // Only allow safe alphanumeric class characters, dashes, colons (tailwind)
      const safeClass = classVal.replace(/[^a-zA-Z0-9\s:_-]/g, '').slice(0, 100)
      if (safeClass) {
        cleanedAttrs += ` class="${safeClass}"`
      }
    }

    // Check style attribute
    const styleMatch = attrs.match(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    if (styleMatch) {
      const rawStyle = styleMatch[1] || styleMatch[2] || styleMatch[3] || ''
      const safeStyle = sanitizeStyle(rawStyle)
      if (safeStyle) {
        cleanedAttrs += ` style="${safeStyle}"`
      }
    }

    return `<${tag}${cleanedAttrs}>`
  })

  return clean.trim()
}
