<script setup lang="ts">
  import type { CalendarDay } from '~/types/ui/date-picker.types'
  const emit = defineEmits(['on-day-click'])
  const props = defineProps<{ days: CalendarDay[]; selectedDay: CalendarDay }>()
  const weekDays = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO']
  const handleSelect = (day: CalendarDay) => {
    emit('on-day-click', day)
  }

  // Computed for day classes
  const getDayClasses = (day: CalendarDay) => ({
    'calendar-grid__day--selected':
      day.isSelected || day.date.toDateString() === props.selectedDay.date.toDateString(),
    'calendar-grid__day--range': day.isInRange,
    'calendar-grid__day--start': day.isRangeStart,
    'calendar-grid__day--end': day.isRangeEnd,
    'calendar-grid__day--disabled': day.isDisabled,
    'calendar-grid__day--out': !day.inMonth
  })
</script>
<template>
  <div class="calendar-grid">
    <div class="calendar-grid__header">
      <span v-for="d in weekDays" :key="d" class="calendar-grid__weekday">{{ d }}</span>
    </div>

    <div class="calendar-grid__body">
      <span
        v-for="day in props.days"
        :key="day.date.toISOString()"
        class="calendar-grid__day"
        :class="getDayClasses(day)"
        :disabled="day.isDisabled"
        @click="handleSelect(day)"
      >
        {{ day.date.getDate() }}
      </span>
    </div>
  </div>
</template>
<style scoped lang="postcss">
  .calendar-grid {
    @apply flex flex-col gap-2;
  }
  .calendar-grid__header {
    @apply mb-2 grid grid-cols-7;
  }
  .calendar-grid__weekday {
    @apply text-center text-xs text-slate-400;
  }
  .calendar-grid__body {
    @apply grid grid-cols-7 gap-1;
  }
  .calendar-grid__day {
    @apply flex h-9 w-9 items-center justify-center rounded-lg text-sm transition hover:cursor-pointer;
  }
  .calendar-grid__day--selected {
    @apply bg-teal-600 font-semibold text-white;
  }
  .calendar-grid__day--range {
    @apply bg-teal-100 text-teal-700;
  }
  .calendar-grid__day--start,
  .calendar-grid__day--end {
    @apply bg-teal-600 font-semibold text-white;
  }
  .calendar-grid__day--disabled,
  .calendar-grid__day--out {
    @apply cursor-not-allowed bg-transparent text-transparent;
  }
  .calendar-grid__day:hover:not(.calendar-grid__day--disabled):not(.calendar-grid__day--selected) {
    @apply bg-teal-50;
  }
</style>
