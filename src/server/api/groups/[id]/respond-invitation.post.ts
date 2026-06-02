import { ACCESS_TOKEN } from '~/common/constants'
import type { RespondInvitationResult } from '~/types/groups.types'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const { success, data } = await $fetch<{ success: boolean; data: RespondInvitationResult }>(
    `${config.public.apiBase}/groups/${id}/respond-invitation`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      body,
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
