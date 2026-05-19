import type { UserMe } from '@/types/api'
import type { OnboardingFormData } from '~/types/ui'

interface UserProfileUpdate {
  displayName?: string
  phone?: string
  gender?: string
  country?: string
}

export const useUserApi = () => {
  const getUserMe = async () => {
    return await $fetch<UserMe>('/api/users/me')
  }

  const getUserMeWithCredentials = async () => {
    return await $fetch<UserMe>('/api/users/me', { credentials: 'include' })
  }

  const completeOnboarding = async (data: OnboardingFormData) => {
    return await $fetch<{
      success: boolean
      result: { onboarding: string }
    }>('/api/users/onboarding', {
      method: 'POST',
      body: data
    })
  }

  const updateUserProfile = async (data: UserProfileUpdate) => {
    return await $fetch<{ success: boolean; result: UserProfileUpdate }>(
      '/api/users/me',
      { method: 'PATCH', body: data }
    )
  }

  const updateFinancialProfile = async (financeId: string, data: { profile: string }) => {
    return await $fetch<{ success: boolean; result: { profile: string } }>(
      `/api/finances/${financeId}`,
      { method: 'PATCH', body: data }
    )
  }

  return {
    getUserMe,
    getUserMeWithCredentials,
    completeOnboarding,
    updateUserProfile,
    updateFinancialProfile
  }
}
