import { ACCESS_TOKEN } from '~/common/constants'
import type { TravelExpense } from '~/types/travel-expense.types'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const groupId = getRouterParam(event, 'groupId')

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!groupId) throw createError({ statusCode: 400, message: 'groupId requerido' })

  const { success, data } = await $fetch<{ success: boolean; data: TravelExpense[] }>(
    `${config.public.apiBase}/travel-expenses/group/${groupId}`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
