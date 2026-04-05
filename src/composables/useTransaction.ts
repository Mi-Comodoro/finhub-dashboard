import type { TransactionFilters } from '~/types/domain'

export const useTransaction = () => {
  const transactionStore = useTransactionStore()
  const { currentBudget } = useCommon()
  const transactions = computed(() => transactionStore.items)
  const pagination = computed(() => transactionStore.pagination)
  const fetchTransaction = async (budgetId: string, filters: TransactionFilters) => {
    if (currentBudget.value) await transactionStore.fetchByBudget(budgetId, filters)
  }

  return { transactions, pagination, fetchTransaction }
}
