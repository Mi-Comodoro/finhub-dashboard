import { ACCESS_TOKEN } from '~/common/constants'
import type { FinancialHealthScoreResponse } from '~/composables/api/useAnalyticsApi'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{ success: boolean; data: FinancialHealthScoreResponse }>(
    `${config.public.apiBase}/analytics/financial-health-score`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  // TODO: [BE] cuando totalTransactions llega como 0 el score ya viene calculado con valores
  // engañosos (todos en 0). El servicio backend debe incluir totalTransactions en la respuesta
  // para que el frontend pueda mostrar EmptyState en lugar de métricas vacías.
  return { success, result: data }
})
