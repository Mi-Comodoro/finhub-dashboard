<script setup lang="ts">
  defineProps<{
    active: boolean
    disabled: boolean
  }>()
</script>

<template>
  <div
    class="h-3 w-3 rounded-full transition"
    :class="[
      active && 'bg-primary-500',
      !active && disabled && 'bg-neutral-300',
      !active && !disabled && 'bg-neutral-400'
    ]"
  />
</template>
