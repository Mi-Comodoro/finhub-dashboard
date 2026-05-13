import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { year } = getQuery(event)
  if (!year) throw createError({ statusCode: 400, message: 'year es requerido' })

  const { success, data } = await $fetch<{
    success: boolean
    data: Array<{ id: string; amount: number; transactionDate: string }>
  }>(`${config.public.apiBase}/analytics/savings-trend?year=${year}`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => validateError(event, response.status)
  })

  return { success, result: data }
})
