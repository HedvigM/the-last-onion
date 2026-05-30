import { describe, it, expect } from 'vitest'
import { normalizeItemName, displayItemName } from '../normalize.js'
import { guessCategoryName } from '../categories.js'

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

describe('guessCategoryName', () => {
  it('assigns vegetables', () => {
    expect(guessCategoryName('carrots')).toBe('Vegetables')
    expect(guessCategoryName('onion')).toBe('Vegetables')
  })

  it('assigns dairy', () => {
    expect(guessCategoryName('milk')).toBe('Dairy')
  })

  it('falls back to Other', () => {
    expect(guessCategoryName('xyzunknown')).toBe('Other')
  })
})
