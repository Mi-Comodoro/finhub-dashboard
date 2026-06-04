import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const bucketId = getRouterParam(event, 'bucketId')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  if (!id || !bucketId) {
    throw createError({ statusCode: 400, message: 'IDs requeridos' })
  }

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/budgets/${id}/buckets/${bucketId}`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'DELETE',
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
