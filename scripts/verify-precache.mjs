#!/usr/bin/env node
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const swPath = join(root, 'dist', 'sw.js')

if (!existsSync(swPath)) {
  console.error('dist/sw.js not found — run npm run build-only first')
  process.exit(1)
}

const sw = readFileSync(swPath, 'utf8')
const urls = [...new Set([...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]))]

const routeChunkPattern = /View-|MarketingShell-|LanguageToggle-|useCategoryLabel-|lists-/
const routeChunks = urls.filter((url) => routeChunkPattern.test(url))

let totalBytes = 0
for (const url of urls) {
  const filePath = join(root, 'dist', url)
  if (!existsSync(filePath)) {
    console.error(`precache entry missing from dist: ${url}`)
    process.exit(1)
  }
  totalBytes += statSync(filePath).size
}

const maxBytes = 350 * 1024
const minBytes = 250 * 1024

if (routeChunks.length > 0) {
  console.error('route chunks should not be precached:', routeChunks.join(', '))
  process.exit(1)
}

if (totalBytes > maxBytes) {
  console.error(`precache too large: ${(totalBytes / 1024).toFixed(1)} KiB (max ${maxBytes / 1024} KiB)`)
  process.exit(1)
}

if (totalBytes < minBytes) {
  console.warn(`precache smaller than expected: ${(totalBytes / 1024).toFixed(1)} KiB`)
}

console.log(
  `precache ok: ${urls.length} unique entries, ${(totalBytes / 1024).toFixed(1)} KiB`,
)
