import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const query = getQuery(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const period = query.period ?? '30d'

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/admin/metrics/user-growth?period=${period}`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
