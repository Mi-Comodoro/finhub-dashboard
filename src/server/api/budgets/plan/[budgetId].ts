import { ACCESS_TOKEN } from '~/common/constants'
import type { BackendCurrentBudget } from '~/types/api'

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

  const { success, data } = await $fetch<BackendCurrentBudget>(
    `${config.public.apiBase}/budgets/${budgetId}`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return {
    success,
    result: {
      id: data.id,
      name: data.name,
      month: data.month,
      year: data.year,
      isShared: data.isShared,
      limits: {
        needs: data.needsLimit,
        wants: data.wantsLimit,
        savings: data.savingsLimit
      },
      ownerId: data.ownerId,
      status: data.status,
      financesId: data.financesId,
      partnerId: data.partnerId,
      strategy: data.strategy,
      frequency: data.frequency,
      freeAmount: data.freeAmount
    }
  }
})
