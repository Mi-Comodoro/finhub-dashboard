import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const financeId = getRouterParam(event, 'financeId')
  const body = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  if (!financeId) {
    throw createError({ statusCode: 400, message: 'financeId es requerido' })
  }

  const { success, data } = await $fetch<{ success: boolean; data: { profile: string } }>(
    `${config.public.apiBase}/finances/${financeId}`,
    {
      method: 'PATCH',
      body,
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
