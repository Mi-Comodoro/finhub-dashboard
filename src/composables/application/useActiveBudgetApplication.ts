import { useBudgetActions } from '@/composables/application/useBudgetActions'
import { useAccountStore } from '@/stores/account.store'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useGoalsStore } from '@/stores/goals.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
import { percentOf } from '@/utils/currency'
import { subtractPercentage } from '@/utils/numbers'

export const useActiveBudgetApplication = () => {
  const accountStore = useAccountStore()
  const goalsStore = useGoalsStore()
  const savingsAllocationsStore = useSavingAllocationsStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()

  // 1. Instancia las acciones en la raíz del composable
  // Esto evita el warning de "dynamically imported but also statically imported"
  const { enableBudget } = useBudgetActions()

  const savingsAmount = computed(() => {
    const limits = budgetStore.currentBudgetPlan?.limits
    const expected = plannedIncomeStore.expectedIncome ?? 0
    const currency = financesStore.defaultCurrency
    return percentOf(expected, limits?.savings ?? 0, currency)
  })

  const isAccountCreated = computed(() => accountStore.accounts.length >= 1)
  const goalsProgress = computed(() => goalsStore.goals.length)
  const isGoalsCompleted = computed(() => goalsProgress.value >= 3)

  const allocationProgress = computed(() => {
    const activeGoalIds = new Set(goalsStore.goals.filter(g => g.isActive).map(g => g.id))
    return savingsAllocationsStore.savingAllocations
      .filter(item => item.budgetId === budgetStore.currentBudgetPlan?.id)
      .filter(item => activeGoalIds.has(item.goalId))
      .reduce((acc, sa) => acc + Number(sa.percentage ?? 0), 0)
  })

  const pendingAllocationProgress = computed(() => {
    const progress = allocationProgress.value
    return isNaN(progress) ? 100 : Math.max(0, 100 - progress)
  })

  const isSavingsAllocationCompleted = computed(() => allocationProgress.value === 100)

  const pendingAssignedAmount = computed(() => {
    const savings = savingsAmount.value ?? 0
    const progress = allocationProgress.value ?? 0
    return savingsAllocationsStore.savingAllocations.length === 0
      ? savings
      : subtractPercentage(savings, progress)
  })

  const canActive = computed(() => {
    return isAccountCreated.value && isGoalsCompleted.value && isSavingsAllocationCompleted.value
  })

  // Checklist shown to the user: the budget can only be activated once savings are set up
  const setupSteps = computed(() => [
    {
      key: 'account',
      label: 'Crea tu primera cuenta',
      detail: isAccountCreated.value ? 'Cuenta creada' : 'Aún no tienes cuentas',
      done: isAccountCreated.value
    },
    {
      key: 'goals',
      label: 'Define al menos 3 metas de ahorro',
      detail: `${goalsProgress.value} de 3 metas creadas`,
      done: isGoalsCompleted.value
    },
    {
      key: 'distribution',
      label: 'Distribuye el 100% de tu ahorro entre tus metas',
      detail: `${allocationProgress.value}% distribuido`,
      done: isSavingsAllocationCompleted.value
    }
  ])

  // Activates a specific budget, but only when the savings setup is complete
  const activate = async (budgetId: string): Promise<{ success: boolean; blocked: boolean }> => {
    if (!canActive.value) return { success: false, blocked: true }
    const { success } = await enableBudget(budgetId)
    return { success, blocked: false }
  }

  const enabled = async () => {
    const budgetId = budgetStore.currentBudgetPlan?.id ?? ''
    if (!budgetId) return

    // 2. Usa la función ya desestructurada arriba
    await enableBudget(budgetId)
  }

  return {
    isAccountCreated,
    isGoalsCompleted,
    isSavingsAllocationCompleted,
    pendingAllocationProgress,
    allocationProgress,
    goalsProgress,
    pendingAssignedAmount,
    savingsAmount,
    enabled,
    activate,
    setupSteps,
    canActive
  }
}
