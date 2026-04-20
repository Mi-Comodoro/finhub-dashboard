import { ACCESS_TOKEN } from '~/common/constants'
import type { GoalsData } from '~/types/api'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de meta requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const body = await readBody(event)

  const { success, data } = await $fetch<{
    success: boolean
    data: GoalsData
  }>(`${config.public.apiBase}/savings/goals/${id}`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}` },
    body,
    onResponseError: ({ response }) => {
      console.error('❌ Error updating goal:', response.status, response.statusText)
      validateError(event, response.status)
    }
  })

  return {
    success,
    result: data
  }
})
