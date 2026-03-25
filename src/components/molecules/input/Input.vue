<script lang="ts" setup>
  import { computed, ref, useSlots, watch } from 'vue'

  import { Label } from '@/components/atoms'

  import type { InputProps, InputSize } from './types/input.types'

  const props = withDefaults(defineProps<InputProps & { size?: InputSize }>(), {
    type: 'text',
    required: false,
    disabled: false,
    pattern: () => /.*/,
    error: '',
    errorMessage: 'Valor inválido',
    placeholder: ' ',
    variant: 'column',
    searchIcon: false,
    forgotPassword: false,
    forgotPasswordText: '',
    showPasswordToggle: false,
    passwordIconStyle: 'outline',
    size: 'default',
    readonly: false
  })

  const emit = defineEmits(['update:modelValue', 'blur'])
  const slots = useSlots()
  const modelValue = ref(props.modelValue ?? '')
  const internalError = ref(false)
  const touched = ref(false)
  const showPassword = ref(false)

  watch(
    () => props.modelValue,
    newVal => {
      modelValue.value = newVal ?? ''
    }
  )

  const inputId = computed(() => props.id || props.name)

  const hasExternalError = computed(() => {
    if (typeof props.error === 'string') {
      return props.error.trim().length > 0
    }
    return !!props.error
  })

  const hasError = computed(() => {
    if (!touched.value) return false
    return internalError.value || hasExternalError.value
  })

  const displayErrorMessage = computed(() => {
    if (typeof props.error === 'string' && props.error.trim()) {
      return props.error
    }
    return props.errorMessage
  })

  function validate(value: string | number) {
    const stringValue = value.toString()

    if (props.required && !stringValue.trim()) {
      internalError.value = true
      return
    }

    if (!value) {
      internalError.value = false
      return
    }

    if (props.pattern instanceof RegExp) {
      internalError.value = !props.pattern.test(stringValue)
    } else {
      internalError.value = false
    }
  }

  function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value

    modelValue.value = value

    if (touched.value) {
      validate(value)
    }

    emit('update:modelValue', value)
  }

  function handleBlur() {
    touched.value = true
    validate(modelValue.value)

    emit('blur')
  }

  const inputType = computed(() => {
    if (props.type === 'password' && props.showPasswordToggle) {
      return showPassword.value ? 'text' : 'password'
    }
    return props.type
  })

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }

  const sizeClasses = computed(() => {
    if (props.size === 'sm') {
      return {
        input: 'input--sm',
        icon: 'input__icon--sm',
        label: 'input__label--sm'
      }
    }

    return {
      input: 'input--default',
      icon: 'input__icon--default',
      label: 'input__label--default'
    }
  })

  const inputClasses = computed(() => [
    'input',
    sizeClasses.value.input,
    { 'input-with-icon-left': props.searchIcon || props.type === 'search' },
    hasError.value ? 'input--error' : 'input--normal',
    props.disabled ? 'input--disabled' : '',
    props.readonly ? 'input--readonly' : '',
    props.prefix ? 'input--with-prefix' : '',
    props.searchIcon || (props.type === 'password' && props.showPasswordToggle) || !!slots.suffix
      ? 'input--with-icon '
      : ''
  ])
</script>

