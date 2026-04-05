<script setup lang="ts">
  import { useActiveBudget } from '@/composables/useActiveBudget'
  import { useSavingGoals } from '@/composables/useSavingGoals'
  import { useAccountStore } from '@/stores/account.store'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'

  const budgetStore = useBudgetStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const financeStore = useFinancesStore()
  const currentBudgetId = computed(() => budgetStore.currentBudgetPlan?.id ?? null)

  const savingsAllocationsStore = useSavingAllocationsStore()
  const goalsStore = useGoalsStore()
  const accountStore = useAccountStore()
  const goals = computed(() => goalsStore.goals)

  const { sumAmountTarget, lastUpdate } = useSavingGoals()
  const {
    pendingAllocationProgress,
    pendingAssignedAmount,
    allocationProgress,
    goalsProgress,
    savingsAmount
  } = useActiveBudget()
  onMounted(async () => {
    const financeId = financeStore.profile?.id
    if (financeId) {
      await budgetStore.fetchCurrentBudget(financeId)
    }

    if (currentBudgetId.value) {
      await plannedIncomeStore.fetchPlannedIncomeByBudgetId(currentBudgetId.value)
    }

    if (accountStore.accounts.length < 1) {
      await accountStore.fetchAccounts()
    }
    if (savingsAllocationsStore.savingAllocations.length < 1) {
      await savingsAllocationsStore.fetchSavingAllocations()
    }
  })

  const pendingAmount = computed(() =>
    pendingAssignedAmount.value === savingsAmount.value
      ? savingsAmount.value
      : pendingAssignedAmount.value
  )

  savingsAllocationsStore.setNewSavingAmount(pendingAmount.value)
</script>

<template>
  <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <FinancialProgressCard
      :title="'Ahorro esperado'"
      :subtitle="'Basado en tu seleccion'"
      :amount="plannedIncomeStore.buckets.savingsAmount"
      icon-name="account_balance"
      icon-text-class="text-primary-500"
      currency-text-class="text-primary-500"
      :progress-percentage="allocationProgress"
      variant="primary"
      show-progressbar
    />
    <FinancialProgressCard
      :title="'Proyeccion'"
      :subtitle="'Basado en tus Metas'"
      :amount="sumAmountTarget(goalsProgress)"
      icon-name="savings"
      icon-text-class="text-yellow-500"
      currency-text-class="text-yellow-500"
      variant="gold"
      :text-footer="lastUpdate()!"
    />

    <FinancialProgressCard
      :title="'Dinero sin Asignar'"
      :subtitle="'Pendiente de Asignar'"
      :amount="pendingAmount"
      icon-name="pending_actions"
      :pending-percentage="pendingAllocationProgress"
      variant="warning"
      show-alert
    />

    <FinancialProgressCard
      :title="'Metas'"
      subtitle="En progreso"
      icon-name="track_changes"
      icon-text-class="text-primary-600"
      variant="secondary"
    >
      <template #body>
        <div class="flex h-full items-center gap-2">
          <Heading size="5xl" weight="extrabold">
            {{ goals.filter(item => item.isActive).length }}
          </Heading>
          <Text color="muted" size="sm">Metas Activas</Text>
        </div>
      </template>
    </FinancialProgressCard>
  </div>
</template>
