import { ACCESS_TOKEN, ACCOUNT_TYPE, REFRESH_TOKEN, TOKEN_EXPIRES_AT } from '~/common/constants'

import { logoutError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) {
    deleteCookie(event, ACCESS_TOKEN)
    deleteCookie(event, REFRESH_TOKEN)
    deleteCookie(event, ACCOUNT_TYPE)
    deleteCookie(event, TOKEN_EXPIRES_AT)

    return {
      success: true,
      result: {
        message: 'Logout successful'
      }
    }
  }

  const response = await $fetch<{
    success: boolean
    data: {
      message: string
    }
  }>(`${config.public.apiBase}/auth/logout`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`
    },
    onResponseError: ({ response }) => {
      logoutError(event, response.status)
    }
  })

  deleteCookie(event, ACCESS_TOKEN)
  deleteCookie(event, REFRESH_TOKEN)
  deleteCookie(event, ACCOUNT_TYPE)
  deleteCookie(event, TOKEN_EXPIRES_AT)

  return {
    success: response.success,
    result: response.data
  }
})
