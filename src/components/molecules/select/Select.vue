<script setup lang="ts">
  import { computed } from 'vue'

  import { Label } from '@/components/atoms/index'

  import type { SelectProps } from '../types/molecule.types'

  const props = withDefaults(defineProps<SelectProps>(), {
    required: false,
    disabled: false,
    error: false,
    errorMessage: 'Valor inválido',
    variant: 'admin',
    size: 'default'
  })

  const emit = defineEmits(['update:modelValue'])

  const selectClass = computed(() => ({
    'form-select': true,
    'border-red-500 focus:ring-red-500 focus:border-red-500': props.error
  }))

  const sizeClass = computed(() => ({
    'form-select--default': true,
    'form-select--sm': props.size === 'sm'
  }))
  const containerClass = computed(() => {
    if (props.variant === 'admin-inline') return 'flex items-center gap-3'
    if (props.variant === 'admin') return 'flex flex-col gap-1'
    return 'flex flex-col gap-1'
  })

  const onChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    emit('update:modelValue', value)
  }
</script>

<template>
  <div :class="containerClass">
    <Label
      v-if="label"
      :for-id="name"
      :text="label"
      :required="required"
      :variant="variant === 'admin-inline' ? 'row' : 'column'"
      :class="variant === 'admin-inline' ? 'inline-label' : ''"
    />

    <select
      :id="name"
      :name="name"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="[selectClass, sizeClass]"
      @change="onChange"
    >
      <option value="" disabled hidden>Selecciona una opción</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="hover:bg-teal-100 hover:text-teal-800"
      >
        {{ option.label }}
      </option>
    </select>

    <p v-if="props.error" class="form-error">{{ props.errorMessage }}</p>
  </div>
</template>

<style lang="postcss" scoped>
  .form-field {
    @apply w-full;
  }

  .form-select {
    @apply w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-gray-100 disabled:text-gray-400;
  }

  /* Flecha */
  .form-select {
    background-image: url("data:image/svg+xml,%3Csvg fill='none' stroke='%2364758b' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .form-error {
    @apply mt-1 text-xs text-red-500;
  }

  .form-select--default {
    @apply px-3 py-2 text-sm;
  }

  .form-select--sm {
    @apply w-14 px-2 py-1 text-xs;
  }
</style>
