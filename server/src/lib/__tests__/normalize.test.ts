import { describe, it, expect } from 'vitest'
import { normalizeItemName, displayItemName } from '../normalize.js'
import { guessCategoryKey } from '../categories.js'

describe('normalizeItemName', () => {
  it('lowercases and trims', () => {
    expect(normalizeItemName('  Carrots  ')).toBe('carrot')
  })

  it('strips simple plurals', () => {
    expect(normalizeItemName('carrots')).toBe('carrot')
    expect(normalizeItemName('tomatoes')).toBe('tomato')
    expect(normalizeItemName('berries')).toBe('berry')
  })

  it('deduplicates carrot and carrots to same key', () => {
    expect(normalizeItemName('carrot')).toBe(normalizeItemName('carrots'))
  })
})

describe('displayItemName', () => {
  it('capitalizes first letter', () => {
    expect(displayItemName('carrots')).toBe('Carrots')
  })
})

describe('guessCategoryKey', () => {
  it('assigns vegetables', () => {
    expect(guessCategoryKey('carrots')).toBe('vegetables')
    expect(guessCategoryKey('onion')).toBe('vegetables')
  })

  it('assigns dairy', () => {
    expect(guessCategoryKey('milk')).toBe('dairy')
  })

  it('falls back to other', () => {
    expect(guessCategoryKey('xyzunknown')).toBe('other')
  })
})
