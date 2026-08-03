import { describe, it, expect } from 'vitest'
import { parseLeadingQuantity, parsePastedItems, parseQuantityLine } from '../parsePastedItems'

describe('parseQuantityLine', () => {
  it('parses common Swedish amounts', () => {
    expect(parseQuantityLine('2dl')).toEqual({ quantity: 2, unit: 'dl' })
    expect(parseQuantityLine('270g')).toEqual({ quantity: 270, unit: 'g' })
    expect(parseQuantityLine('1msk')).toEqual({ quantity: 1, unit: 'msk' })
    expect(parseQuantityLine('1klyfta(or)')).toEqual({ quantity: 1, unit: 'klyfta' })
    expect(parseQuantityLine('1knippe(n)')).toEqual({ quantity: 1, unit: 'knippe' })
    expect(parseQuantityLine('1⁄2st, liten')).toEqual({ quantity: 0.5, unit: 'st' })
    expect(parseQuantityLine('1liten(t)/små')).toEqual({ quantity: 1, unit: 'st' })
  })

  it('does not treat ingredient names as quantities', () => {
    expect(parseQuantityLine('Svart ris')).toBeNull()
    expect(parseQuantityLine('Tofu, fast')).toBeNull()
  })
})

describe('parseLeadingQuantity', () => {
  it('splits amounts written before the ingredient', () => {
    expect(parseLeadingQuantity('5 dl Vetemjöl')).toEqual({
      name: 'Vetemjöl',
      quantity: 5,
      unit: 'dl',
    })
    expect(parseLeadingQuantity('0,5 tsk Salt')).toEqual({
      name: 'Salt',
      quantity: 0.5,
      unit: 'tsk',
    })
    expect(parseLeadingQuantity('50g Smör')).toEqual({ name: 'Smör', quantity: 50, unit: 'g' })
    expect(parseLeadingQuantity('½ dl grädde')).toEqual({
      name: 'grädde',
      quantity: 0.5,
      unit: 'dl',
    })
  })

  it('keeps unrecognized words as part of the name', () => {
    expect(parseLeadingQuantity('1 stor gul lök')).toEqual({
      name: 'stor gul lök',
      quantity: 1,
      unit: null,
    })
  })

  it('returns null for lines that are only an amount', () => {
    expect(parseLeadingQuantity('2 dl')).toBeNull()
    expect(parseLeadingQuantity('270g')).toBeNull()
    expect(parseLeadingQuantity('Svart ris')).toBeNull()
  })
})

describe('parsePastedItems', () => {
  it('reads recipe lines with the amount in front of the name', () => {
    const text = [
      '5 dl Vetemjöl',
      '2 dl Mjölk',
      '50 g Smör',
      '2 tsk Bakpulver',
      '0,5 tsk Salt',
    ].join('\n')

    expect(parsePastedItems(text)).toEqual([
      { name: 'Vetemjöl', quantity: 5, unit: 'dl' },
      { name: 'Mjölk', quantity: 2, unit: 'dl' },
      { name: 'Smör', quantity: 50, unit: 'g' },
      { name: 'Bakpulver', quantity: 2, unit: 'tsk' },
      { name: 'Salt', quantity: 0.5, unit: 'tsk' },
    ])
  })

  it('keeps a leading count that has no unit', () => {
    expect(parsePastedItems('2 ägg\n1 dl te')).toEqual([
      { name: 'ägg', quantity: 2, unit: null },
      { name: 'te', quantity: 1, unit: 'dl' },
    ])
  })

  it('pairs Notion-style ingredient and amount lines', () => {
    const text = [
      'Svart ris',
      'Övrigt',
      '×',
      '2dl',
      'Övrigt',
      '×',
      'Tofu, fast',
      'Övrigt',
      '×',
      '270g',
      'Övrigt',
      '×',
      'Sesamfrön',
    ].join('\n')

    expect(parsePastedItems(text)).toEqual([
      { name: 'Svart ris', quantity: 2, unit: 'dl' },
      { name: 'Tofu, fast', quantity: 270, unit: 'g' },
      { name: 'Sesamfrön', quantity: null, unit: null },
    ])
  })

  it('still parses Notes checklists', () => {
    expect(parsePastedItems('- [ ] Hej - [ ] Hej2')).toEqual([
      { name: 'Hej', quantity: null, unit: null },
      { name: 'Hej2', quantity: null, unit: null },
    ])
  })
})
