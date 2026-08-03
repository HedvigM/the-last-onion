import { normalizeUnitAlias, type Unit } from './units'

export type PastedItem = {
  name: string
  quantity: number | null
  unit: Unit | null
}

const LIST_PREFIX = /^[-*•]\s+|^\d+[.)]\s+/

/** Markdown / Apple Notes checklist markers: `- [ ]`, `* [x]`, etc. */
function checkboxMarker(): RegExp {
  return /(?:^|\s)[-*•]\s+\[[ xX]?\]\s*/g
}

/** Unicode checkbox characters Notes may emit */
function unicodeCheckbox(): RegExp {
  return /(?:^|\s)[☐☑✓✔]\s*/g
}

const JUNK_LINES = new Set(
  [
    '×',
    'x',
    'other',
    'övrigt',
    'vegetables',
    'grönsaker',
    'fruits',
    'frukt',
    'dairy',
    'mejeri',
    'meat & fish',
    'meat_fish',
    'kött & fisk',
    'baking',
    'bakning',
    'pantry',
    'skafferi',
    'frozen',
    'fryst',
    'beverages',
    'drycker',
    'household',
    'hushåll',
  ].map((s) => s.toLowerCase()),
)

/**
 * Parse clipboard text into items with optional quantity/unit.
 * Supports newlines/tabs, Apple Notes checklists, Notion-style
 * ingredient/amount alternating lines, and recipe lines that put the
 * amount before the name ("5 dl Vetemjöl").
 */
export function parsePastedItems(text: string): PastedItem[] {
  const parts = splitIntoParts(text)
  const classified: Array<
    | { kind: 'ingredient'; name: string; quantity?: number; unit?: Unit | null }
    | { kind: 'quantity'; quantity: number; unit: Unit | null; raw: string }
  > = []

  for (const part of parts) {
    const cleaned = cleanItem(part)
    if (!cleaned) continue
    if (isJunkLine(cleaned)) continue

    const qty = parseQuantityLine(cleaned)
    if (qty) {
      classified.push({ kind: 'quantity', ...qty, raw: cleaned })
      continue
    }

    const leading = parseLeadingQuantity(cleaned)
    if (leading) {
      classified.push({ kind: 'ingredient', ...leading })
    } else {
      classified.push({ kind: 'ingredient', name: cleaned })
    }
  }

  const paired: PastedItem[] = []
  let pending: PastedItem | null = null

  function flushPending() {
    if (pending) {
      paired.push(pending)
      pending = null
    }
  }

  for (const entry of classified) {
    if (entry.kind === 'ingredient') {
      flushPending()
      pending = { name: entry.name, quantity: entry.quantity ?? null, unit: entry.unit ?? null }
    } else if (pending && pending.quantity == null) {
      pending.quantity = entry.quantity
      pending.unit = entry.unit
    } else {
      // Nothing to attach to — the line may be a count plus a name, like "2 ägg"
      const standalone = parseLeadingQuantity(entry.raw)
      if (standalone) {
        flushPending()
        pending = { ...standalone }
      }
    }
  }
  flushPending()

  return dedupeItems(paired)
}

function dedupeItems(items: PastedItem[]): PastedItem[] {
  const seen = new Map<string, PastedItem>()
  for (const item of items) {
    const key = item.name.toLowerCase()
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, item)
      continue
    }
    if (existing.quantity == null && item.quantity != null) {
      existing.quantity = item.quantity
      existing.unit = item.unit
    }
  }
  return [...seen.values()]
}

function splitIntoParts(text: string): string[] {
  const checkboxRe = checkboxMarker()
  const checkboxCount = (text.match(checkboxRe) ?? []).length
  if (checkboxCount >= 2) {
    return text.split(checkboxMarker())
  }

  const unicodeRe = unicodeCheckbox()
  const unicodeCount = (text.match(unicodeRe) ?? []).length
  if (unicodeCount >= 2) {
    return text.split(unicodeCheckbox())
  }

  return text.split(/[\r\n\t]+/)
}

function cleanItem(part: string): string {
  let cleaned = part.trim()
  cleaned = cleaned.replace(checkboxMarker(), '').trim()
  cleaned = cleaned.replace(unicodeCheckbox(), '').trim()
  cleaned = cleaned.replace(LIST_PREFIX, '').trim()
  cleaned = cleaned.replace(/^\[[ xX]?\]\s*/, '').trim()
  return cleaned
}

