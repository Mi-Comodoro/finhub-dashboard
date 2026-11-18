import { ACCESS_TOKEN, REFRESH_TOKEN, TOKEN_EXPIRES_AT } from '~/common/constants'
import type { RefreshResponse } from '~/types/auth'

import { validateError } from '../utils/auth.error'
import { getCookieOptions, getRefreshCookieOptions } from '../utils/cookie-options'

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
    setCookie(event, ACCESS_TOKEN, response.data.token, getCookieOptions(event))
    setCookie(event, REFRESH_TOKEN, response.data.refreshToken, getRefreshCookieOptions(event))
    setCookie(event, TOKEN_EXPIRES_AT, String(response.data.expiresAt), getCookieOptions(event))
  }

  return { success: response.success, result: response.data }
})
