#!/usr/bin/env node
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolvePath, contentType } from './serve-utils.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const dist = join(__dirname, 'dist')
const port = Number(process.env.PORT ?? 8080)

createServer((req, res) => {
  const urlPath = req.url?.split('?')[0] ?? '/'
  const filePath = resolvePath(urlPath, dist)

  try {
    const data = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': contentType(filePath) })
    res.end(data)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(port, () => {
  console.log(`Serving on port ${port}`)
})