function isJunkLine(line: string): boolean {
  return JUNK_LINES.has(line.toLowerCase())
}

/** Number: 2, 2.5, 2,5, ½, 1⁄2, 1/2 — capture groups 1–5 feed `quantityFromMatch`. */
const NUMBER_SOURCE = String.raw`(?:(\d+)\s*[⁄/]\s*(\d+)|([½¼¾])|(\d+[.,]\d+)|(\d+))`
const LEADING_QUANTITY = new RegExp(`^${NUMBER_SOURCE}\\s*(.+)$`, 'u')
const LEADING_WORD = /^([a-zA-ZåäöÅÄÖ][a-zA-ZåäöÅÄÖ().]*)\s*(.*)$/u

function quantityFromMatch(match: RegExpMatchArray): number | null {
  let quantity: number
  if (match[1] && match[2]) {
    const den = Number(match[2])
    if (!den) return null
    quantity = Number(match[1]) / den
  } else if (match[3]) {
    const frac: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75 }
    quantity = frac[match[3]] ?? NaN
  } else if (match[4]) {
    quantity = Number(match[4].replace(',', '.'))
  } else {
    quantity = Number(match[5])
  }

  if (!Number.isFinite(quantity) || quantity < 0) return null
  return quantity
}

/**
 * Split recipe-style lines that put the amount before the name — "5 dl Vetemjöl",
 * "50 g Smör", "2 ägg" — into a quantity and the ingredient name.
 */
export function parseLeadingQuantity(
  line: string,
): { name: string; quantity: number; unit: Unit | null } | null {
  const match = line.trim().match(LEADING_QUANTITY)
  if (!match) return null

  const quantity = quantityFromMatch(match)
  if (quantity == null) return null

  let rest = (match[6] ?? '').trim()
  // Only an amount, no name — "2 dl", "1liten(t)/små"
  if (normalizeUnitAlias(rest)) return null

  let unit: Unit | null = null

  const word = rest.match(LEADING_WORD)
  if (word) {
    const candidate = normalizeUnitAlias(word[1] ?? '')
    // A unit with nothing after it is a plain amount line, not an ingredient
    if (candidate && (word[2] ?? '').trim()) {
      unit = candidate
      rest = (word[2] ?? '').trim()
    }
  }

  if (!rest || !/[a-zA-ZåäöÅÄÖ]/u.test(rest)) return null
  return { name: rest, quantity, unit }
}

/** Match lines that are primarily a quantity (+ optional unit), not ingredient names. */
export function parseQuantityLine(
  line: string,
): { quantity: number; unit: Unit | null } | null {
  const trimmed = line.trim()
  const match = trimmed.match(new RegExp(`^${NUMBER_SOURCE}\\s*([a-zA-ZåäöÅÄÖ().]+)?`, 'u'))
  if (!match) return null

  // Must consume most of the line (allow trailing descriptive fluff after comma/space)
  const consumed = match[0]
  const rest = trimmed.slice(consumed.length).trim()
  if (rest && !/^[,;/–-]\s*/.test(rest) && !/^(liten|små|stor)/i.test(rest)) {
    // Significant leftover text → treat as ingredient (e.g. "2 percent milk", "1 dl te")
    if (/[a-zA-ZåäöÅÄÖ]{2,}/.test(rest) && !normalizeUnitAlias(rest.split(/[\s,]/)[0] ?? '')) {
      return null
    }
  }

  const quantity = quantityFromMatch(match)
  if (quantity == null) return null

  const rawUnit = (match[6] ?? '').replace(/[()]/g, '')
  // Also try full token including parentheses form before stripping
  const unit =
    normalizeUnitAlias(match[6] ?? '') ??
    normalizeUnitAlias(rawUnit) ??
    null

  // Line must look like a qty line: number alone, or number+unit-ish, not a long name
  const looksLikeQty =
    !match[6] ||
    unit != null ||
    /^(liten|små|stor)/i.test(match[6]) ||
    match[6].length <= 12

  if (!looksLikeQty) return null

  // "1liten(t)/små" style — unit from liten alias
  let resolvedUnit = unit
  if (!resolvedUnit && match[6]) {
    const lower = match[6].toLowerCase()
    if (lower.includes('liten') || lower.includes('små')) resolvedUnit = 'st'
  }

  return { quantity, unit: resolvedUnit }
}
