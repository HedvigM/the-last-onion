const LOCALHOST_ORIGIN = /^https?:\/\/localhost(:\d+)?$/
const LOCALHOST_IPV4_ORIGIN = /^https?:\/\/127\.0\.0\.1(:\d+)?$/

function parseAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim()
  if (!raw) return []
  return raw.split(',').map((o) => o.trim()).filter(Boolean)
}

/** Returns true if the request origin is allowed. */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false

  const allowed = parseAllowedOrigins()
  if (allowed.includes(origin)) return true

  // In dev, Vite may use 5173, 5174, etc. when the default port is taken.
  if (process.env.NODE_ENV !== 'production') {
    return LOCALHOST_ORIGIN.test(origin) || LOCALHOST_IPV4_ORIGIN.test(origin)
  }

  return false
}

export function corsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow: boolean) => void,
) {
  if (!origin || isOriginAllowed(origin)) {
    callback(null, true)
    return
  }
  callback(new Error('Not allowed by CORS'), false)
}

export function socketCorsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  if (!origin || isOriginAllowed(origin)) {
    callback(null, true)
    return
  }
  callback(new Error('Not allowed by CORS'), false)
}
