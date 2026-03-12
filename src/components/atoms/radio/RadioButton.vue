<script setup lang="ts">
  import type { RadioButtonProps } from '@/components/atoms'
  import { Badge } from '@/components/atoms'

  const props = withDefaults(defineProps<RadioButtonProps>(), {
    variant: 'default',
    direction: 'column'
  })
  const emit = defineEmits(['update:modelValue'])

  if (!props.modelValue && props.options.length > 0) {
    emit('update:modelValue', null)
  }

  const updateValue = (value: string | number) => {
    emit('update:modelValue', value)
  }
</script>

<template>
  <!-- Default Radio Button Style -->
  <div v-if="variant === 'default'" class="radio-group">
    <label v-if="label" class="radio-group__label">
      {{ label }}
    </label>

    <div
      :class="[
        'radio-group__options',
        direction === 'row' ? 'radio-group__options--row' : 'radio-group__options--column'
      ]"
    >
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

  <!-- Card Style Radio Button -->
  <div v-else-if="variant === 'card'" class="radio-card-group">
    <label v-if="label" class="radio-card-group__label">
      {{ label }}
    </label>

    <div
      :class="[
        'radio-card-group__options',
        direction === 'row' ? 'radio-card-group__options--row' : 'radio-card-group__options--column'
      ]"
    >
      <label
        v-for="option in options"
        :key="option.value"
        :class="[
          'radio-card-option',
          {
            'radio-card-option--selected': modelValue === option.value,
            'radio-card-option--disabled': disabled
          }
        ]"
      >
        <input
          type="radio"
          class="radio-card-input"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          :required="required"
          :disabled="disabled"
          @change="updateValue(option.value)"
        />

        <!-- Icon -->
        <div class="radio-card-icon">
          <span v-if="option.icon" class="material-symbols-outlined">
            {{ option.icon }}
          </span>
          <span v-else class="material-symbols-outlined">
            {{ modelValue === option.value ? 'radio_button_checked' : 'radio_button_unchecked' }}
          </span>
        </div>

        <!-- Content -->
        <div class="radio-card-content">
          <div class="radio-card-title">
            {{ option.title || option.label }}
            <Badge v-if="option.badge" :text="option.badge" variant="info" size="xs" />
          </div>
          <div v-if="option.description" class="radio-card-description">
            {{ option.description }}
          </div>
        </div>

        <!-- Check Mark for Selected State -->
        <div v-if="modelValue === option.value" class="radio-card-check">
          <span class="material-symbols-outlined">check</span>
        </div>
      </label>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  /* Default Radio Button Styles */
  .radio-group {
    @apply flex gap-4;
  }

  .radio-group__label {
    @apply text-sm font-semibold text-gray-700;
  }

  .radio-group__options {
    @apply flex;
  }

  .radio-group__options--row {
    @apply flex-row gap-4;
  }

  .radio-group__options--column {
    @apply flex-col gap-2;
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
    @apply border-primary-500;
  }

  .radio-group__input:checked + .radio-group__custom::after {
    content: '';
    @apply h-2 w-2 rounded-full bg-primary-500;
  }

  .radio-group__text {
    @apply text-sm text-gray-700;
  }

  .radio-group__input:disabled + .radio-group__custom {
    @apply cursor-not-allowed opacity-50;
  }

  /* Card Radio Button Styles */
  .radio-card-group {
    @apply space-y-3;
  }

  .radio-card-group__label {
    @apply mb-3 block text-sm font-semibold text-gray-700;
  }

  .radio-card-group__options {
    @apply flex;
  }

  .radio-card-group__options--row {
    @apply flex-row gap-4;
  }

  .radio-card-group__options--column {
    @apply flex-col gap-2;
  }

  .radio-card-option {
    @apply relative flex cursor-pointer items-center gap-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-gray-300;
  }

  /* Adjust card width for row layout */
  .radio-card-group__options--row .radio-card-option {
    @apply flex-1;
  }

  .radio-card-option--selected {
    @apply border-primary-500 bg-primary-50 text-primary-900;
  }

  .radio-card-option--disabled {
    @apply cursor-not-allowed opacity-50;
  }

  .radio-card-input {
    @apply sr-only;
  }

  .radio-card-icon {
    @apply flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-gray-500;
  }

  .radio-card-option--selected .radio-card-icon {
    @apply bg-primary-500 text-white;
  }

  .radio-card-content {
    @apply flex-1;
  }

  .radio-card-title {
    @apply flex items-center gap-2 text-base font-medium text-gray-900;
  }

  .radio-card-option--selected .radio-card-title {
    @apply text-primary-900;
  }

  .radio-card-description {
    @apply text-sm text-gray-500;
  }

  .radio-card-option--selected .radio-card-description {
    @apply text-primary-700;
  }

  .radio-card-check {
    @apply flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white;
    font-size: 16px;
  }
</style>
