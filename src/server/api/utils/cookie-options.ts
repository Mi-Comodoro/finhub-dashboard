import type { H3Event } from 'h3'
import { getRequestProtocol } from 'h3'

import { COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '~/common/constants'

/** Path con el que se emite la cookie del refresh token (necesario también para borrarla). */
export const REFRESH_COOKIE_PATH = REFRESH_COOKIE_OPTIONS.path

/**
 * `secure` se activa en producción y también cuando la petición real llega por HTTPS
 * (p. ej. el entorno de desarrollo desplegado detrás de un proxy, que respeta
 * X-Forwarded-Proto). Así las cookies de sesión no viajan por HTTP aunque NODE_ENV
 * no sea "production".
 */
const isSecureRequest = (event: H3Event) =>
  process.env.NODE_ENV === 'production' || getRequestProtocol(event) === 'https'

export const getCookieOptions = (event: H3Event) => ({
  ...COOKIE_OPTIONS,
  secure: isSecureRequest(event)
})

export const getRefreshCookieOptions = (event: H3Event) => ({
  ...REFRESH_COOKIE_OPTIONS,
  secure: isSecureRequest(event)
})
