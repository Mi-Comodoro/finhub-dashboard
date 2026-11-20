import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

// Right of erasure: schedules the permanent deletion (the backend keeps the data up to 90 days)
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!body?.confirmation) {
    throw createError({ statusCode: 400, message: 'La confirmación es requerida' })
  }

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/privacy/deletion`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { confirmation: String(body.confirmation) },
      onResponseError: ({ response }) => {
        // 400 (wrong phrase) and 409 (organizes a group with other people) carry a reason in Spanish
        const raw = response._data?.message
        const message = Array.isArray(raw) ? raw.join(', ') : raw
        if (response.status === 409) {
          throw createError({
            statusCode: 409,
            message: message ?? 'No se puede eliminar la cuenta ahora'
          })
        }
        validateError(event, response.status, message)
      }
    }
  )

  return { success, result: data }
})
