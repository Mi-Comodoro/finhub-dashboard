import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const query = getQuery(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const page = query.page ?? 1
  const limit = query.limit ?? 20

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/admin/users?page=${page}&limit=${limit}`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
