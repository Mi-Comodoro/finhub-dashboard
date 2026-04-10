import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
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
  }>(`${config.public.apiBase}/budgets`, {
    headers: { authorization: `Bearer ${token}` },
    method: 'POST',
    body,
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
