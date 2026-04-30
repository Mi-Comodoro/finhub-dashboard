<script setup lang="ts">
  import { computed, ref, useSlots, watch } from 'vue'

  import { Label } from '@/components/atoms'

  import type { InputProps, InputSize } from './types/input.types'

  const props = withDefaults(defineProps<InputProps & { size?: InputSize }>(), {
    type: 'text',
    required: false,
    disabled: false,
    pattern: () => /.*/,
    error: '',
    errorMessage: '',
    placeholder: ' ',
    variant: 'column',
    size: 'sm',
    readonly: false,
    isInsideGroup: false
  })

  const emit = defineEmits(['update:modelValue', 'blur', 'keydown'])
  const slots = useSlots()

  const modelValue = ref(props.modelValue ?? '')
  const internalError = ref(false)
  const touched = ref(false)

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

  const sizeClasses = computed(() => {
    const sizeMap = {
      sm: { input: 'input--sm', label: 'input__label--sm' },
      md: { input: 'input--md', label: 'input__label--md' },
      lg: { input: 'input--lg', label: 'input__label--lg' }
    }

    return sizeMap[props.size] || sizeMap.sm
  })

  /**
   * 🔥 CLAVE: neutralización sin romper estados
   */
  const groupClasses = computed(() => {
    if (!props.isInsideGroup) return ''

    return [
      'input--group',
      // mantiene focus pero sin competir
      hasError.value ? 'input--group-error' : 'input--group-normal'
    ]
  })

  const inputClasses = computed(() => [
    'input',
    sizeClasses.value.input,

    // 👇 SOLO aplica normal/error si NO está en grupo
    !props.isInsideGroup && (hasError.value ? 'input--error' : 'input--normal'),

    props.disabled ? 'input--disabled' : '',
    props.readonly ? 'input--readonly' : '',
    props.prefix ? 'input--with-prefix' : '',

    !slots.suffix ? 'input--with-suffix' : '',

    groupClasses.value
  ])
</script>

<template>
  <div class="input-container">
    <div :class="[variant === 'row' ? 'input-row' : 'input-column']">
      <div v-if="label" class="input-label-row">
        <Label
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
      </div>

      <div class="input-field">
        <span v-if="prefix" class="input-prefix">
          {{ prefix }}
        </span>

        <input
          :id="inputId"
          :name="name"
          :type="type"
          :class="inputClasses"
          :placeholder="placeholder"
          :value="modelValue"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          autocomplete="off"
          @input="handleInput"
          @blur="handleBlur"
          @keydown="emit('keydown', $event)"
        />

        <div v-if="$slots.suffix" class="input-suffix">
          <slot name="suffix" />
        </div>
      </div>

      <p
        v-if="hasError"
        :class="['input-error', `input-error--${size}`]"
      >
        {{ displayErrorMessage }}
      </p>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .input {
    @apply w-full rounded-md border bg-white text-neutral-900 transition-all duration-200 placeholder:text-neutral-400 focus:outline-none;
  }

  /* tamaños */
  .input--sm {
    @apply h-8 px-2 py-0 text-xs;
  }
  .input--md {
    @apply px-3 py-2 text-sm;
  }
  .input--lg {
    @apply px-4 py-3 text-base;
  }

  /* normal */
  .input--normal {
    @apply border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500;
  }

  /* error */
  .input--error {
    @apply border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500;
  }

  /* 👇 MODO GROUP (clave real) */
  .input--group {
    @apply border-none bg-transparent shadow-none ring-0;
  }

  /* mantiene feedback pero sin competir */
  .input--group-normal {
    @apply focus:ring-0;
  }

  .input--group-error {
    @apply text-red-600;
  }

  /* estados */
  .input--disabled {
    @apply cursor-not-allowed bg-neutral-100 text-neutral-400;
  }

  .input--readonly {
    @apply cursor-default text-slate-500;
  }

  /* error */
  .input-error {
    @apply mt-1 text-xs text-red-600;
  }

  .input-error--sm {
    @apply text-xs;
  }

  .input-error--md {
    @apply text-sm;
  }

  .input-error--lg {
    @apply text-base;
  }

  .input-prefix {
    @apply absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500;
  }

  .input--with-prefix {
    @apply pl-12;
  }

  .input-suffix {
    @apply absolute right-3 top-1/2 -translate-y-1/2;
  }

  .input--with-suffix {
    @apply pr-10;
  }
</style>
