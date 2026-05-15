import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: {
      displayName: string
      phone?: string
      gender?: string
      country?: string
    }
  }>(`${config.public.apiBase}/users/me`, {
    method: 'PATCH',
    body,
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
