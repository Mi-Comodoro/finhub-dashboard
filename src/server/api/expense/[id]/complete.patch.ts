// server/api/expenses/[id]/complete.patch.ts

import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'id es requerido' })
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/expense/${id}/complete`,
    {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        const raw = response._data?.message
        validateError(event, response.status, Array.isArray(raw) ? raw.join(', ') : raw)
      }
    }
  )

  return { success, result: data }
})
