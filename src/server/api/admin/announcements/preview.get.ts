import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const query = getQuery(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const segment = query.segment ?? 'all'

  const { success, data } = await $fetch<{ success: boolean; data: { count: number } }>(
    `${config.public.apiBase}/admin/announcements/preview?segment=${segment}`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
