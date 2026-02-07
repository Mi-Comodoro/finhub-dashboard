<script setup lang="ts">
  import type { RadioButtonProps } from '../types/atoms.types'

  const props = defineProps<RadioButtonProps>()
  const emit = defineEmits(['update:modelValue'])

  if (!props.modelValue && props.options.length) {
    emit('update:modelValue', props.options[0].value)
  }
  const updateValue = (value: string | number) => {
    emit('update:modelValue', value)
  }
</script>

<template>
  <div class="radio-group">
    <label v-if="label" class="radio-group__label">
      {{ label }}
    </label>

    <div class="radio-group__options">
      <label v-for="option in options" :key="option.value" class="radio-group__option">
        <input
          type="radio"
          class="radio-group__input"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          :required="required"
          :disabled="disabled"
          @change="updateValue(option.value)"
        />

        <span class="radio-group__custom" />

        <span class="radio-group__text">
          {{ option.label }}
        </span>
      </label>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .radio-group {
    @apply flex gap-4;
  }

  .radio-group__label {
    @apply text-sm font-semibold text-gray-700;
  }

  .radio-group__options {
    @apply flex gap-4;
  }

  .radio-group__option {
    @apply flex cursor-pointer select-none items-center gap-2;
  }

  .radio-group__input {
    @apply sr-only;
  }

  .radio-group__custom {
    @apply flex h-4 w-4 items-center justify-center rounded-full border border-gray-400;
  }

  .radio-group__input:checked + .radio-group__custom {
    @apply border-teal-500;
  }

  .radio-group__input:checked + .radio-group__custom::after {
    content: '';
    @apply h-2 w-2 rounded-full bg-teal-500;
  }

  .radio-group__text {
    @apply text-sm text-gray-700;
  }

  .radio-group__input:disabled + .radio-group__custom {
    @apply cursor-not-allowed opacity-50;
  }
</style>
