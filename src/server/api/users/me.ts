import type { BackendUserMe } from '~/types/api'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const auth = getHeader(event, 'authorization')

  const { success, data } = await $fetch<BackendUserMe>(`${config.public.apiBase}/users/me`, {
    headers: {
      authorization: auth ?? ''
    },
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return {
    success: success,
    result: {
      user: {
        id: data.id,
        email: data.email,
        name: data.account.name,
        displayName: data.account.displayName,
        photo: data.account.photo,
        phone: data.account.phone,
        gender: data.account.gender,
        createdAt: data.createdAt,
        trialEndsAt: data.account.trialEndsAt,
        isActive: data.account.isActive,
        country: data.account.country
      },
      finances: data.finances,
      onboarding: data.onboarding,
      accountType: data.account.type
    }
  }
})
