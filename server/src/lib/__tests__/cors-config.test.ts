import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isOriginAllowed } from '../cors-config.js'

describe('isOriginAllowed', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.CORS_ORIGIN
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('allows any localhost port in development', () => {
    process.env.NODE_ENV = 'development'
    expect(isOriginAllowed('http://localhost:5173')).toBe(true)
    expect(isOriginAllowed('http://localhost:5174')).toBe(true)
    expect(isOriginAllowed('http://127.0.0.1:5174')).toBe(true)
  })

  it('allows explicit CORS_ORIGIN in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.CORS_ORIGIN = 'https://app.example.com'
    expect(isOriginAllowed('https://app.example.com')).toBe(true)
    expect(isOriginAllowed('http://localhost:5174')).toBe(false)
  })

  it('allows comma-separated origins in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.CORS_ORIGIN = 'https://a.example.com,https://b.example.com'
    expect(isOriginAllowed('https://b.example.com')).toBe(true)
  })
})
