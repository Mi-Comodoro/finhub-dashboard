import { ACCESS_TOKEN, ACCOUNT_TYPE, REFRESH_TOKEN, TOKEN_EXPIRES_AT } from '~/common/constants'
import type { AuthResponse } from '~/types/auth'

import { validateError } from '../utils/auth.error'
import {
  getCookieOptions,
  getRefreshCookieOptions,
  REFRESH_COOKIE_PATH
} from '../utils/cookie-options'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  deleteCookie(event, ACCESS_TOKEN)
  deleteCookie(event, REFRESH_TOKEN, { path: REFRESH_COOKIE_PATH })
  deleteCookie(event, ACCOUNT_TYPE)
  deleteCookie(event, TOKEN_EXPIRES_AT)

  const response = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/signup`, {
    method: 'POST',
    body,
    onResponseError: ({ response }) => {
      const backendData = response._data as { message?: string | string[]; error?: string } | null
      const raw = backendData?.message
      const message = Array.isArray(raw) ? raw.join('. ') : (raw ?? null)

      // Closed beta: no valid invitation for this email
      if (response.status === 403 && backendData?.error === 'BetaInviteRequired') {
        throw createError({
          statusCode: 403,
          message: message ?? 'El registro es solo por invitación durante la beta cerrada.',
          data: { code: 'BETA_INVITE_REQUIRED' }
        })
      }

      if (response.status === 409) {
        throw createError({ statusCode: 409, message: message ?? 'Este correo ya está registrado' })
      }

      validateError(event, response.status, message ?? undefined)
    }
  })

  const { token, refreshToken, accountType, expiresAt } = response.data

  setCookie(event, ACCESS_TOKEN, token, getCookieOptions(event))
  setCookie(event, REFRESH_TOKEN, refreshToken, getRefreshCookieOptions(event))
  setCookie(event, ACCOUNT_TYPE, accountType, getCookieOptions(event))
  setCookie(event, TOKEN_EXPIRES_AT, String(expiresAt), getCookieOptions(event))

  return { success: response.success, result: response.data }
})
