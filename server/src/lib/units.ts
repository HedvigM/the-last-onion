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

export function isUnit(value: string): value is Unit {
  return (UNITS as readonly string[]).includes(value)
}
