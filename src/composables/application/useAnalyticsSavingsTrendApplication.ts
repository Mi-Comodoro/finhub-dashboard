import type { Ref } from 'vue'

import { useTransactionApi } from '@/composables/api/useTransactionApi'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import type { Currency } from '@/utils/currency'

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

export function useAnalyticsSavingsTrendApplication(year: Ref<number>) {
  const transactionApi = useTransactionApi()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.defaultCurrency as Currency)

  const fetchSavingsForYear = async (yr: number) => {
    const hasYearLoaded = budgetStore.budgetPlans.some(b => Number(b.year) === yr)
    if (!hasYearLoaded) {
      const { useBudgetActions } = await import('./useBudgetActions')
      const { fetchBudgets } = useBudgetActions()
      await fetchBudgets(financesStore.financeId, yr)
    }

    const budgetsForYear = budgetStore.budgetPlans.filter(b => Number(b.year) === yr)
    const results = await Promise.all(
      budgetsForYear.map(budget => {
        const query = new URLSearchParams({ type: 'savings', limit: '500' }).toString()
        return transactionApi.getTransactionsByBudget(budget.id, query)
      })
    )

    return results.flatMap(r => (r.success && r.result ? r.result.transactions : []))
  }

  const { data: rawTransactions, pending: isLoading } = useAsyncData(
    'analyticsSavingsTrend',
    () => fetchSavingsForYear(year.value),
    { watch: [year] }
  )

  const savingsByMonth = computed(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: MONTH_LABELS[i],
      actual: 0
    }))

    for (const t of rawTransactions.value ?? []) {
      const month = new Date(t.transactionDate).getMonth()
      months[month].actual += Number(t.amount)
    }

    return months
  })

  const totalSaved = computed(() =>
    savingsByMonth.value.reduce((acc, m) => acc + m.actual, 0)
  )

  const bestMonth = computed(() =>
    savingsByMonth.value.reduce(
      (best, m) => (m.actual > best.actual ? m : best),
      savingsByMonth.value[0]
    )
  )

  const monthlyAvg = computed(() => {
    const activeMonths = savingsByMonth.value.filter(m => m.actual > 0).length
    return totalSaved.value / (activeMonths || 1)
  })

  return { savingsByMonth, isLoading, totalSaved, bestMonth, monthlyAvg, currency }
}
