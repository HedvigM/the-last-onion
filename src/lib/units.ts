export const UNITS = [
  'st',
  'g',
  'kg',
  'ml',
  'dl',
  'l',
  'tsk',
  'msk',
  'knippe',
  'klyfta',
  'forp',
] as const

export type Unit = (typeof UNITS)[number]

const UNIT_ALIASES: Record<string, Unit> = {
  st: 'st',
  styck: 'st',
  'st.': 'st',
  pcs: 'st',
  pc: 'st',
  piece: 'st',
  pieces: 'st',
  liten: 'st',
  'liten(t)': 'st',
  'liten(t)/små': 'st',
  små: 'st',
  g: 'g',
  gram: 'g',
  gr: 'g',
  kg: 'kg',
  kilo: 'kg',
  ml: 'ml',
  dl: 'dl',
  l: 'l',
  liter: 'l',
  litre: 'l',
  tsk: 'tsk',
  tesked: 'tsk',
  tsp: 'tsk',
  msk: 'msk',
  matsked: 'msk',
  tbsp: 'msk',
  knippe: 'knippe',
  'knippe(n)': 'knippe',
  klyfta: 'klyfta',
  'klyfta(or)': 'klyfta',
  forp: 'forp',
  förp: 'forp',
  forpackning: 'forp',
  förpackning: 'forp',
  pack: 'forp',
  pkg: 'forp',
}

/** Normalize a raw unit token from paste or UI to a stored unit value. */
export function normalizeUnitAlias(raw: string): Unit | null {
  const key = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
  if (!key) return null
  if ((UNITS as readonly string[]).includes(key)) return key as Unit
  return UNIT_ALIASES[key] ?? null
}

export function isUnit(value: string): value is Unit {
  return (UNITS as readonly string[]).includes(value)
}
