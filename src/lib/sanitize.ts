/**
 * Pure TypeScript HTML Sanitizer
 * Strips all dangerous tags, scripts, event handlers, and styles.
 * Only allows safe text formatting tags: p, span, strong, b, em, i, s, strike, u, br.
 */

const ALLOWED_TAGS = new Set([
  'p', 'span', 'strong', 'b', 'em', 'i', 's', 'strike', 'u', 'br'
])

// Only allow safe CSS properties: color, background-color, text-align
function sanitizeStyle(styleStr: string): string {
  if (!styleStr) return ''
  const declarations = styleStr.split(';')
  const safeDeclarations: string[] = []

  for (const decl of declarations) {
    const [rawProp, rawVal] = decl.split(':')
    if (!rawProp || !rawVal) continue
    const prop = rawProp.trim().toLowerCase()
    const val = rawVal.trim()

    if (prop === 'color' || prop === 'background-color') {
      // Validate color is hex, rgb, rgba, hsl, or standard word
      if (/^#(?:[0-9a-fA-F]{3}){1,2}$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$|^[a-zA-Z]+$/.test(val)) {
        safeDeclarations.push(`${prop}: ${val}`)
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
