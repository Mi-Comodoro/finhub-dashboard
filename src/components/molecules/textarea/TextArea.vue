<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'

  import Label from '@/components/atoms/typography/Label.vue'

  interface TextareaProps {
    modelValue: string
    id: string
    name: string
    label: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    rows?: number
    pattern?: RegExp
    error?: string | boolean
    errorMessage?: string
    variant?: 'row' | 'column'
    size?: 'sm' | 'default'
  }

  const props = withDefaults(defineProps<TextareaProps>(), {
    required: false,
    disabled: false,
    readonly: false,
    rows: 4,
    pattern: () => /.*/,
    error: '',
    errorMessage: 'Valor inválido',
    placeholder: ' ',
    variant: 'column',
    size: 'default'
  })

  const emit = defineEmits(['update:modelValue', 'blur'] as const)

  const modelValue = ref(props.modelValue ?? '')
  const internalError = ref(false)

  const textareaId = computed(() => props.id || props.name)

  watch(
    () => props.modelValue,
    val => {
      modelValue.value = val ?? ''
    }
  )

  const hasExternalError = computed(() => {
    if (typeof props.error === 'string') return props.error.trim().length > 0
    return !!props.error
  })

  const hasError = computed(() => internalError.value || hasExternalError.value)

  const displayErrorMessage = computed(() => {
    if (typeof props.error === 'string' && props.error.trim()) return props.error
    return props.errorMessage
  })

  function validate(value: string) {
    if (props.pattern instanceof RegExp) {
      internalError.value = !props.pattern.test(value)
    }
  }

  function handleInput(e: Event) {
    const value = (e.target as HTMLTextAreaElement).value
    modelValue.value = value
    validate(value)
    emit('update:modelValue', value)
  }
</script>

<template>
  <div class="textarea-container">
    <div :class="[variant === 'row' ? 'textarea-row' : 'textarea-column']">
      <Label
        v-if="label"
        :html-for="textareaId"
        variant="form"
        size="sm"
        color="muted"
        :required="required"
      >
        {{ label }}
      </Label>

      <textarea
        :id="textareaId"
        :name="name"
        :rows="rows"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'textarea',
          size === 'sm' ? 'textarea--sm' : 'textarea--default',
          hasError ? 'textarea--error' : 'textarea--normal',
          disabled ? 'textarea--disabled' : '',
          readonly && !disabled ? 'textarea--readonly' : ''
        ]"
        @input="handleInput"
        @blur="emit('blur')"
      />

      <p v-if="hasError" class="textarea-error">
        {{ displayErrorMessage }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .textarea-container {
    @apply w-full;
  }

  .textarea-row {
    @apply flex w-full items-start gap-3;
  }

  .textarea-column {
    @apply flex w-full flex-col gap-1;
  }

  .textarea {
    @apply w-full resize-none rounded-md border bg-white text-neutral-900 transition-colors duration-200 placeholder:text-neutral-400 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500;
  }

  .textarea--sm {
    @apply px-2 py-1 text-xs;
  }

  .textarea--default {
    @apply px-3 py-2 text-sm;
  }

  .textarea--normal {
    @apply border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-neutral-600 dark:focus:border-teal-400 dark:focus:ring-teal-400;
  }

  .textarea--error {
    @apply border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400;
  }

  .textarea--disabled {
    @apply cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500;
  }

  .textarea--readonly {
    @apply border-dashed border-slate-300 bg-slate-50 italic text-slate-500 dark:border-slate-600 dark:bg-neutral-800 dark:text-slate-400;
  }

  .textarea-error {
    @apply mt-1 text-xs text-red-600 dark:text-red-400;
  }
</style>
