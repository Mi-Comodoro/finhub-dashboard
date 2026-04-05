import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const budgetId = getRouterParam(event, 'budgetId')

  if (!budgetId) {
    throw createError({ statusCode: 400, message: 'budgetId es requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: unknown[]
  }>(`${config.public.apiBase}/planned-savings/budget/${budgetId}`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => validateError(event, response.status)
  })

  return { success, result: data }
})
