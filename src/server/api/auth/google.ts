import { ACCESS_TOKEN, ACCOUNT_TYPE, COOKIE_OPTIONS } from '~/common/constants'
import type { AuthResponse } from '~/types/auth'

import { loginError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  deleteCookie(event, ACCESS_TOKEN)
  deleteCookie(event, ACCOUNT_TYPE)

  const response = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/google`, {
    method: 'POST',
    body,
    onResponseError: ({ response }) => {
      loginError(response.status)
    }
  })

  const { token, accountType } = response.data

  setCookie(event, ACCESS_TOKEN, token, COOKIE_OPTIONS)
  setCookie(event, ACCOUNT_TYPE, accountType, COOKIE_OPTIONS)
  return { success: response.success, result: response.data }
})
