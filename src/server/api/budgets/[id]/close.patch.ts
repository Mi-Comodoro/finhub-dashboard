import { ACCESS_TOKEN } from '~/common/constants'
import type { BackendCurrentBudget } from '~/types/api'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'budgetId es requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const body = await readBody(event).catch(() => ({}))

  const { success, data } = await $fetch<BackendCurrentBudget>(
    `${config.public.apiBase}/budgets/${id}/close`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'PATCH',
      body,
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
      isDefault: data.isDefault,
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
      frequency: data.frequency
    }
  }
})
