import { existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

export const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
}

export function resolvePath(urlPath, distDir) {
  const relative = decodeURIComponent(urlPath).replace(/^\/+/, '')
  if (!relative) return join(distDir, 'index.html')

  const candidate = join(distDir, relative)
  if (!candidate.startsWith(distDir)) return join(distDir, 'index.html')
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate

  return join(distDir, 'index.html')
}

export function contentType(filePath) {
  return mime[extname(filePath)] ?? 'application/octet-stream'
}
