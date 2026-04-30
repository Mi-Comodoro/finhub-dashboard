<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Icon, Label } from '@/components/atoms'

  import type { InputSize, PasswordInputProps } from './types/input.types'

  const props = withDefaults(
    defineProps<PasswordInputProps & { size?: InputSize; iconStyle?: 'outline' | 'filled' }>(),
    {
      required: false,
      disabled: false,
      pattern: () => /.*/,
      error: '',
      errorMessage: '',
      placeholder: 'Contraseña',
      variant: 'column',
      size: 'sm',
      readonly: false,
      iconStyle: 'outline'
    }
  )

  const emit = defineEmits(['update:modelValue', 'blur'])

  const modelValue = ref(props.modelValue ?? '')
  const showPassword = ref(false)
  const touched = ref(false)
  const internalError = ref(false)

  watch(
    () => props.modelValue,
    newVal => {
      modelValue.value = newVal ?? ''
    }
  )

  const inputId = computed(() => props.id || props.name)
  const inputType = computed(() => (showPassword.value ? 'text' : 'password'))

  const hasExternalError = computed(() => {
    if (typeof props.error === 'string') return props.error.trim().length > 0
    return !!props.error
  })

  const hasError = computed(() => {
    if (!touched.value) return false
    return internalError.value || hasExternalError.value
  })

  const displayErrorMessage = computed(() => {
    if (typeof props.error === 'string' && props.error.trim()) return props.error
    return props.errorMessage
  })

  const inputSizeClass = computed(() => {
    const map: Record<InputSize, string> = {
      sm: 'password-input__input--sm',
      md: 'password-input__input--md',
      lg: 'password-input__input--lg'
    }
    return map[props.size] ?? map.sm
  })

  const iconSize = computed(() => {
    const map: Record<InputSize, string> = { sm: 'sm', md: 'md', lg: 'lg' }
    return map[props.size] ?? 'sm'
  })

  function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    modelValue.value = value
    emit('update:modelValue', value)
  }

  function handleBlur() {
    touched.value = true
    if (props.required && !modelValue.value) internalError.value = true
    emit('blur')
  }

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }
</script>

<template>
  <div class="password-input">
    <Label
      v-if="label"
      :html-for="inputId"
      variant="form"
      size="sm"
      color="black"
      weight="bold"
      :required="required"
    >
      {{ label }}
    </Label>

    <div
      class="password-input__field"
      :class="{
        'password-input__field--error': hasError,
        'password-input__field--disabled': disabled
      }"
    >
      <input
        :id="inputId"
        :name="name"
        :type="inputType"
        :class="['password-input__input', inputSizeClass]"
        :placeholder="placeholder"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        autocomplete="off"
        @input="handleInput"
        @blur="handleBlur"
      />

      <button
        type="button"
        class="password-input__icon"
        :class="iconStyle"
        @click="togglePasswordVisibility"
      >
        <Icon :name="showPassword ? 'visibility_off' : 'visibility'" :size="iconSize" />
      </button>
    </div>

    <p v-if="hasError" class="password-input__error">
      {{ displayErrorMessage }}
    </p>
  </div>
</template>

<style lang="postcss" scoped>
  .password-input {
    @apply flex w-full flex-col gap-1;
  }

  .password-input__field {
    @apply flex items-center justify-between rounded-md border border-neutral-300 bg-white transition-all duration-200;
  }

  .password-input__field:hover {
    @apply border-primary-400;
  }

  .password-input__field:focus-within {
    @apply border-primary-500 ring-1 ring-primary-500;
  }

  .password-input__field--error {
    @apply border-red-500;
  }

  .password-input__field--error:focus-within {
    @apply border-red-500 ring-1 ring-red-500;
  }

  .password-input__field--disabled {
    @apply cursor-not-allowed bg-neutral-100;
  }

  .password-input__input {
    @apply flex-1 border-none bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400;
  }

  .password-input__input--sm {
    @apply h-8 px-2 py-0 text-xs;
  }

  .password-input__input--md {
    @apply px-3 py-2 text-sm;
  }

  .password-input__input--lg {
    @apply px-4 py-3 text-base;
  }

  .password-input__input:disabled {
    @apply cursor-not-allowed text-neutral-400;
  }

  .password-input__icon {
    @apply flex items-center justify-center border-none bg-transparent pr-3 text-neutral-400 outline-none transition-colors hover:text-neutral-600 focus:outline-none;
  }

  .password-input__icon.outline {
    @apply text-neutral-400;
  }

  .password-input__icon.filled {
    @apply text-neutral-600;
  }

  .password-input__error {
    @apply text-xs text-red-600;
  }
</style>
