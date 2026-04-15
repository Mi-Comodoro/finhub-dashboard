// composables/presenters/useTransactionMetricsPresenter.ts
import type { TransactionSummary } from '~/types/domain'

export function useTransactionMetricsPresenter(
  transactions: Ref<TransactionSummary[] | null>,
  pagination: Ref<{ total: number; totalPages: number; page: number; limit: number } | null>,
  currentPage: Ref<number>,
  pageSize: Ref<number>
) {
  const totalIncome = computed(
    () =>
      transactions.value
        ?.filter(t => t.type === 'income')
        .reduce((a, t) => a + Number(t.amount), 0) ?? 0
  )
  const totalExpense = computed(
    () =>
      transactions.value
        ?.filter(t => t.type === 'expense')
        .reduce((a, t) => a + Number(t.amount), 0) ?? 0
  )
  const totalSavings = computed(
    () =>
      transactions.value
        ?.filter(t => t.type === 'savings')
        .reduce((a, t) => a + Number(t.amount), 0) ?? 0
  )

  const countByType = (type: TransactionSummary['type']) =>
    transactions.value?.filter(t => t.type === type).length ?? 0

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
