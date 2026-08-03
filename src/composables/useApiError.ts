const ERROR_KEY_MAP: Record<string, string> = {
  'Invalid credentials': 'errors.invalidCredentials',
  'Email already registered': 'errors.emailAlreadyRegistered',
  'Invite not found': 'errors.inviteNotFound',
  'Invalid or expired invite': 'errors.invalidOrExpiredInvite',
  'List not found': 'errors.listNotFound',
  'Item not found': 'errors.itemNotFound',
  'Category not found': 'errors.categoryNotFound',
  'User not found': 'errors.userNotFound',
  'Unauthorized': 'errors.unauthorized',
  'Validation error': 'errors.validationError',
  'Internal server error': 'errors.internalServerError',
  'Request failed': 'errors.requestFailed',
  'No internet connection': 'errors.noInternet',
  'Request timed out': 'errors.requestTimedOut',
  'Registration failed': 'errors.registrationFailed',
  'Login failed': 'errors.loginFailed',
  'Failed to send invite': 'errors.failedToSendInvite',
  'Could not load invite': 'errors.couldNotLoadInvite',
  'Failed to accept invite': 'errors.failedToAcceptInvite',
  'Failed to pin item': 'errors.failedToPinItem',
}

export function translateApiError(message: string, t: (key: string) => string): string {
  const key = ERROR_KEY_MAP[message]
  if (key) return t(key)
  return message
}
