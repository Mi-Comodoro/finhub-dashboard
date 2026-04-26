<!--
  Budget Strategy Card
  Molecule component for displaying budget allocation strategies
-->

<script setup lang="ts">
  /**
   * BudgetStrategyCard Component
   * Displays budget strategy options with visual allocation breakdown
   */

  import { Badge } from '@/components/atoms'

  import type { BudgetAllocation } from '../charts'
  import type { BudgetStrategyCardProps } from './types/budget-strategy-card.types'

  const props = withDefaults(
    defineProps<BudgetStrategyCardProps & { totalIncome?: number }>(),
    {
      icon: 'account_balance',
      recommended: false,
      advanced: false,
      selected: false,
      selectable: true,
      totalIncome: undefined
    }
  )

  const emit = defineEmits(['select', 'update:allocation', 'total'] as const)

  // Handle selection
  const handleSelect = () => {
    if (props.selectable) {
      emit('select')
    }
  }

  const handleUpdateAllocation = (newAllocation: BudgetAllocation) => {
    const total = Object.values(newAllocation).reduce((sum, value) => sum + value, 0)
    if (total <= 100) {
      emit('update:allocation', newAllocation)
      emit('total', total)
    } else {
      emit('total', total)
      // Optionally, you could emit an error event or show a warning here
      console.warn('Total allocation cannot exceed 100%')
    }
  }
</script>

<template>
  <div
    :class="[
      'budget-strategy-card',
      {
        'budget-strategy-card--selected': selected,
        'budget-strategy-card--selectable': selectable
      }
    ]"
    :role="selectable ? 'button' : undefined"
    :tabindex="selectable ? 0 : undefined"
    @click="handleSelect"
    @keydown.enter="handleSelect"
    @keydown.space="handleSelect"
  >
    <!-- Header -->
    <div class="budget-strategy-card__header">
      <!-- IconBadge -->
      <IconBadge
        :icon="icon"
        size="md"
        :class="{ 'budget-strategy-card__icon--selected': selected }"
      />

      <!-- Title and Badge -->
      <div class="budget-strategy-card__title-section">
        <Heading level="h3">{{ title }}</Heading>
        <Badge v-if="recommended" text="Recomendado" variant="info" size="xs" />
        <Badge v-else-if="advanced" text="Avanzado" variant="info" size="xs" />
      </div>

      <!-- Selection Indicator -->
      <div v-if="selectable" class="budget-strategy-card__selector">
        <Icon
          v-if="selected"
          name="check"
          size="md"
          class-name="budget-strategy-card__selector__check"
        />
        <div v-else class="selection-empty"></div>
      </div>
    </div>
    <!-- Description -->
    <div class="budget-strategy-card__description">
      <Text size="xs" variant="paragraph">
        {{ description }}
      </Text>
    </div>

    <StackedProgressBar
      :allocation="allocation"
      :title="title"
      :advanced="advanced"
      :selected="selected"
      :total-income="totalIncome"
      class="budget-strategy-card__allocation"
      @update:allocation="handleUpdateAllocation"
    />
  </div>
</template>

<style lang="postcss" scoped>
  /* Main Card - Based on RadioButton card styles */
  .budget-strategy-card {
    @apply relative w-4/5 flex-1 cursor-pointer flex-col gap-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:border-neutral-300;
  }

  .budget-strategy-card--selected {
    @apply border-primary-500 bg-primary-50;
  }

  .budget-strategy-card--selectable:hover {
    @apply border-neutral-300;
  }

  .budget-strategy-card--selected:hover {
    @apply border-primary-600;
  }

  /* Header Section */
  .budget-strategy-card__header {
    @apply flex items-center gap-2;
  }

  .budget-strategy-card__icon {
    @apply flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500;
  }
  .budget-strategy-card__icon--selected {
    @apply bg-primary-500 text-white;
  }

  .budget-strategy-card__title-section {
    @apply mb-1 flex flex-col;
  }

  /* Conditional Legend for Advanced Cards */
  .budget-strategy-card__legend {
    @apply flex justify-between;
  }

  .legend-item {
    @apply flex items-center gap-2;
  }

  .legend-item__color {
    @apply h-3 w-3 rounded-full;
  }

  .legend-item__color--needs {
    @apply bg-primary-500;
  }

  .legend-item__color--wants {
    @apply bg-lime-500;
  }

  .legend-item__color--savings {
    @apply bg-slate-700;
  }

  .legend-item__text {
    @apply text-xs font-medium text-neutral-600;
  }

  .budget-strategy-card--selected .legend-item__text {
    @apply text-primary-900;
  }

  .budget-strategy-card__selector {
    @apply ml-auto place-self-start;
  }
  .budget-strategy-card__selector__check {
    @apply rounded-full bg-primary-500 text-white;
  }

  .budget-strategy-card__description {
    @apply my-2 text-sm text-neutral-700;
  }
</style>
