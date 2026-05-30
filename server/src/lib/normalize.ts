/** Normalize item names for deduplication within a household. */
export function normalizeItemName(name: string): string {
  let normalized = name.trim().toLowerCase().replace(/\s+/g, ' ')
  if (normalized.endsWith('ies') && normalized.length > 4) {
    normalized = normalized.slice(0, -3) + 'y'
  } else if (normalized.endsWith('es') && normalized.length > 3) {
    normalized = normalized.slice(0, -2)
  } else if (normalized.endsWith('s') && !normalized.endsWith('ss') && normalized.length > 2) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

export function displayItemName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (!trimmed) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
