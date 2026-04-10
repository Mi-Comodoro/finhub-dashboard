import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)
  const id = getRouterParam(event, 'id')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'Budget ID is required' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: {
      id: string
      name: string
      month: string
      year: number
      isShared: boolean
      needsLimit: number
      wantsLimit: number
      savingsLimit: number
      financesId: string
      ownerId: string
      partnerId?: string
      strategy: 'BALANCED' | 'CUSTOM'
      frequency: string
      status: 'ACTIVE' | 'CLOSED' | 'PLANNED'
    }
  }>(`${config.public.apiBase}/budgets/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    method: 'PATCH',
    body,
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
