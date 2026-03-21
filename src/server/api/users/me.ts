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
        name: data.userProfile.name,
        displayName: data.userProfile.displayName,
        photo: data.userProfile.photo,
        phone: data.userProfile.phone,
        gender: data.userProfile.gender,
        createdAt: data.createdAt,
        trialEndsAt: data.userProfile.trialEndsAt,
        isActive: data.userProfile.isActive,
        country: data.userProfile.country
      },
      finances: data.finances,
      onboarding: data.onboarding,
      accountType: data.userProfile.type
    }
  }
})
