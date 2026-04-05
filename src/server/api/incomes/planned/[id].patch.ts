import { ACCESS_TOKEN } from '~/common/constants'
import type { PlannedIncomeUpdateApiResponse } from '~/types/api'

import { validateError } from '../../utils/auth.error'

// server/api/incomes/planned/[incomeId].patch.ts
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'id es requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<PlannedIncomeUpdateApiResponse>(
    `${config.public.apiBase}/planned-incomes/${id}`,
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        console.error('🔥 BACKEND ERROR:', response.status, response._data)
        validateError(event, response.status)
      }
    }
  )

  return {
    success,
    result: data
  }
})
