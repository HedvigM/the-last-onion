#!/usr/bin/env node
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const dist = join(__dirname, 'dist')
const port = Number(process.env.PORT ?? 8080)

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
}

function resolvePath(urlPath) {
  const relative = decodeURIComponent(urlPath).replace(/^\/+/, '')
  if (!relative) return join(dist, 'index.html')

  const candidate = join(dist, relative)
  if (!candidate.startsWith(dist)) return join(dist, 'index.html')
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate

  return join(dist, 'index.html')
}

createServer((req, res) => {
  const urlPath = req.url?.split('?')[0] ?? '/'
  const filePath = resolvePath(urlPath)

  try {
    const data = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': mime[extname(filePath)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(port, () => {
  console.log(`Serving on port ${port}`)
})
