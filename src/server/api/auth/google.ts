import { ACCESS_TOKEN, ACCOUNT_TYPE, REFRESH_TOKEN, TOKEN_EXPIRES_AT } from '~/common/constants'
import type { AuthResponse } from '~/types/auth'

import { loginError } from '../utils/auth.error'
import {
  getCookieOptions,
  getRefreshCookieOptions,
  REFRESH_COOKIE_PATH
} from '../utils/cookie-options'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const payload = body?.data

  if (!payload?.idToken || !payload?.name) {
    throw createError({ statusCode: 400, message: 'data.idToken y data.name son requeridos' })
  }

  deleteCookie(event, ACCESS_TOKEN)
  deleteCookie(event, REFRESH_TOKEN, { path: REFRESH_COOKIE_PATH })
  deleteCookie(event, ACCOUNT_TYPE)
  deleteCookie(event, TOKEN_EXPIRES_AT)

  const backendBody = {
    data: {
      idToken: payload.idToken,
      name: payload.name,
      ...(payload.rejectPhoto ? { rejectPhoto: true } : {})
    }
  }

  const response = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/google`, {
    method: 'POST',
    body: backendBody,
    onResponseError: ({ response }) => {
      console.error('❌ Error del backend en /auth/google:', response.status, response.statusText)
      loginError(response.status)
    }
  })

  const { token, refreshToken, accountType, expiresAt } = response.data

  setCookie(event, ACCESS_TOKEN, token, getCookieOptions(event))
  setCookie(event, REFRESH_TOKEN, refreshToken, getRefreshCookieOptions(event))
  setCookie(event, ACCOUNT_TYPE, accountType, getCookieOptions(event))
  setCookie(event, TOKEN_EXPIRES_AT, String(expiresAt), getCookieOptions(event))

  return { success: response.success, result: response.data }
})
