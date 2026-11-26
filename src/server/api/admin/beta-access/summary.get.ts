import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/admin/beta-access/summary`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        const message = (response._data as { message?: string } | null)?.message
        validateError(event, response.status, message)
      }
    }
  )

  return { success, result: data }
})
