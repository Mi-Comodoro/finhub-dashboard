import { ACCESS_TOKEN } from '~/common/constants'
import type { GroupExpense } from '~/types/groups.types'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const expenseId = getRouterParam(event, 'expenseId')
  const body = await readBody(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!id || !expenseId) throw createError({ statusCode: 400, message: 'IDs requeridos' })

  const { success, data } = await $fetch<{ success: boolean; data: GroupExpense }>(
    `${config.public.apiBase}/groups/${id}/expenses/${expenseId}`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'PATCH',
      body,
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
