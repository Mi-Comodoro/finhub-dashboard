import { ACCESS_TOKEN, ACCOUNT_TYPE, COOKIE_OPTIONS, TOKEN_EXPIRES_AT } from '~/common/constants'
import type { AuthResponse } from '~/types/auth'

import { loginError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const payload = body?.data

  if (!payload?.idToken || !payload?.name) {
    throw createError({ statusCode: 400, message: 'data.idToken y data.name son requeridos' })
  }

  deleteCookie(event, ACCESS_TOKEN)
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

  const { token, accountType, expiresAt } = response.data

  setCookie(event, ACCESS_TOKEN, token, COOKIE_OPTIONS)
  setCookie(event, ACCOUNT_TYPE, accountType, COOKIE_OPTIONS)
  setCookie(event, TOKEN_EXPIRES_AT, String(expiresAt), COOKIE_OPTIONS)

  return { success: response.success, result: response.data }
})
