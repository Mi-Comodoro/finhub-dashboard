<script setup lang="ts">
  import { computed, ref } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { useFinancesStore } from '@/stores/finances.store'
  import type { GoalsData } from '@/types/api'
  import type { CurrentBudgetPlan } from '@/types/domain'
  import { formatCurrency } from '@/utils/currency'

  interface Props {
    budget: CurrentBudgetPlan
    availableGoals: GoalsData[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'transfer-to-budget': []
    'transfer-to-goal': [goalId: string]
  }>()

  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.defaultCurrency)

  const selectedGoalId = ref<string>('')

  const goalOptions = computed(() =>
    props.availableGoals.map(g => ({ label: g.name, value: g.id }))
  )

  const handleTransferToGoal = () => {
    if (!selectedGoalId.value) return
    emit('transfer-to-goal', selectedGoalId.value)
  }
</script>

<template>
  <div class="budget-closed-banner">
    <div class="budget-closed-banner__header">
      <span class="material-symbols-outlined budget-closed-banner__icon">
        account_balance_wallet
      </span>
      <div class="budget-closed-banner__text">
        <p class="budget-closed-banner__title">
          Presupuesto cerrado · saldo disponible:
          <strong>{{ formatCurrency(budget.freeAmount ?? 0, currency) }}</strong>
        </p>
        <p class="budget-closed-banner__subtitle">¿Qué deseas hacer con este saldo?</p>
      </div>
    </div>

    <div class="budget-closed-banner__actions">
      <Button variant="primary" size="sm" @click="$emit('transfer-to-budget')">
        Pasar al mes actual
      </Button>

      <div class="budget-closed-banner__goal-action">
        <Select
          v-model="selectedGoalId"
          name="goal-transfer"
          :options="goalOptions"
          :initial-option="{ label: 'Elegir meta...', value: '' }"
        />
        <Button
          variant="secondary"
          size="sm"
          :disabled="!selectedGoalId"
          @click="handleTransferToGoal"
        >
          Abonar a meta
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-closed-banner {
    @apply flex flex-col gap-4 rounded-xl border border-primary-200 bg-primary-50 p-5 dark:border-primary-800 dark:bg-primary-900/20;
  }

  .budget-closed-banner__header {
    @apply flex items-start gap-3;
  }

  .budget-closed-banner__icon {
    @apply shrink-0 text-2xl text-primary-600;
  }

  .budget-closed-banner__title {
    @apply text-sm font-semibold text-neutral-800 dark:text-neutral-100;
  }

  .budget-closed-banner__subtitle {
    @apply text-xs text-neutral-500;
  }

  .budget-closed-banner__actions {
    @apply flex flex-wrap items-center gap-3;
  }

  .budget-closed-banner__goal-action {
    @apply flex items-center gap-2;
  }
</style>
