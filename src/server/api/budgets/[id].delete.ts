import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'Budget ID is required' })
  }

  const { success } = await $fetch<{ success: boolean }>(
    `${config.public.apiBase}/budgets/${id}`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'DELETE',
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return { success }
})
