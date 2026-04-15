<script setup lang="ts">
  import { useActiveBudgetApplication } from '@/composables/application/useActiveBudgetApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useSavingGoalsPresenter } from '@/composables/presenters/useSavingGoalsPresenter'

  const { loadAllocationSummaryData, updateNewSavingAmount, goals } = useGoalsApplication()

  const { sumAmountTarget, lastUpdate } = useSavingGoalsPresenter()
  const {
    pendingAllocationProgress,
    pendingAssignedAmount,
    allocationProgress,
    goalsProgress,
    savingsAmount
  } = useActiveBudgetApplication()

  onMounted(async () => {
    await loadAllocationSummaryData()
  })

  const pendingAmount = computed(() =>
    pendingAssignedAmount.value === savingsAmount.value
      ? savingsAmount.value
      : pendingAssignedAmount.value
  )

  updateNewSavingAmount(pendingAmount.value)
</script>

<template>
  <div class="allocation-summary">
    <FinancialProgressCard
      :title="'Ahorro esperado'"
      :subtitle="'Basado en tu seleccion'"
      :amount="savingsAmount"
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
        <div class="allocation-summary__goals">
          <Heading size="5xl" weight="extrabold">
            {{ goals.filter(item => item.isActive).length }}
          </Heading>
          <Text color="muted" size="sm">Metas Activas</Text>
        </div>
      </template>
    </FinancialProgressCard>
  </div>
</template>

<style scoped lang="postcss">
.allocation-summary {
  @apply grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4;
}

.allocation-summary__goals {
  @apply flex h-full items-center gap-2;
}
</style>
