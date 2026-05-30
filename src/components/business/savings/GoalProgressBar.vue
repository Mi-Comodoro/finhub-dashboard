<script setup lang="ts">
  import Text from '@/components/atoms/typography/Text.vue'

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

  if (import.meta.dev && !props.savedAmount)
    console.warn('[GoalProgressBar] savedAmount is 0 or undefined')
</script>

<template>
  <div class="goal-progress-bar">
    <div class="goal-progress-bar__bar-wrapper">
      <div class="goal-progress-bar__bar">
        <div class="goal-progress-bar__bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <Text size="xs" color="muted" class="goal-progress-bar__percentage">
        {{ progressPercentage }}%
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

  .goal-progress-bar__percentage {
    @apply text-center;
  }
</style>
