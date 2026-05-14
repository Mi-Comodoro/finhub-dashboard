import { ACCESS_TOKEN } from '~/common/constants'
import type { AccountReceivableSummary } from '~/types/accounts-receivable.types'
import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: AccountReceivableSummary }>(
    `${config.public.apiBase}/accounts-receivable/summary`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
