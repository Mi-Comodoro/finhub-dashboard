<script setup lang="ts">
  import Text from '@/components/atoms/typography/Text.vue'
  import { type Currency, formatCurrency } from '@/utils/currency'
  import { hasTargetAmount } from '@/utils/goal-formatters'

  interface GoalProgressBarProps {
    progressPercentage?: number
    savedAmount?: number
    targetAmount?: number
    currencyCode?: string
  }

  const props = withDefaults(defineProps<GoalProgressBarProps>(), {
    progressPercentage: 0,
    savedAmount: 0,
    targetAmount: 0,
    currencyCode: ''
  })

  const hasTarget = computed(() => hasTargetAmount(props.targetAmount))
  const savedLabel = computed(() =>
    formatCurrency(props.savedAmount ?? 0, (props.currencyCode || 'COP') as Currency)
  )
</script>

<template>
  <div class="goal-progress-bar">
    <div v-if="hasTarget" class="goal-progress-bar__bar-wrapper">
      <div class="goal-progress-bar__bar">
        <div class="goal-progress-bar__bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <Text size="xs" color="muted" class="goal-progress-bar__percentage">
        {{ progressPercentage }}%
      </Text>
    </div>
    <div v-else class="goal-progress-bar__no-target">
      <Text size="sm" weight="bold">Aportado: {{ savedLabel }}</Text>
      <Text size="xs" color="muted">
        Define un monto objetivo para ver el porcentaje de avance de esta meta.
      </Text>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .goal-progress-bar {
    @apply w-full;
  }

  .goal-progress-bar__bar-wrapper {
    @apply flex flex-col items-end gap-2;
  }

  .goal-progress-bar__bar {
    @apply h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700;
  }

  .goal-progress-bar__bar-fill {
    @apply h-full rounded-full bg-primary-500 transition-all duration-300;
  }

  .goal-progress-bar__no-target {
    @apply flex flex-col gap-1 rounded-lg border border-dashed border-neutral-200 p-3;
    @apply dark:border-neutral-700;
  }

  .goal-progress-bar__percentage {
    @apply text-center;
  }
</style>
