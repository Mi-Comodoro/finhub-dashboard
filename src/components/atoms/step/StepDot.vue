<script setup lang="ts">
  defineProps<{
    active: boolean
    disabled: boolean
  }>()
</script>

<template>
  <div
    class="step-dot"
    :class="[
      active && 'bg-primary-500',
      !active && disabled && 'bg-neutral-300',
      !active && !disabled && 'bg-neutral-400'
    ]"
  />
</template>

<style scoped lang="postcss">
  .step-dot {
    @apply h-3 w-3 rounded-full transition;
  }
</style>
