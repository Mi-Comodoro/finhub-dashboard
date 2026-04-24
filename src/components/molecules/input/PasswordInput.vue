<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'
  import { Input } from '@/components/molecules'

  import type { InputSize,PasswordInputProps } from './types/input.types'

  const props = withDefaults(
    defineProps<PasswordInputProps & { size?: InputSize; iconStyle?: 'outline' | 'filled' }>(),
    {
      type: 'password',
      required: false,
      disabled: false,
      pattern: () => /.*/,
      error: '',
      errorMessage: '',
      placeholder: 'Contraseña',
      variant: 'column',
      size: 'default',
      readonly: false,
      iconStyle: 'outline'
    }
  )

  const emit = defineEmits(['update:modelValue', 'blur'])

  const modelValue = ref(props.modelValue ?? '')
  const showPassword = ref(false)

  watch(
    () => props.modelValue,
    newVal => {
      modelValue.value = newVal ?? ''
    }
  )

  const inputId = computed(() => props.id || props.name)
  const inputType = computed(() => (showPassword.value ? 'text' : 'password'))

  function handleInput(value: string) {
    modelValue.value = value
    emit('update:modelValue', value)
  }

  function handleBlur() {
    emit('blur')
  }

  function togglePasswordVisibility() {
    showPassword.value = !showPassword.value
  }
</script>

<template>
  <div class="password-input-container">
    <div :class="[variant === 'row' ? 'input-row' : 'input-column']">
      <div v-if="label" class="input-label-row">
        <Label
          :html-for="inputId"
          variant="form"
          size="sm"
          color="black"
          weight="bold"
          :required="required"
          :class="variant === 'row' ? 'inline-label' : ''"
        >
          {{ label }}
        </Label>
      </div>

      <div class="input-field">
        <Input
          :id="inputId"
          :name="name"
          :type="inputType"
          :placeholder="placeholder"
          :value="modelValue"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :error="error"
          :error-message="errorMessage"
          :pattern="pattern"
          :prefix="prefix"
          :size="size"
          :variant="variant"
          is-inside-group
          class="password-input"
          @update:model-value="handleInput"
          @blur="handleBlur"
        >
          <template #suffix>
            <button
              type="button"
              class="password-toggle material-symbols-outlined"
              :class="iconStyle"
              @click="togglePasswordVisibility"
            >
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </button>
          </template>
        </Input>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .password-input-container {
    @apply relative;
  }

  .password-input {
    @apply pr-10;
  }

  .password-toggle {
    @apply absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600;
  }

  .password-toggle.outline {
    @apply text-neutral-400;
  }

  .password-toggle.filled {
    @apply text-neutral-600;
  }
</style>
