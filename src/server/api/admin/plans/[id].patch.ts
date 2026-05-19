import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/admin/plans/${id}`,
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
