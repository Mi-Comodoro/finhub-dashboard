import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

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
  }>(`${config.public.apiBase}/planned-incomes/`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => validateError(event, response.status)
  })

  return { success, result: data }
})
