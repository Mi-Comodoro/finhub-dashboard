<script setup lang="ts">
  import { computed, ref } from 'vue'

  import { CalendarGrid } from '@/components/atoms'
  import { Calendar } from '@/components/atoms/datepicker/utils/Calendar'
  import type { CalendarDay, DatePickerProps, DateRange } from '@/types/ui/date-picker.types'

  const date = new Date()
  const calendar = new Calendar(date.getFullYear(), date.getMonth())
  const props = withDefaults(defineProps<DatePickerProps>(), {
    mode: 'single',
    locale: 'es',
    label: '',
    placeholder: 'Seleccionar fechas'
  })
  const emit = defineEmits(['update:modelValue', 'apply', 'cancel'] as const)

  const currentMonth = ref(date)
  const dynamicMonth = ref<Date | null>(null)

  const displayMonth = computed(() => {
    const monthDate = dynamicMonth.value || currentMonth.value
    return monthDate.toLocaleString(props.locale, { month: 'long', year: 'numeric' }).toUpperCase()
  })
  const selecting = ref<'start' | 'end'>('start')
  const tempRange = ref<DateRange | null>(
    props.mode === 'range' ? { start: null, end: null } : null
  )
  const selectDay = ref<Date | null>(null)

  const selectedDay = computed<CalendarDay>(() =>
    Calendar.getSelectDate(
      selectDay.value ? selectDay.value.getFullYear() : currentMonth.value.getFullYear(),
      selectDay.value ? selectDay.value.getMonth() : currentMonth.value.getMonth(),
      selectDay.value
    )
  )

  const days = computed<CalendarDay[]>(() => {
    const result = calendar.getMonthDays(dynamicMonth.value, tempRange.value, props.modelValue)
    return result
  })

  function prevMonth() {
    dynamicMonth.value = calendar.prevMonth()
    emit('update:modelValue', dynamicMonth.value)
  }
  function nextMonth() {
    dynamicMonth.value = calendar.nextMonth()
    emit('update:modelValue', dynamicMonth.value)
  }

  function handleApply() {
    emit('apply', props.modelValue)
  }
  function handleCancel() {
    emit('cancel')
  }
  function handleToday() {
    if (props.mode === 'single') {
      emit('update:modelValue', new Date())
      emit('apply', new Date())
    } else {
      const today = new Date()
      emit('update:modelValue', { start: today, end: today })
      emit('apply', { start: today, end: today })
    }
  }
  function handleDayClick(day: CalendarDay) {
    selectDay.value = day.date
    if (day.isDisabled) return

    if (props.mode === 'single') {
      emit('update:modelValue', day.date)
      return
    } else {
      // Rango
      if (selecting.value === 'start') {
        tempRange.value = { start: day.date, end: null }
        selecting.value = 'end'
      } else {
        if (tempRange.value) {
          tempRange.value.end = day.date
          if (
            tempRange.value.start &&
            tempRange.value.end &&
            tempRange.value.start <= tempRange.value.end
          ) {
            emit('update:modelValue', { start: tempRange.value.start, end: tempRange.value.end })
            selecting.value = 'start'
          }
        }
      }
    }
  }
</script>
<template>
  <div class="date-picker">
    <div class="date-picker__header">
      <Button icon-only icon="arrow_back" @click="prevMonth" />
      <span class="date-picker__title">
        {{ displayMonth }}
      </span>
      <Button icon-only icon="arrow_forward" @click="nextMonth" />
    </div>

    <CalendarGrid :days="days" :selected-day="selectedDay" @on-day-click="handleDayClick" />
    <div class="date-picker__footer">
      <Button variant="ghost" @click="handleCancel">Cancelar</Button>
      <Button variant="ghost" @click="handleToday">Hoy</Button>
      <Button @click="handleApply">Aplicar</Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .date-picker {
    @apply w-[340px] rounded-2xl bg-white p-4 shadow-lg;
  }
  .date-picker__header {
    @apply mb-4 flex items-center justify-between;
  }
  .date-picker__nav {
    @apply flex h-8 w-8 items-center justify-center rounded-full text-teal-600 hover:bg-teal-50;
  }
  .date-picker__title {
    @apply text-lg font-semibold text-slate-800;
  }
  .date-picker__footer {
    @apply mt-4 flex justify-between;
  }
  .date-picker__footer-btn {
    @apply rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200;
  }
  .date-picker__footer-btn--apply {
    @apply bg-teal-600 text-white hover:bg-teal-700;
  }
</style>
