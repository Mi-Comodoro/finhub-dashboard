import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

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
    data: {
      id: string
      amount: number
      source: string
      date: Date
      status: 'PENDING' | 'RECEIVED' | 'SKIPPED'
      budgetId: string
      updatedAt: Date
    }[]
  }>(`${config.public.apiBase}/planned-incomes/${budgetId}`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      console.error('❌ Error fetching planned incomes list:', response.status, response.statusText)
      validateError(event, response.status)
    }
  })

  return {
    success,
    result: data
  }
})
