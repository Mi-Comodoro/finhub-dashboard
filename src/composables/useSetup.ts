import { useOnBoarding } from '@/composables/useOnBoarding'
import { useSession } from '@/composables/useSession'
import { useAuthStore } from '@/stores/auth.store'
import { useBudgetStore } from '@/stores/budget.store'
import { useModalStore } from '@/stores/modal.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import type { OnboardingFormData } from '~/types/ui'
export const useSetup = () => {
  const authStore = useAuthStore()

  const budgetStore = useBudgetStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const { showModal, hideModal } = useModalStore()
  const { completeOnboarding, error: onboardingError } = useOnBoarding()
  const { fetchUserMe } = useSession()

  const openOnboarding = ref(false)

  const onboardingComplete = async () => {
    await loadBudgetPlan()
    const budgetId = budgetStore.currentBudgetPlan?.id as string
    await plannedIncomeStore.fetchPlannedIncomeByBudgetId(budgetId)
    hideModal()
  }
  const handleCompleteSetup = async (data: OnboardingFormData) => {
    const success = await completeOnboarding(data)
    openOnboarding.value = false

    if (!success) {
      showModal('error', {
        title: 'Error al Completar Onboarding',
        message:
          onboardingError.value ||
          'Hubo un problema al completar el onboarding. Por favor, intenta de nuevo.',
        actionLabel: undefined
      })
      return
    }

    showModal('success', {
      title: 'Onboarding Completado',
      message: '¡Tu perfil ha sido configurado exitosamente! Bienvenido a FinHub.',
      actionLabel: 'Aceptar',
      onAction: onboardingComplete
    })
  }
  const loadBudgetPlan = async () => {
    const user = await fetchUserMe()
    if (user?.finances && user?.finances.id) {
      await budgetStore.fetchCurrentBudget(user?.finances.id as string)
    }
    return
  }
  const load = async () => {
    await loadBudgetPlan()
    if (authStore.isOnboardingCompleted) {
      const budgetId = budgetStore.currentBudgetPlan?.id
      await plannedIncomeStore.fetchPlannedIncomeByBudgetId(budgetId as string)
      return
    } else {
      openOnboarding.value = true
    }
  }
  return {
    load,
    loadBudgetPlan,
    handleCompleteSetup,
    openOnboarding
  }
}
