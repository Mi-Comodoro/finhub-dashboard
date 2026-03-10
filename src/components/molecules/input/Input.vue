<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'
  import type { InputProps } from '@/components/molecules'

  const props = withDefaults(
    defineProps<
      InputProps & {
        size?: 'sm' | 'default'
      }
    >(),
    {
      type: 'text',
      tag: 'input',
      required: false,
      disabled: false,
      pattern: () => /.*/,
      error: '',
      errorMessage: 'Valor inválido',
      placeHolder: '',
      placeholder: ' ',
      variant: 'column',
      searchIcon: false,
      forgotPassword: false,
      forgotPasswordText: '',
      showPasswordToggle: false,
      passwordIconStyle: 'outline',
      size: 'default',
      readonly: false
    }
  )

  const emit = defineEmits(['update:modelValue', 'blur'])

  const internalError = ref(false)
  const modelValue = ref(props.modelValue ?? '')
  const showPassword = ref(false)

  const inputId = computed(() => props.id || props.name)

  const normalizedPlaceholder = computed(() => props.placeholder || props.placeHolder || ' ')

  const hasExternalError = computed(() => {
    if (typeof props.error === 'string') {
      return props.error.trim().length > 0
    }

    return !!props.error
  })

  const hasError = computed(() => internalError.value || hasExternalError.value)

  const displayErrorMessage = computed(() => {
    if (typeof props.error === 'string' && props.error.trim()) {
      return props.error
    }

    return props.errorMessage
  })

  watch(
    () => props.modelValue,
    newVal => {
      modelValue.value = newVal ?? ''
    }
  )

  const handleInput = (event: Event) => {
    modelValue.value = (event.target as HTMLInputElement).value
    validate(modelValue.value)
    emit('update:modelValue', modelValue.value)
  }

  const inputType = computed(() => {
    if (props.type === 'password' && props.showPasswordToggle) {
      return showPassword.value ? 'text' : 'password'
    }
    return props.type
  })

  const passwordIcon = computed(() => {
    return showPassword.value ? 'visibility_off' : 'visibility'
  })

  const iconClass = computed(() => {
    switch (props.passwordIconStyle) {
      case 'filled':
        return 'material-symbols-outlined material-symbols-filled text-primary-500 hover:text-primary-600'
      case 'rounded':
        return 'material-symbols-rounded'
      default:
        return 'material-symbols-outlined material-symbols-filled text-primary-500 hover:text-primary-600'
    }
  })

  // Clases de tamaño compatibles con el Select
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
    hasError.value ? 'input--error' : 'input--normal',
    props.disabled ? 'input--disabled' : '',
    props.readonly && !props.disabled ? 'input--readonly' : '',
    props.tag === 'textarea' ? 'input--textarea' : '',
    props.searchIcon || (props.type === 'password' && props.showPasswordToggle)
      ? 'input--with-icon'
      : ''
  ])

  const rows = computed(() => (props.tag === 'textarea' ? 4 : undefined))

  function validate(value: string) {
    if (props.pattern instanceof RegExp) {
      internalError.value = !props.pattern.test(value)
    } else {
      internalError.value = false
    }
  }

  function handlePaste(e: ClipboardEvent) {
    const clipboard = e.clipboardData
    if (clipboard) {
      const pasted = clipboard.getData('text')
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      const newValue = target.value + pasted

      validate(newValue)
      emit('update:modelValue', newValue)
    }
  }

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }
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
          color="muted"
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

      <div
        :class="[searchIcon || (type === 'password' && showPasswordToggle) ? 'input-relative' : '']"
      >
        <component
          :is="tag"
          :id="inputId"
          :name="name"
          :type="inputType"
          :class="inputClasses"
          :placeholder="normalizedPlaceholder"
          :value="modelValue"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :rows="rows"
          autocomplete="off"
          @input="handleInput"
          @paste="handlePaste"
          @blur="emit('blur')"
        />

        <!-- Ícono de búsqueda -->
        <span v-if="searchIcon" :class="['input-search-icon', sizeClasses.icon]" aria-hidden="true">
          search
        </span>

        <!-- Ícono de toggle de contraseña -->
        <button
          v-if="type === 'password' && showPasswordToggle"
          type="button"
          :class="[
            'input-password-toggle',
            size === 'sm' ? 'input-password-toggle--sm' : 'input-password-toggle--default'
          ]"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          @click="togglePasswordVisibility"
        >
          <span :class="[iconClass, sizeClasses.icon]">
            {{ passwordIcon }}
          </span>
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
  .input-relative {
    @apply relative w-full;
  }
  .input {
    @apply w-full rounded-md border bg-white text-gray-900 transition-colors duration-200 placeholder:text-gray-400 placeholder:opacity-100 focus:outline-none dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500;
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
    @apply border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-gray-600 dark:focus:border-teal-400 dark:focus:ring-teal-400;
  }
  .input--disabled {
    @apply cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500;
  }
  .input--readonly {
    @apply cursor-default border-dashed border-slate-300 bg-slate-50 italic text-slate-500 focus:border-dashed focus:ring-0 dark:border-slate-600 dark:bg-gray-800 dark:text-slate-400;
  }
  .input--textarea {
    @apply resize-none;
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
    @apply pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400;
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
</style>

<style scoped>
  .material-symbols-filled {
    font-variation-settings: 'FILL' 1;
  }

  /* Read-only: dashed border, suppressed focus ring, italic text to signal non-editable */
  .input--readonly {
    font-style: italic;
  }

  .input--readonly:focus {
    outline: none;
    box-shadow: none;
  }
</style>
