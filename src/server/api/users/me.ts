import { ACCESS_TOKEN, TOKEN_EXPIRES_AT } from '~/common/constants'
import type { BackendUserMe } from '~/types/api'

import { validateError } from '../utils/auth.error'

const extractRoleFromJwt = (token: string): string | undefined => {
  try {
    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
    return (JSON.parse(decoded) as Record<string, unknown>).role as string | undefined
  } catch {
    return undefined
  }
}

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const expiresAt = Number(getCookie(event, TOKEN_EXPIRES_AT) ?? '')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'No hay sesión activa'
    })
  }

  const { success, data } = await $fetch<BackendUserMe>(`${config.public.apiBase}/users/me`, {
    headers: {
      authorization: `Bearer ${token}`
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
        isPhoneVerified: data.userProfile.isPhoneVerified,
        country: data.userProfile.country,
        role: data.role ?? data.userProfile.role ?? extractRoleFromJwt(token)
      },
      finances: data.finances,
      onboarding: data.onboarding,
      accountType: data.userProfile.type,
      expiresAt: Number.isNaN(expiresAt) ? null : expiresAt
    }
  }
})
