import { ACCESS_TOKEN } from '~/common/constants'
import type { GroupExpense } from '~/types/groups.types'

import { validateError } from '../../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const expenseId = getRouterParam(event, 'expenseId')

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })
  if (!expenseId) throw createError({ statusCode: 400, message: 'expenseId requerido' })

  const { success, data } = await $fetch<{ success: boolean; data: GroupExpense }>(
    `${config.public.apiBase}/groups/${id}/expenses/${expenseId}/pay`,
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
