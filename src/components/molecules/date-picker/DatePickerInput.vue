<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { DatePicker,Icon, Label  } from '@/components/atoms'
  import type { DatePickerInputProps } from '@/types/ui/date-picker.types'

  const props = withDefaults(defineProps<DatePickerInputProps>(), {
    mode: 'single',
    locale: 'es',
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
    if (!value.value) return ''
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
  <div class="date-input">
    <Label v-if="label" variant="form" size="sm" weight="bold" color="black" :required="required">
      {{ label }}
    </Label>

    <!-- 🔥 CONTENEDOR UNIFICADO (Mejora visual) -->
    <div
      class="date-input__field"
      :class="{ 'date-input__field--active': showPicker }"
      @click="openPicker"
    >
      <input
        type="text"
        class="date-input__input"
        :value="displayValue"
        :placeholder="placeholder"
        readonly
      />

      <div class="date-input__icon">
        <Icon name="calendar_month" size="md" />
      </div>
    </div>

    <!-- Dropdown (Comportamiento Original) -->
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

    <!-- Backdrop (Comportamiento Original) -->
    <div v-if="showPicker" class="date-input__backdrop" @click="closePicker" />
  </div>
</template>

<style scoped lang="postcss">
  .date-input {
    @apply flex w-full flex-col gap-1;
  }

  /* 🔥 El input ahora parece una sola pieza con el icono */
  .date-input__field {
    @apply flex cursor-pointer items-center justify-between rounded-md border border-neutral-300 bg-white transition-all duration-200 dark:border-neutral-600 dark:bg-neutral-900;
  }

  .date-input__field:hover {
    @apply border-primary-400;
  }

  .date-input__field--active {
    @apply border-primary-500 ring-1 ring-primary-500;
  }

  .date-input__input {
    @apply flex-1 cursor-pointer border-none bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100;
  }

  .date-input__icon {
    @apply flex items-center justify-center pr-3 text-neutral-400 transition;
  }
  .date-picker-input__overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm;
  }
  .date-picker-input__popover {
    @apply mt-24 dark:border-neutral-700 dark:bg-neutral-800;
  }
</style>
