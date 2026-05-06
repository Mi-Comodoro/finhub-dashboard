import { useBudgetActions } from '@/composables/application/useBudgetActions'
import { useOnboardingApplication } from '@/composables/application/useOnboardingApplication'
import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
import { useSession } from '@/composables/useSession'
import { useAuthStore } from '@/stores/auth.store'
import { useBudgetStore } from '@/stores/budget.store'
import { useModalStore } from '@/stores/modal.store'
import type { OnboardingFormData } from '~/types/ui'
export const useSetupApplication = () => {
  const authStore = useAuthStore()

  const budgetStore = useBudgetStore()
  const { fetchCurrentBudget } = useBudgetActions()
  const { fetchPlannedIncomeByBudgetId } = usePlannedIncomeApplication()
  const { showModal, hideModal } = useModalStore()
  const { completeOnboarding, error: onboardingError } = useOnboardingApplication()
  const { fetchUserMe } = useSession()

  const openOnboarding = ref(false)
  const currentBudgetId = computed(() => budgetStore.currentBudgetPlan?.id ?? null)
  const isUsingPreviousBudget = ref(false)
  const budgetWarningMessage = ref('')
  const budgetMissingMessage = ref('')

  const resetBudgetFallback = () => {
    isUsingPreviousBudget.value = false
    budgetWarningMessage.value = ''
    budgetMissingMessage.value = ''
  }

  const getPreviousPeriod = () => {
    const now = new Date()
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    return {
      month: previousMonthDate.getMonth() + 1,
      year: previousMonthDate.getFullYear()
    }
  }

  const getCurrentPeriod = () => {
    const now = new Date()

    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    }
  }

  const findPreviousBudget = async (financeId: string) => {
    const previousPeriod = getPreviousPeriod()
    await fetchCurrentBudget(financeId, previousPeriod.month, previousPeriod.year)
    const previousBudget = budgetStore.currentBudgetPlan

    if (!previousBudget) return null

    isUsingPreviousBudget.value = true
    budgetWarningMessage.value =
      'No encontramos un presupuesto para el mes actual. Te mostramos el del mes anterior para que puedas revisarlo, cerrarlo y crear manualmente el nuevo periodo.'

    return previousBudget.id
  }

  const onboardingComplete = async () => {
    const budgetId = await loadBudgetPlan()

    if (!budgetId) return
    await fetchPlannedIncomeByBudgetId(budgetId)
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
      message: '¡Tu perfil ha sido configurado exitosamente! Bienvenido a Mi Comodoro.',
      actionLabel: 'Aceptar',
      onAction: onboardingComplete
    })
  }
  const loadBudgetPlan = async () => {
    resetBudgetFallback()
    const user = await fetchUserMe()

    if (user?.finances && user?.finances.id) {
      const financeId = user.finances.id
      const currentPeriod = getCurrentPeriod()

      await fetchCurrentBudget(financeId, currentPeriod.month, currentPeriod.year)

      if (budgetStore.currentBudgetPlan?.id) {
        return budgetStore.currentBudgetPlan.id
      }

      const previousBudgetId = await findPreviousBudget(financeId)

      if (!previousBudgetId) {
        budgetMissingMessage.value =
          'No encontramos un presupuesto para el mes actual ni uno para el mes anterior. Debes cerrar el periodo anterior y crear manualmente tu nuevo presupuesto.'
      }

      return previousBudgetId
    }

    return null
  }
  const load = async () => {
    const budgetId = await loadBudgetPlan()

    if (!authStore.isOnboardingCompleted) {
      openOnboarding.value = true
      return
    }

    if (!budgetId) return

    await fetchPlannedIncomeByBudgetId(budgetId)
  }
  return {
    budgetMissingMessage,
    budgetWarningMessage,
    currentBudgetId,
    isUsingPreviousBudget,
    load,
    loadBudgetPlan,
    handleCompleteSetup,
    openOnboarding
  }
}
