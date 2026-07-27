import { describe, it, expect } from 'vitest'
import { parsePastedItems, parseQuantityLine } from '../parsePastedItems'

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

describe('parsePastedItems', () => {
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
