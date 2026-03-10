export const ACCESS_TOKEN = 'access-token'
export const ACCOUNT_TYPE = 'account-type'

// Client-accessible user data storage (non-sensitive)
export const USER_DATA = 'user-data'
export const SESSION_STATE = 'session-state'

// Session duration: 24 hours in milliseconds
export const SESSION_DURATION = 24 * 60 * 60 * 1000

export const COOKIE_OPTIONS = {
  httpOnly: true, // Secure - tokens not accessible via JavaScript
  sameSite: 'strict',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: SESSION_DURATION / 1000 // Convert from milliseconds to seconds
} as const

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
