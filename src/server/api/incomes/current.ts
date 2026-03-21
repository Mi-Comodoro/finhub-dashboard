import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  const { year, month } = getQuery(event)
  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: {
      expectedIncomes: { source: string; amount: number; date: Date }[]
      totalExpectedIncomes: number
      lastUpdate: Date
    }
  }>(`${config.public.apiBase}/incomes/current?year=${year}&month=${month}`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return {
    success,
    result: data
  }
})
