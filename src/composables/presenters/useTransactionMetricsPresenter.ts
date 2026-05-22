import type { TransactionTotals } from '~/types/domain'

export function useTransactionMetricsPresenter(
  totals: Ref<TransactionTotals | null>,
  pagination: Ref<{ total: number; totalPages: number; page: number; limit: number } | null>,
  currentPage: Ref<number>,
  pageSize: Ref<number>
) {
  const totalIncome = computed(() => totals.value?.income ?? 0)
  const totalExpense = computed(() => totals.value?.expense ?? 0)
  const totalSavings = computed(() => totals.value?.savings ?? 0)

  const countByType = (type: 'income' | 'expense' | 'savings') => {
    if (type === 'income') return totals.value?.countIncome ?? 0
    if (type === 'expense') return totals.value?.countExpense ?? 0
    return totals.value?.countSavings ?? 0
  }

  const totalItems = computed(() => pagination.value?.total ?? 0)
  const totalPages = computed(() => pagination.value?.totalPages ?? 0)
  const showPagination = computed(() => totalPages.value > 1)

  const countLabel = computed(() => {
    if (!totalItems.value) return '0 transacciones'
    const from = (currentPage.value - 1) * pageSize.value + 1
    const to = Math.min(currentPage.value * pageSize.value, totalItems.value)
    return `${from}–${to} de ${totalItems.value} transacciones`
  })

  return {
    totalIncome,
    totalExpense,
    totalSavings,
    countByType,
    totalItems,
    totalPages,
    showPagination,
    countLabel
  }
}
