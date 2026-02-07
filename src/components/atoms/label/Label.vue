<script setup lang="ts">
  import { computed } from 'vue'

  import type { LabelProps } from '../types/atoms.types'

  const props = withDefaults(defineProps<LabelProps>(), {
    required: false,
    variant: 'row'
  })

  const classes = computed(() => [
    'flex items-center gap-1 text-sm font-medium',
    props.variant === 'column' ? 'flex-col items-start' : 'flex-row'
  ])
</script>

<template>
  <label :for="forId" :class="classes">
    <span class="inline">{{ text }}</span>
    <span v-if="required" class="text-red-500" aria-label="required">*</span>
  </label>
</template>
