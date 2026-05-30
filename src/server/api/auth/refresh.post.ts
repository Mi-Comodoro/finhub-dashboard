import {
  ACCESS_TOKEN,
  COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN,
  TOKEN_EXPIRES_AT
} from '~/common/constants'
import type { RefreshResponse } from '~/types/auth'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const refreshTokenValue = getCookie(event, REFRESH_TOKEN)

  if (!refreshTokenValue) {
    throw createError({ statusCode: 401, message: 'No refresh token found' })
  }

  const response = await $fetch<{
    success: boolean
    data: RefreshResponse
  }>(`${config.public.apiBase}/auth/refresh`, {
    method: 'POST',
    body: { refreshToken: refreshTokenValue },
    onResponseError: ({ response }) => validateError(event, response.status)
  })

  if (response.success && response.data?.token) {
    setCookie(event, ACCESS_TOKEN, response.data.token, COOKIE_OPTIONS)
    setCookie(event, REFRESH_TOKEN, response.data.refreshToken, REFRESH_COOKIE_OPTIONS)
    setCookie(event, TOKEN_EXPIRES_AT, String(response.data.expiresAt), COOKIE_OPTIONS)
  }

  return { success: response.success, result: response.data }
})
