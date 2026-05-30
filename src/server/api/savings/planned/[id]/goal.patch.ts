import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'id es requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const body = await readBody(event)

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/planned-savings/${id}/goal`,
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      body,
      onResponseError: ({ response }) => {
        console.error('🔥 BACKEND ERROR:', response.status, response._data)
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
