const PENDING_INVITE_KEY = 'pendingInviteToken'

export function setPendingInvite(token: string) {
  localStorage.setItem(PENDING_INVITE_KEY, token)
}

export function getPendingInvite(): string | null {
  return localStorage.getItem(PENDING_INVITE_KEY)
}

export function clearPendingInvite() {
  localStorage.removeItem(PENDING_INVITE_KEY)
}

export function getPendingInvitePath(): string | null {
  const token = getPendingInvite()
  return token ? `/invite/${token}` : null
}

export function parseInviteTokenFromPath(path: string): string | null {
  const match = path.match(/^\/invite\/([^/?#]+)/)
  return match?.[1] ?? null
}

export function isSafeRedirect(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//')
}
