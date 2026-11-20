import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

/**
 * Entrega al navegador un token de vida corta (60 s) y de un solo propósito para el
 * handshake del WebSocket. El access token nunca sale de la cookie httpOnly.
 */
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { data } = await $fetch<{ success: boolean; data: { token: string } }>(
    `${config.public.apiBase}/auth/ws-token`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { token: data.token }
})
