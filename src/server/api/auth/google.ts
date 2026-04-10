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

  console.log('🔐 Iniciando autenticación con Google...')

  const response = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/google`, {
    method: 'POST',
    body,
    onResponseError: ({ response }) => {
      console.error('❌ Error del backend en /auth/google:', response.status, response.statusText)
      loginError(response.status)
    }
  })

  const { token, accountType, expiresAt } = response.data

  console.log('✅ Respuesta del backend recibida, estableciendo cookies...')

  setCookie(event, ACCESS_TOKEN, token, COOKIE_OPTIONS)
  setCookie(event, ACCOUNT_TYPE, accountType, COOKIE_OPTIONS)
  setCookie(event, TOKEN_EXPIRES_AT, String(expiresAt), COOKIE_OPTIONS)

  console.log('✅ Cookies establecidas correctamente')

  return { success: response.success, result: response.data }
})
