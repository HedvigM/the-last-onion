#!/usr/bin/env node
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const dist = join(__dirname, 'dist')
const port = Number(process.env.PORT ?? 8080)

const mime: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

createServer((req, res) => {
  let path = req.url?.split('?')[0] ?? '/'
  if (path === '/') path = '/index.html'

  let filePath = join(dist, path)
  if (!existsSync(filePath) || !filePath.startsWith(dist)) {
    filePath = join(dist, 'index.html')
  }

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
