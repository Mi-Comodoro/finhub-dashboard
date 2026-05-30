<script setup lang="ts">
  import { computed, ref } from 'vue'

  import CalendarGrid from '@/components/atoms/calendar-grid/CalendarGrid.vue'
  import { Calendar } from '@/components/atoms/datepicker/utils/Calendar'
  import type { CalendarDay, DatePickerProps, DateRange } from '@/types/ui/date-picker.types'

  type ViewMode = 'calendar' | 'months' | 'years'

  const props = withDefaults(defineProps<DatePickerProps>(), {
    mode: 'single',
    locale: 'es',
    label: '',
    placeholder: 'Seleccionar fechas'
  })
  const emit = defineEmits(['update:modelValue', 'apply', 'cancel'] as const)

  const viewDate = computed<Date>(() => {
    if (props.modelValue instanceof Date) return props.modelValue
    return new Date()
  })

  const calendar = new Calendar(viewDate.value.getFullYear(), viewDate.value.getMonth())
  const date = new Date()
  const currentMonth = ref(viewDate.value)
  const dynamicMonth = ref<Date | null>(props.modelValue instanceof Date ? props.modelValue : null)
  const viewMode = ref<ViewMode>('calendar')
  const yearPageStart = ref(Math.floor(date.getFullYear() / 12) * 12)

  const displayMonth = computed(() => {
    const monthDate = dynamicMonth.value || currentMonth.value
    return monthDate.toLocaleString(props.locale, { month: 'long', year: 'numeric' }).toUpperCase()
  })

  const displayYear = computed(() => {
    const monthDate = dynamicMonth.value || currentMonth.value
    return monthDate.getFullYear()
  })

  const monthNames = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({
      index: i,
      label: new Date(displayYear.value, i, 1).toLocaleString(props.locale, { month: 'short' }),
      isCurrent: i === new Date().getMonth() && displayYear.value === new Date().getFullYear()
    }))
  )

  const yearGrid = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({
      value: yearPageStart.value + i,
      isCurrent: yearPageStart.value + i === new Date().getFullYear()
    }))
  )
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

  function prevYearPage() {
    yearPageStart.value -= 12
  }
  function nextYearPage() {
    yearPageStart.value += 12
  }

  function prevYear() {
    const current = dynamicMonth.value || currentMonth.value
    dynamicMonth.value = calendar.setMonth(current.getFullYear() - 1, current.getMonth())
  }
  function nextYear() {
    const current = dynamicMonth.value || currentMonth.value
    dynamicMonth.value = calendar.setMonth(current.getFullYear() + 1, current.getMonth())
  }

  function toggleMonthView() {
    viewMode.value = viewMode.value === 'calendar' ? 'months' : 'calendar'
  }
  function showYearView() {
    const current = dynamicMonth.value || currentMonth.value
    yearPageStart.value = Math.floor(current.getFullYear() / 12) * 12
    viewMode.value = 'years'
  }
  function selectYear(year: number) {
    const current = dynamicMonth.value || currentMonth.value
    dynamicMonth.value = calendar.setMonth(year, current.getMonth())
    viewMode.value = 'months'
  }
  function selectMonth(monthIndex: number) {
    const current = dynamicMonth.value || currentMonth.value
    dynamicMonth.value = calendar.setMonth(current.getFullYear(), monthIndex)
    viewMode.value = 'calendar'
  }

  function handleApply() {
    emit('apply', props.modelValue)
  }
  function handleCancel() {
    emit('cancel')
  }
  function handleToday() {
    const today = new Date()
    dynamicMonth.value = calendar.setMonth(today.getFullYear(), today.getMonth())
    viewMode.value = 'calendar'
    if (props.mode === 'single') {
      emit('update:modelValue', new Date())
      emit('apply', new Date())
    } else {
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
      <template v-if="viewMode === 'calendar'">
        <Button icon-only icon="arrow_back" size="sm" variant="ghost" @click="prevMonth" />
        <button type="button" class="date-picker__title" @click="toggleMonthView">
          {{ displayMonth }}
        </button>
        <Button icon-only icon="arrow_forward" size="sm" variant="ghost" @click="nextMonth" />
      </template>
      <template v-if="viewMode === 'months'">
        <Button icon-only icon="arrow_back" size="sm" variant="ghost" @click="prevYear" />
        <button type="button" class="date-picker__title" @click="showYearView">
          {{ displayYear }}
        </button>
        <Button icon-only icon="arrow_forward" size="sm" variant="ghost" @click="nextYear" />
      </template>
      <template v-if="viewMode === 'years'">
        <Button icon-only icon="arrow_back" size="sm" variant="ghost" @click="prevYearPage" />
        <span class="date-picker__title date-picker__title--static">
          {{ yearPageStart }} — {{ yearPageStart + 11 }}
        </span>
        <Button icon-only icon="arrow_forward" size="sm" variant="ghost" @click="nextYearPage" />
      </template>
    </div>

    <CalendarGrid
      v-if="viewMode === 'calendar'"
      :days="days"
      :selected-day="selectedDay"
      @on-day-click="handleDayClick"
    />
    <div v-if="viewMode === 'months'" class="date-picker__grid">
      <button
        v-for="m in monthNames"
        :key="m.index"
        type="button"
        class="date-picker__grid-item"
        :class="{ 'date-picker__grid-item--current': m.isCurrent }"
        @click="selectMonth(m.index)"
      >
        {{ m.label }}
      </button>
    </div>
    <div v-if="viewMode === 'years'" class="date-picker__grid">
      <button
        v-for="y in yearGrid"
        :key="y.value"
        type="button"
        class="date-picker__grid-item"
        :class="{ 'date-picker__grid-item--current': y.isCurrent }"
        @click="selectYear(y.value)"
      >
        {{ y.value }}
      </button>
    </div>
    <div class="date-picker__footer">
      <Button variant="ghost" size="sm" @click="handleCancel">Cancelar</Button>
      <Button variant="ghost" size="sm" @click="handleToday">Hoy</Button>
      <Button size="sm" @click="handleApply">Aplicar</Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .date-picker {
    @apply w-[340px] rounded-2xl bg-white p-4 shadow-lg;
    @apply dark:bg-neutral-800;
  }
  .date-picker__header {
    @apply mb-4 flex items-center justify-between;
  }
  .date-picker__title {
    @apply cursor-pointer rounded-lg px-3 py-1 text-sm font-semibold text-slate-800 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-slate-200 dark:hover:bg-primary-900 dark:hover:text-primary-300;
  }
  .date-picker__title--static {
    @apply cursor-default hover:bg-transparent hover:text-slate-800 dark:hover:bg-transparent dark:hover:text-slate-200;
  }
  .date-picker__grid {
    @apply grid grid-cols-3 gap-2 py-2;
  }
  .date-picker__grid-item {
    @apply flex h-12 items-center justify-center rounded-lg text-sm font-medium text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-primary-900 dark:hover:text-primary-300;
  }
  .date-picker__grid-item--current {
    @apply bg-primary-100 font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300;
  }
  .date-picker__footer {
    @apply mt-4 flex justify-between;
  }
</style>
