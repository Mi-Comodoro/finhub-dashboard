<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { DatePicker, Icon } from '@/components/atoms'
  import { Input } from '@/components/molecules'
  import type { DatePickerInputProps } from '@/types/ui/date-picker.types'

  const props = withDefaults(defineProps<DatePickerInputProps>(), {
    mode: 'single',
    locale: 'es',
    label: '',
    placeholder: 'Seleccionar fecha',
    required: false
  })

  const emit = defineEmits(['update:modelValue'])

  const showPicker = ref(false)
  const value = ref<Date | null>(props.modelValue)
  const pendingDate = ref<Date | null>(props.modelValue)

  watch(
    () => props.modelValue,
    v => (value.value = v)
  )

  const displayValue = computed(() => {
    if (!value.value) return null
    return value.value.toLocaleDateString(props.locale)
  })

  function openPicker() {
    pendingDate.value = value.value
    showPicker.value = true
  }

  function closePicker() {
    showPicker.value = false
  }

  function onDateSelect(val: Date) {
    pendingDate.value = val
  }

  function handleApply() {
    if (pendingDate.value) {
      value.value = pendingDate.value
      emit('update:modelValue', pendingDate.value)
    }
    closePicker()
  }

  function handleCancel() {
    pendingDate.value = value.value
    closePicker()
  }
</script>
<template>
  <div class="date-picker-input">
    <Input
      :label="label"
      :model-value="displayValue ? displayValue : ''"
      :placeholder="placeholder"
      :required="required"
      readonly
    >
      <template #suffix>
        <button type="button" class="date-picker-input__button" @click="openPicker">
          <Icon name="calendar_month" size="md" />
        </button>
      </template>
    </Input>

    <teleport to="body">
      <div v-if="showPicker" class="date-picker-input__overlay" @click="closePicker">
        <div class="date-picker-input__popover" @click.stop>
          <DatePicker
            :model-value="pendingDate"
            :mode="mode"
            :locale="locale"
            @update:model-value="onDateSelect"
            @apply="handleApply"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </teleport>
  </div>
</template>
<style lang="postcss" scoped>
  .date-picker-input {
    @apply relative w-full;
  }

  .date-picker-input__button {
    @apply text-primary-500;
  }

  .date-picker-input__overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm;
  }

  .date-picker-input__popover {
    @apply mt-24 dark:border-neutral-700 dark:bg-neutral-800;
  }
</style>
