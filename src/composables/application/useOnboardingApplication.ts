import { useUserApi } from '~/composables/api/useUserApi'
import { useAuthStore } from '~/stores/auth.store'
import type { OnboardingFormData } from '~/types/ui'

export const useOnboardingApplication = () => {
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const userApi = useUserApi()

  const completeOnboarding = async (data: OnboardingFormData): Promise<boolean> => {
    try {
      isLoading.value = true
      const onboardingData = {
        ...data
      }
      const { success, result } = await userApi.completeOnboarding(onboardingData)

      if (!success) throw new Error('Error al completar el onboarding')

      authStore.setOnboarding({
        isCompleted: result.onboarding === 'COMPLETED'
      })

      isLoading.value = false
      return true
    } catch (err) {
      console.error('❌ Error completing onboarding:', err)
      isLoading.value = false
      error.value = 'Failed to complete onboarding. Please try again.'
      return false
    }
  }

  return {
    completeOnboarding,
    error,
    isLoading
  }
}
