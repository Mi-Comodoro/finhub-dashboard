import { computed } from 'vue'

import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'
import { useTransactionStore } from '@/stores/transaction.store'

export function useBudgetInsightsPresenter() {
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const plannedSavingStore = usePlannedSavingStore()
  const transactionStore = useTransactionStore()

  const receivedPlannedIncome = computed(() => plannedIncomeStore.totalGenerated || 0)
  const currency = computed(() => financesStore.defaultCurrency)
  const plan = computed(() => budgetStore.budgetSelected)
  const receivedIncome = computed(
    () => transactionStore.totals?.income ?? transactionStore.totalIncomeReceived
  )
  const generatedSavings = computed(
    () => transactionStore.totals?.savings ?? plannedSavingStore.totalSavingTarget
  )
  const pendingSavings = computed(() => plannedSavingStore.totalSavingPending)

  return {
    receivedPlannedIncome,
    currency,
    plan,
    receivedIncome,
    generatedSavings,
    pendingSavings
  }
}
