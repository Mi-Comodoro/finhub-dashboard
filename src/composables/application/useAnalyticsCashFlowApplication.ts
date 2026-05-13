import { useTransactionApi } from '@/composables/api/useTransactionApi'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import type { TransactionSummary } from '~/types/domain'

export interface WeeklyGroup {
  week: string
  income: number
  expense: number
  savings: number
  netFlow: number
}

export function useAnalyticsCashFlowApplication() {
  const transactionApi = useTransactionApi()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()

  const ensureBudgetsLoaded = async (year: number) => {
    if (!budgetStore.budgetPlans.length) {
      const { useBudgetActions } = await import('./useBudgetActions')
      const { fetchBudgets } = useBudgetActions()
      await fetchBudgets(financesStore.financeId, year)
    }
  }

  const fetchTransactionsByPeriod = async (
    year: number,
    month: number
  ): Promise<TransactionSummary[]> => {
    await ensureBudgetsLoaded(year)

    const budget = budgetStore.budgetPlans.find(
      b => Number(b.month) === month && Number(b.year) === year
    )

    if (!budget) return []

    const dateFrom = new Date(year, month - 1, 1).toISOString().split('T')[0]!
    const dateTo = new Date(year, month, 0).toISOString().split('T')[0]!

    const query = new URLSearchParams({ dateFrom, dateTo, limit: '500' }).toString()
    const { success, result } = await transactionApi.getTransactionsByBudget(budget.id, query)

    return success && result ? result.transactions : []
  }

  const groupTransactionsByWeek = (transactions: TransactionSummary[]): WeeklyGroup[] => {
    const weeks: Record<string, { income: number; expense: number; savings: number }> = {}

    for (const t of transactions) {
      const date = new Date(t.transactionDate)
      const weekNum = Math.ceil(date.getDate() / 7)
      const key = `Sem ${weekNum}`
      if (!weeks[key]) weeks[key] = { income: 0, expense: 0, savings: 0 }
      const amount = Number(t.amount)
      if (t.type === 'income') weeks[key].income += amount
      if (t.type === 'expense') weeks[key].expense += amount
      if (t.type === 'savings') weeks[key].savings += amount
    }

    return Object.entries(weeks)
      .sort(([a], [b]) => Number(a.replace('Sem ', '')) - Number(b.replace('Sem ', '')))
      .map(([week, data]) => ({
        week,
        income: data.income,
        expense: data.expense,
        savings: data.savings,
        netFlow: data.income - data.expense - data.savings
      }))
  }

  return { fetchTransactionsByPeriod, groupTransactionsByWeek }
}
