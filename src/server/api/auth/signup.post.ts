import {
  ACCESS_TOKEN,
  ACCOUNT_TYPE,
  COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN,
  TOKEN_EXPIRES_AT
} from '~/common/constants'
import type { AuthResponse } from '~/types/auth'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  deleteCookie(event, ACCESS_TOKEN)
  deleteCookie(event, REFRESH_TOKEN)
  deleteCookie(event, ACCOUNT_TYPE)
  deleteCookie(event, TOKEN_EXPIRES_AT)

  const response = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/signup`, {
    method: 'POST',
    body,
    onResponseError: ({ response }) => {
      const backendData = response._data as { message?: string | string[] } | null
      const raw = backendData?.message
      const message = Array.isArray(raw) ? raw.join('. ') : (raw ?? null)

      if (response.status === 409) {
        throw createError({ statusCode: 409, message: message ?? 'Este correo ya está registrado' })
      }

      validateError(event, response.status, message ?? undefined)
    }
  })

  const { token, refreshToken, accountType, expiresAt } = response.data

  setCookie(event, ACCESS_TOKEN, token, COOKIE_OPTIONS)
  setCookie(event, REFRESH_TOKEN, refreshToken, REFRESH_COOKIE_OPTIONS)
  setCookie(event, ACCOUNT_TYPE, accountType, COOKIE_OPTIONS)
  setCookie(event, TOKEN_EXPIRES_AT, String(expiresAt), COOKIE_OPTIONS)

  return { success: response.success, result: response.data }
})