<template>
  <div class="input-container">
    <div :class="[variant === 'row' ? 'input-row' : 'input-column']">
      <div v-if="label || forgotPassword" class="input-label-row">
        <Label
          v-if="label"
          :html-for="inputId"
          variant="form"
          size="sm"
          color="black"
          weight="bold"
          :required="required"
          :class="[variant === 'row' ? 'inline-label' : '', sizeClasses.label]"
        >
          {{ label }}
        </Label>

        <a
          v-if="forgotPassword && forgotPasswordText"
          href="#"
          :class="['input-forgot', sizeClasses.label]"
        >
          {{ forgotPasswordText }}
        </a>
      </div>

      <div class="input-field">
        <span v-if="prefix" class="input-prefix">
          {{ prefix }}
        </span>
        <span
          v-if="searchIcon"
          :class="['input-search-icon material-symbols-outlined', sizeClasses.icon]"
          aria-hidden="true"
        >
          search
        </span>
        <input
          :id="inputId"
          :name="name"
          :type="inputType"
          :class="inputClasses"
          :placeholder="placeholder"
          :value="modelValue"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          autocomplete="off"
          @input="handleInput"
          @blur="handleBlur"
        />

        <div v-if="$slots.suffix" class="input-suffix">
          <slot name="suffix" />
        </div>

        <button
          v-if="type === 'password' && showPasswordToggle"
          type="button"
          class="material-symbols-outlined"
          :class="[
            'input-password-toggle',
            size === 'sm' ? 'input-password-toggle--sm' : 'input-password-toggle--default'
          ]"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          @click="togglePasswordVisibility"
        >
          {{ showPassword ? 'visibility_off' : 'visibility' }}
        </button>
      </div>

      <p
        v-if="hasError"
        :class="['input-error', size === 'sm' ? 'input-error--sm' : 'input-error--default']"
      >
        {{ displayErrorMessage }}
      </p>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .input-container {
    @apply w-full;
  }

  .input-row {
    @apply flex w-full items-center gap-3;
  }

  .input-column {
    @apply flex w-full flex-col gap-1;
  }

  .input-label-row {
    @apply flex justify-between;
  }

  .input__label--sm {
    @apply text-xs;
  }

  .input__label--default {
    @apply text-sm;
  }

  .input-forgot {
    @apply font-medium text-teal-600 no-underline transition-colors duration-200 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300;
  }

  .input-field {
    @apply relative w-full;
  }

  .input {
    @apply w-full rounded-md border bg-white text-neutral-900 transition-colors duration-200 placeholder:text-neutral-400 placeholder:opacity-100 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500;
  }

  .input--sm {
    @apply px-2 py-1 text-xs;
  }

  .input--default {
    @apply px-3 py-2 text-sm;
  }

  .input--error {
    @apply border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400;
  }

  .input--normal {
    @apply border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-neutral-600 dark:focus:border-teal-400 dark:focus:ring-teal-400;
  }

  .input--disabled {
    @apply cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500;
  }

  .input--readonly {
    @apply cursor-default border-dashed border-slate-300 bg-slate-50 italic text-slate-500 focus:border-dashed focus:ring-0 dark:border-slate-600 dark:bg-neutral-800 dark:text-slate-400;
  }

  .input--with-icon {
    @apply pr-10;
  }

  .input__icon--sm {
    @apply text-base;
  }

  .input__icon--default {
    @apply text-lg;
  }

  .input-search-icon {
    @apply pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400;
  }

  .input-password-toggle {
    @apply absolute right-3 top-1/2 -translate-y-1/2 p-1 text-teal-600 transition-colors duration-200 hover:text-teal-700 focus:outline-none dark:text-teal-400 dark:hover:text-teal-300;
  }

  .input-password-toggle--sm {
    @apply p-0.5;
  }

  .input-password-toggle--default {
    @apply p-1;
  }

  .input-error {
    @apply mt-1 block text-red-600 dark:text-red-400;
  }

  .input-error--sm {
    @apply text-xs;
  }

  .input-error--default {
    @apply text-xs;
  }

  .input-prefix {
    @apply pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500;
  }

  .input--with-prefix {
    @apply pl-12;
  }

  .input--number {
    @apply text-right;
  }

  .input-suffix {
    @apply absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-neutral-500 dark:text-neutral-400;
  }
  .input-password-toggle--sm {
    @apply text-sm;
  }
</style>

<style scoped>
  .material-symbols-filled {
    font-variation-settings: 'FILL' 1;
  }

  .input--readonly:focus {
    outline: none;
    box-shadow: none;
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .input-with-icon-left {
    padding-left: 40px !important; /* Espacio suficiente para el icono */
  }
</style>
