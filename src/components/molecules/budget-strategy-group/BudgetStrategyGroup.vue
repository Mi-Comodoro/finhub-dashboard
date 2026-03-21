<!--
  Budget Strategy Group
  Molecule component for grouping multiple BudgetStrategyCard components
-->

<script setup lang="ts">
  /**
   * BudgetStrategyGroup Component
   * Container for multiple BudgetStrategyCard components with layout control
   */

  import type { BudgetStrategyGroupProps } from './types/budget-strategy-group.types'

  const props = withDefaults(defineProps<BudgetStrategyGroupProps>(), {
    direction: 'column',
    gap: 'md'
  })

  // Computed classes for layout
  const containerClasses = computed(() => [
    'budget-strategy-group',
    `budget-strategy-group--${props.direction}`,
    `budget-strategy-group--gap-${props.gap}`
  ])
</script>

<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
  /* Base Container */
  .budget-strategy-group {
    @apply mb-4 flex w-full items-center justify-center;
  }

  /* Direction Variants */
  .budget-strategy-group--row {
    @apply flex-row;
  }

  .budget-strategy-group--column {
    @apply flex-col;
  }

  /* Gap Variants */
  .budget-strategy-group--gap-sm {
    @apply gap-2;
  }

  .budget-strategy-group--gap-md {
    @apply gap-4;
  }

  .budget-strategy-group--gap-lg {
    @apply gap-6;
  }

  /* Row specific adjustments */
  .budget-strategy-group--row > :deep(.budget-strategy-card) {
    @apply min-w-0 flex-1; /* Ensure equal width and prevent overflow */
  }

  /* Responsive behavior for row layout */
  @media (max-width: 768px) {
    .budget-strategy-group--row {
      @apply flex-col; /* Stack on mobile */
    }
  }
</style>
