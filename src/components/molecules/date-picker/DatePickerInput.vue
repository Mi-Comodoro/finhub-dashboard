<script setup lang="ts">
  import { computed, ref } from 'vue'

  import { DatePicker, Icon } from '@/components/atoms'
  import type { DatePickerInputProps } from '@/types/ui/date-picker.types'

  const props = withDefaults(defineProps<DatePickerInputProps>(), {
    mode: 'single',
    locale: 'es',
    label: '',
    placeholder: 'Seleccionar fechas',
    inputClass: ''
  })
  const emit = defineEmits(['update:modelValue'] as const)

  const showPicker = ref(false)
  const value = ref<Date | null>(props.modelValue)

  // Sync local value with prop when parent updates
  watch(
    () => props.modelValue,
    newValue => {
      value.value = newValue
    }
  )

  const displayValue = computed(() => {
    if (!value.value) return ''
    if (props.mode === 'single' && value.value instanceof Date) {
      return value.value.toLocaleDateString(props.locale)
    }
    /* if (
      props.mode === 'range' &&
      typeof value.value === 'object' &&
      value.value !== null &&
      'start' in value.value &&
      'end' in value.value &&
      value.value.start &&
      value.value.end
    ) {
      return `${value.value.start.toLocaleDateString(props.locale)} - ${value.value.end.toLocaleDateString(props.locale)}`
    } */
    return ''
  })

  function openPicker() {
    showPicker.value = true
  }
  function closePicker() {
    showPicker.value = false
  }
  function handleUpdate(val: Date | null) {
    value.value = val
    emit('update:modelValue', val)
  }

  function handleApply(val: Date | null) {
    value.value = val
    emit('update:modelValue', val)
    closePicker()
  }

  function handleCancel() {
    closePicker()
  }

  function handleToday(val: Date | null) {
    value.value = val
    emit('update:modelValue', val)
    closePicker()
  }
</script>
<template>
  <div class="date-picker-input">
    <div class="date-picker-input__field">
      <Input
        :model-value="displayValue"
        :placeholder="placeholder"
        readonly
        :class="inputClass"
        aria-label="Seleccionar rango de fechas"
      />
      <Icon name="calendar_month" size="md" class="date-picker-input__icon" @click="openPicker" />
    </div>
    <teleport to="body">
      <div v-if="showPicker" class="date-picker-input__popover">
        <DatePicker
          :model-value="value"
          :mode="mode"
          :min-date="minDate"
          :max-date="maxDate"
          :locale="locale"
          :label="label"
          :placeholder="placeholder"
          @apply="handleApply"
          @cancel="handleCancel"
          @today="handleToday"
          @update:model-value="handleUpdate"
        />
      </div>
    </teleport>
  </div>
</template>
<style scoped lang="postcss">
  .date-picker-input {
    @apply relative w-full;
  }
  .date-picker-input__field {
    @apply flex w-full cursor-pointer items-center gap-2;
  }
  .date-picker-input__input {
    @apply w-full rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-200;
  }
  .date-picker-input__icon {
    @apply text-primary-500;
  }
  .date-picker-input__popover {
    @apply fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2;
  }
</style>
