import type { AccountResponseApi } from '@/types/api'
import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  const { success, data } = await $fetch<AccountResponseApi>(
    `${config.public.apiBase}/allocations`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      body,
      onResponseError: ({ response }) => {
        console.error('❌ Error creating saving allocations:', response.status, response.statusText)
        validateError(event, response.status)
      }
    }
  )

  return {
    success,
    result: data
  }
})
