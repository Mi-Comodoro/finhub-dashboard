import { ACCESS_TOKEN } from '~/common/constants'
import type { ContributionSummary } from '~/types/groups.types'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const { success, data } = await $fetch<{ success: boolean; data: ContributionSummary }>(
    `${config.public.apiBase}/groups/${id}/contributions`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
