import { existsSync, statSync } from 'node:fs'
import { join, extname, resolve, relative, sep } from 'node:path'

export const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
}

function safeDecode(path) {
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

function isInsideDir(distRoot, candidate) {
  const rel = relative(distRoot, candidate)
  return rel !== '' && !rel.startsWith(`..${sep}`) && rel !== '..' && !rel.startsWith('..')
}

export function resolvePath(urlPath, distDir) {
  const distRoot = resolve(distDir)
  const relativePath = safeDecode(urlPath).replace(/^\/+/, '')

  if (!relativePath) return join(distRoot, 'index.html')

  const candidate = resolve(distRoot, relativePath)
  if (isInsideDir(distRoot, candidate) && existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate
  }

  return join(distRoot, 'index.html')
}

export function contentType(filePath) {
  return mime[extname(filePath)] ?? 'application/octet-stream'
}
