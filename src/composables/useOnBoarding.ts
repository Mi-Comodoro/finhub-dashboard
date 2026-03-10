import type { OnboardingStep } from '~/types/domain'
import type { OnboardingFormData } from '~/types/ui'

export const useOnBoarding = () => {
  const authStore = useAuthStore()
  const updateOnboardingStep = async (step: OnboardingStep): Promise<void> => {
    authStore.setOnboarding({
      isCompleted: step === 'completed',
      currentStep: step,
      completedSteps:
        step === 'completed' ? ['personal-info', 'finances-config', 'budget-strategy'] : []
    })
  }

  const completeOnboarding = async (data: OnboardingFormData): Promise<boolean> => {
    try {
      const onboardingData = {
        ...data
      }
      const { success, result } = await $fetch('/api/users/onboarding', {
        method: 'POST',
        body: onboardingData
      })
      if (!success) throw new Error('Error al completar el onboarding')

      authStore.setOnboarding({
        isCompleted: result.onboarding === 'COMPLETED',
        currentStep: 'completed',
        completedSteps: ['personal-info', 'finances-config', 'budget-strategy']
      })

      return true
    } catch (error) {
      console.error('❌ Error completing onboarding:', error)
      return false
    }
  }

  const error = ref<string | null>(null)
  const isLoading = ref(false)
  return {
    updateOnboardingStep,
    completeOnboarding,
    error,
    isLoading
  }
}
