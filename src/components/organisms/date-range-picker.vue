<script setup lang="ts">
  import { ref } from 'vue'

  import type { DateRange } from '@/types/ui/date-picker.types'

  import { DatePicker } from '../atoms'
  import InputDateInput from '../atoms/input-date-input.vue'

  const range = ref<DateRange>({ start: null, end: null })
  const showPicker = ref(false)
</script>
<template>
  <div class="date-range-picker">
    <InputDateInput :model-value="range" @click="showPicker = true" />
    <div v-if="showPicker" class="date-range-picker__popover">
      <DatePicker :model-value="range" />
    </div>
  </div>
</template>
<style scoped lang="postcss">
  .date-range-picker {
    @apply relative w-full;
  }
  .date-range-picker__popover {
    @apply absolute left-0 top-12 z-10;
  }
</style>
