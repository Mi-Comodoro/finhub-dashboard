import { ACCESS_TOKEN } from '~/common/constants'
import type { Group } from '~/types/groups.types'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: Group[] }>(
    `${config.public.apiBase}/groups`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
