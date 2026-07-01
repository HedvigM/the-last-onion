import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolvePath } from './serve-utils.js'

const dist = join(fileURLToPath(new URL('.', import.meta.url)), 'dist')
const indexHtml = join(dist, 'index.html')

if (!existsSync(indexHtml)) {
  throw new Error('dist/ not found — run npm run build-only before npm run test:serve')
}

test('SPA fallback serves index.html for invite deep links', () => {
  assert.equal(resolvePath('/invite/test-token-abc', dist), indexHtml)
})

test('SPA fallback serves index.html for other client routes', () => {
  assert.equal(resolvePath('/lists/some-id', dist), indexHtml)
  assert.equal(resolvePath('/settings/categories', dist), indexHtml)
})

test('path traversal attempts fall back to index.html', () => {
  assert.equal(resolvePath('/../../../etc/passwd', dist), indexHtml)
  assert.equal(resolvePath('/%2e%2e%2f%2e%2e%2fetc/passwd', dist), indexHtml)
})

test('static assets are served as real files', () => {
  const mainJs = readdirSync(join(dist, 'assets')).find(
    (name) => name.startsWith('index-') && name.endsWith('.js'),
  )
  assert.ok(mainJs, 'expected built main bundle in dist/assets')

  const assetPath = join(dist, 'assets', mainJs)
  assert.equal(resolvePath(`/assets/${mainJs}`, dist), assetPath)
})

test('root path serves index.html', () => {
  assert.equal(resolvePath('/', dist), indexHtml)
})
