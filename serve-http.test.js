import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
let server
let baseUrl

function request(path) {
  return fetch(`${baseUrl}${path}`)
}

before(async () => {
  const port = 18080 + Math.floor(Math.random() * 1000)
  baseUrl = `http://127.0.0.1:${port}`

  server = spawn('node', ['serve.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: 'pipe',
  })

  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const res = await request('/')
      if (res.ok) return
    } catch {
      // server still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error('serve.js did not start in time')
})

after(() => {
  server.kill('SIGTERM')
})

test('direct invite URL returns SPA shell with HTTP 200', async () => {
  const res = await request('/invite/test-token-abc')
  const body = await res.text()

  assert.equal(res.status, 200)
  assert.match(body, /<!DOCTYPE html>/i)
  assert.match(body, /id="app"/)
  assert.notEqual(body, 'Not found')
})

test('direct invite URL serves JavaScript assets', async () => {
  const htmlRes = await request('/invite/test-token-abc')
  const html = await htmlRes.text()
  const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/)
  assert.ok(match, 'expected main bundle script tag in index.html')

  const assetRes = await request(match[1])
  assert.equal(assetRes.status, 200)
  assert.match(assetRes.headers.get('content-type') ?? '', /javascript/)
})

test('unknown client routes still fall back to index.html', async () => {
  const res = await request('/lists/not-a-real-id')
  const body = await res.text()

  assert.equal(res.status, 200)
  assert.match(body, /<!DOCTYPE html>/i)
})
