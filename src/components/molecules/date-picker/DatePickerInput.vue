<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { DatePicker, Icon } from '@/components/atoms'
  import { Input } from '@/components/molecules'
  import type { DatePickerInputProps } from '@/types/ui/date-picker.types'

  const props = withDefaults(defineProps<DatePickerInputProps>(), {
    mode: 'single',
    locale: 'es',
    label: '',
    placeholder: 'Seleccionar fecha'
  })

  const emit = defineEmits(['update:modelValue'])

  const showPicker = ref(false)
  const value = ref<Date | null>(props.modelValue)

  watch(
    () => props.modelValue,
    v => (value.value = v)
  )

  const displayValue = computed(() => {
    if (!value.value) return null
    return value.value.toLocaleDateString(props.locale)
  })

  function openPicker() {
    showPicker.value = true
  }

  function closePicker() {
    showPicker.value = false
  }

  const selectedDate = ref<Date | null>(null)
  const selectDate = (val: Date) => {
    value.value = val
    selectedDate.value = val
    emit('update:modelValue', val)
  }
  function handleApply() {
    emit('update:modelValue', selectedDate.value)
    closePicker()
  }
</script>
<template>
  <div class="relative w-full">
    <Input
      :label="label"
      :model-value="displayValue ? displayValue : ''"
      :placeholder="placeholder"
      required
      readonly
    >
      <template #suffix>
        <button type="button" class="text-primary-500" @click="openPicker">
          <Icon name="calendar_month" size="md" />
        </button>
      </template>
    </Input>

    <teleport to="body">
      <div v-if="showPicker" class="date-picker-overlay" @click="closePicker">
        <div class="date-picker-popover" @click.stop>
          <DatePicker
            :model-value="value"
            :mode="mode"
            :locale="locale"
            @update:model-value="selectDate"
            @apply="handleApply"
            @cancel="closePicker"
          />
        </div>
      </div>
    </teleport>
  </div>
</template>
<style lang="postcss" scoped>
  .date-picker-overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm;
  }

  .date-picker-popover {
    @apply mt-24 dark:border-neutral-700 dark:bg-neutral-800;
  }
</style>
