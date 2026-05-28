import { computed, ref } from 'vue'

import { useSavingsApi } from '@/composables/api/useSavingsApi'
import { useExpensesStore } from '@/stores/expense.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'
import { useTransactionStore } from '@/stores/transaction.store'

export const useDashboardApplication = () => {
  const expensesStore = useExpensesStore()
  const transactionStore = useTransactionStore()
  const plannedSavingStore = usePlannedSavingStore()
  const financesStore = useFinancesStore()
  const savingsApi = useSavingsApi()

  const totalGoalContributions = ref(0)

  const loadGoalContributionsForPeriod = async (year: number, month: number) => {
    const { result: goals } = await savingsApi.getGoals()
    if (!goals?.length) return

    const responses = await Promise.all(goals.map(g => savingsApi.getGoalContributions(g.id)))

    totalGoalContributions.value = responses
      .flatMap(r => r.result ?? [])
      .filter(t => {
        const d = new Date(t.transactionDate)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0)
  }

  /**
   * Carga inicial de datos del dashboard para un presupuesto específico
   */
  const loadDashboardData = async (budgetId: string) => {
    try {
      // Configurar el filtro de budget en expenses
      expensesStore.setBudget(budgetId)
      const { useExpenseApplication } = await import('./useExpenseApplication')
      const { useTransactionApplication } = await import('./useTransactionApplication')
      // Cargar datos en paralelo
      const { fetchExpenses } = useExpenseApplication()
      const { fetchByBudget, fetchTotals } = useTransactionApplication()
      await Promise.all([
        fetchByBudget(budgetId, { limit: 100 }),
        fetchTotals(budgetId),
        fetchExpenses(),
        plannedSavingStore.fetchByBudget(budgetId)
      ])

      return { success: true }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
      return { success: false }
    }
  }

  // Datos expuestos del dashboard
  const currency = computed(() => financesStore.defaultCurrency)
  const totalExpenses = computed(() => expensesStore.totalPaid)
  const totalCommittedExpenses = computed(() => expensesStore.totalCommitted)
  const expenses = computed(() => expensesStore.expenses)
  const totalSavingGenerated = computed(() => plannedSavingStore.totalSavingGenerated)
  const totalSavingTarget = computed(() => plannedSavingStore.totalSavingTarget)
  const totalSavingFromPlan = computed(() => plannedSavingStore.totalSavingFromPlan)
  const totalTransactionSavings = computed(
    () => transactionStore.totals?.savings ?? transactionStore.totalSavings
  )
  const totalIncomeReceived = computed(
    () => transactionStore.totals?.income ?? transactionStore.totalIncomeReceived
  )
  const totalPlanned = computed(() => expensesStore.totalPlanned + expensesStore.totalPaid)
  const totalExpensesPaid = computed(
    () => transactionStore.totals?.expense ?? transactionStore.totalExpensesPaid
  )

  return {
    loadDashboardData,
    loadGoalContributionsForPeriod,
    currency,
    totalExpenses,
    totalCommittedExpenses,
    expenses,
    totalSavingGenerated,
    totalSavingTarget,
    totalSavingFromPlan,
    totalTransactionSavings,
    totalGoalContributions,
    totalIncomeReceived,
    totalPlanned,
    totalExpensesPaid
  }
}
