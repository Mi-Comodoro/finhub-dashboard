<script setup lang="ts">
  import type { DateRange } from '@/types/ui/date-picker.types'
  const props = defineProps<{ modelValue: DateRange }>()
</script>
<template>
  <div class="input-date-input">
    <input
      class="input-date-input__field"
      type="text"
      :value="
        props.modelValue.start && props.modelValue.end
          ? `${props.modelValue.start.toLocaleDateString()} - ${props.modelValue.end.toLocaleDateString()}`
          : ''
      "
      readonly
    />
    <span class="input-date-input__icon">📅</span>
  </div>
</template>
<style scoped lang="postcss">
  .input-date-input {
    @apply relative flex w-full items-center;
  }
  .input-date-input__field {
    @apply w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none;
  }
  .input-date-input__icon {
    @apply pointer-events-none absolute right-3 text-slate-400;
  }
</style>
