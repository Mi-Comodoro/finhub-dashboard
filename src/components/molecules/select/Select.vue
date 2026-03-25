<script setup lang="ts">
  import { computed } from 'vue'

  import { Label } from '@/components/atoms'

  import type { SelectProps } from './types'

  const props = withDefaults(defineProps<SelectProps>(), {
    required: false,
    disabled: false,
    error: false,
    errorMessage: 'Valor inválido',
    variant: 'admin',
    size: 'default'
  })

  const emit = defineEmits(['update:modelValue'])

  const selectedValue = computed({
    get: () => props.modelValue || props.initialOption?.value || '',
    set: val => emit('update:modelValue', val)
  })

  const selectClass = computed(() => [
    'select',
    props.error ? 'select--error' : 'select--normal',
    props.size === 'sm' ? 'select--sm' : 'select--default'
  ])

  const containerClass = computed(() => {
    if (props.variant === 'admin-inline') return 'select-container--inline'
    if (props.variant === 'admin') return 'select-container--admin'
    return 'select-container--default'
  })

  const arrowIcon =
    "url(\"data:image/svg+xml,%3Csvg fill='none' stroke='%2364758b' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")"

  const onChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    emit('update:modelValue', value)
  }
</script>

<template>
  <div :class="containerClass">
    <Label
      v-if="label"
      :html-for="name"
      :required="required"
      variant="form"
      color="black"
      weight="bold"
      :class-name="variant === 'admin-inline' ? 'inline-label' : ''"
    >
      {{ label }}
    </Label>

    <div class="select-wrapper">
      <select
        :id="name"
        :name="name"
        :value="selectedValue"
        :disabled="disabled"
        :required="required"
        :class="selectClass"
        :style="{
          backgroundImage: arrowIcon,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1rem',
          paddingRight: '2.5rem'
        }"
        @change="onChange"
      >
        <option v-if="initialOption?.value" :value="initialOption.value" hidden>
          {{ initialOption.label }}
        </option>
        <option v-else value="" hidden>Selecciona una opción</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          class="select-option"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <p v-if="error" class="select-error">
      {{ errorMessage }}
    </p>
  </div>
</template>
<style lang="postcss" scoped>
  .select-container--inline {
    @apply flex items-center gap-3;
  }
  .select-container--admin {
    @apply flex flex-col gap-1;
  }
  .select-container--default {
    @apply flex flex-col gap-1;
  }
  .select-wrapper {
    @apply relative w-full;
  }
  .select {
    @apply w-full appearance-none rounded-md border bg-white text-slate-700 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-400;
  }
  .select--error {
    @apply border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500;
  }
  .select--normal {
    @apply border-neutral-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500;
  }
  .select--sm {
    @apply w-14 px-2 py-1 text-xs;
  }
  .select--default {
    @apply px-3 py-2 text-sm;
  }
  .select-option {
    @apply hover:bg-primary-100 hover:text-primary-800;
  }
  .select-error {
    @apply mt-1 text-xs text-red-500;
  }
</style>
