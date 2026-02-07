<script setup lang="ts">
  import { StepDot } from '@/components/atoms'

  defineProps<{
    active: boolean
    disabled: boolean
  }>()
</script>

<template>
  <button class="flex items-center justify-center" :disabled="disabled">
    <StepDot :active="active" :disabled="disabled" />
  </button>
</template>
