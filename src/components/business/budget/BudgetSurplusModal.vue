<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import type { GoalsData } from '@/types/api'
  import { type Currency, formatCurrency } from '@/utils/currency'

  import type { SurplusAction } from './types/budget-surplus.types'

  const props = withDefaults(
    defineProps<{
      surplus?: number
      availableGoals?: GoalsData[]
      isLoading?: boolean
      currency?: Currency
    }>(),
    { surplus: 0, availableGoals: () => [], isLoading: false, currency: 'COP' }
  )

  const emit = defineEmits<{
    confirm: [action: SurplusAction, targetGoalId?: string]
    cancel: []
  }>()

  const selectedAction = ref<SurplusAction | null>(null)
  const selectedGoalId = ref<string | null>(null)

  const isConfirmDisabled = computed(() => {
    if (!selectedAction.value) return true
    if (selectedAction.value === 'transfer_to_goal' && !selectedGoalId.value) return true
    return false
  })

  const activeGoals = computed(() =>
    props.availableGoals.filter(g => g.isActive && g.status !== 'COMPLETED')
  )

  watch(
    () => props.surplus,
    () => {
      selectedAction.value = null
      selectedGoalId.value = null
    }
  )

  const handleConfirm = () => {
    if (!selectedAction.value) return
    emit('confirm', selectedAction.value, selectedGoalId.value ?? undefined)
  }

  const selectAction = (action: SurplusAction) => {
    selectedAction.value = action
    if (action !== 'transfer_to_goal') selectedGoalId.value = null
  }
</script>

<template>
  <div class="surplus-modal">
    <div class="surplus-modal__header">
      <Heading level="h1" size="xl" weight="extrabold" color="black">Excedente disponible</Heading>
      <Text size="xs" color="muted">¿Qué deseas hacer con este saldo?</Text>
    </div>

    <div class="surplus-modal__amount">
      <Text size="xs" color="muted" class="surplus-modal__amount-label">Libre sin comprometer</Text>
      <Heading level="h2" size="2xl" weight="extrabold" color="black">
        {{ formatCurrency(surplus, currency) }}
      </Heading>
    </div>

    <div class="surplus-modal__options">
      <!-- Opción: Transferir a meta -->
      <button
        class="surplus-modal__option"
        :class="{ 'surplus-modal__option--selected': selectedAction === 'transfer_to_goal' }"
        type="button"
        @click="selectAction('transfer_to_goal')"
      >
        <span class="material-symbols-outlined surplus-modal__option-icon">savings</span>
        <div class="surplus-modal__option-content">
          <Text size="sm" weight="bold">Transferir a una meta</Text>
          <Text size="xs" color="muted">Acreditar el excedente a una meta de ahorro activa</Text>
        </div>
      </button>

      <div v-if="selectedAction === 'transfer_to_goal'" class="surplus-modal__goal-select">
        <Select
          name="target-goal"
          :model-value="selectedGoalId ?? ''"
          :options="activeGoals.map(g => ({ value: g.id, label: g.name }))"
          placeholder="Selecciona una meta"
          @update:model-value="selectedGoalId = $event as string"
        />
      </div>

      <!-- Opción: Llevar al siguiente presupuesto -->
      <button
        class="surplus-modal__option"
        :class="{ 'surplus-modal__option--selected': selectedAction === 'carry_forward' }"
        type="button"
        @click="selectAction('carry_forward')"
      >
        <span class="material-symbols-outlined surplus-modal__option-icon">arrow_forward</span>
        <div class="surplus-modal__option-content">
          <Text size="sm" weight="bold">Llevar al siguiente presupuesto</Text>
          <Text size="xs" color="muted">El saldo quedará disponible para el próximo período</Text>
        </div>
      </button>
    </div>

    <div class="surplus-modal__actions">
      <Button variant="ghost" size="sm" :disabled="isLoading" @click="emit('cancel')">
        Cancelar
      </Button>
      <Button
        variant="primary"
        size="sm"
        :disabled="isConfirmDisabled || isLoading"
        :loading="isLoading"
        @click="handleConfirm"
      >
        Confirmar cierre
      </Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .surplus-modal {
    @apply flex flex-col gap-6 p-6;
  }

  .surplus-modal__header {
    @apply flex flex-col gap-1;
  }

  .surplus-modal__amount {
    @apply flex flex-col gap-1 rounded-xl bg-primary-50 p-4;
  }

  .surplus-modal__amount-label {
    @apply text-primary-700;
  }

  .surplus-modal__options {
    @apply flex flex-col gap-3;
  }

  .surplus-modal__option {
    @apply flex cursor-pointer items-center gap-3 rounded-xl border-2 border-neutral-200 p-4 text-left transition-all;
  }

  .surplus-modal__option:hover {
    @apply border-primary-300 bg-primary-50;
  }

  .surplus-modal__option--selected {
    @apply border-primary-500 bg-primary-50;
  }

  .surplus-modal__option-icon {
    @apply text-2xl text-neutral-400;
  }

  .surplus-modal__option--selected .surplus-modal__option-icon {
    @apply text-primary-600;
  }

  .surplus-modal__option-content {
    @apply flex flex-col gap-0.5;
  }

  .surplus-modal__goal-select {
    @apply -mt-2 px-2;
  }

  .surplus-modal__actions {
    @apply flex justify-end gap-3;
  }
</style>
