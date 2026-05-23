import { computed } from 'vue'

import { useExpensesStore } from '@/stores/expense.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'
import { useTransactionStore } from '@/stores/transaction.store'

export const useDashboardApplication = () => {
  const expensesStore = useExpensesStore()
  const transactionStore = useTransactionStore()
  const plannedSavingStore = usePlannedSavingStore()
  const financesStore = useFinancesStore()

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
    currency,
    totalExpenses,
    totalCommittedExpenses,
    expenses,
    totalSavingGenerated,
    totalSavingTarget,
    totalSavingFromPlan,
    totalTransactionSavings,
    totalIncomeReceived,
    totalPlanned,
    totalExpensesPaid
  }
}
