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
      const { fetchByBudget } = useTransactionApplication()
      await Promise.all([
        fetchByBudget(budgetId, { limit: 100 }),
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
  const expenses = computed(() => expensesStore.expenses)
  const totalSavingGenerated = computed(() => plannedSavingStore.totalSavingGenerated)
  const totalIncomeReceived = computed(() => transactionStore.totalIncomeReceived)
  const totalPlanned = computed(() => expensesStore.totalPlanned)
  const totalExpensesPaid = computed(() => transactionStore.totalExpensesPaid)

  return {
    loadDashboardData,
    currency,
    totalExpenses,
    expenses,
    totalSavingGenerated,
    totalIncomeReceived,
    totalPlanned,
    totalExpensesPaid
  }
}
