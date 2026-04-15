import type { UserMe } from '@/types/api'
import type { OnboardingFormData } from '~/types/ui'

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

  return {
    getUserMe,
    getUserMeWithCredentials,
    completeOnboarding
  }
}
