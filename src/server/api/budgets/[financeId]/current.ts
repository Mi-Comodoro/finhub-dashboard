import { ACCESS_TOKEN } from '~/common/constants'
import type { BackendCurrentBudget } from '~/types/api'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const financeId = getRouterParam(event, 'financeId')

  if (!financeId) {
    throw createError({ statusCode: 400, message: 'financeId es requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<BackendCurrentBudget>(
    `${config.public.apiBase}/budgets/${financeId}/current`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return {
    success,
    result: success
      ? {
          id: data.id,
          name: data.name,
          month: data.month,
          year: data.year,
          income: data.income,
          otherIncome: data.otherIncome,
          isShared: data.isShared,
          partnerIncome: data.partnerIncome,
          partnerOtherIncome: data.partnerOtherIncome,
          limits: {
            needs: data.needsLimit,
            wants: data.wantsLimit,
            savings: data.savingsLimit
          },
          financesId: data.financesId,
          partnerId: data.partnerId,
          strategy: data.strategy,
          frequency: data.frequency
        }
      : null
  }
})
