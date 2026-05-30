import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const query = getQuery(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const params = new URLSearchParams()
  if (query.action) params.set('action', String(query.action))
  if (query.targetType) params.set('targetType', String(query.targetType))
  if (query.from) params.set('from', String(query.from))
  if (query.to) params.set('to', String(query.to))
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit ?? 20))

  const qs = params.toString() ? `?${params.toString()}` : ''

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/admin/audit-logs${qs}`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
