import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'Solicitud requerida' })
  }

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/admin/beta-access/${id}/reject`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        // The server explains the conflict (quota reached, already used, already rejected)
        const message = (response._data as { message?: string } | null)?.message
        if (response.status === 409) {
          throw createError({
            statusCode: 409,
            message: message ?? 'No se puede completar la acción'
          })
        }
        validateError(event, response.status, message)
      }
    }
  )

  return { success, result: data }
})
