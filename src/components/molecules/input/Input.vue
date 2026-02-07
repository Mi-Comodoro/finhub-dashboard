<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'

  import type { InputProps } from '../types/molecule.types'

  const props = withDefaults(defineProps<InputProps>(), {
    type: 'text',
    tag: 'input',
    required: false,
    disabled: false,
    pattern: () => /.*/,
    errorMessage: 'Valor inválido',
    placeHolder: ' ',
    variant: 'column',
    searchIcon: false,
    forgotPassword: false,
    forgotPasswordText: '',
    showPasswordToggle: false,
    passwordIconStyle: 'outline'
  })

  const emit = defineEmits(['update:modelValue'])

  const error = ref(false)
  const modelValue = ref(props.modelValue ?? '')
  const showPassword = ref(false)

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
        return 'material-symbols-outlined material-symbols-filled text-teal-500 hover:text-teal-600'
      case 'rounded':
        return 'material-symbols-rounded'
      default:
        return 'material-symbols-outlined'
    }
  })

  const inputClasses = computed(() => [
    'w-full text-sm transition-colors duration-200',
    'rounded-md border px-3 py-3 bg-white text-gray-900',
    'placeholder:text-gray-400 placeholder:opacity-100',
    'focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600',
    {
      'border-danger-500': error.value,
      'cursor-not-allowed bg-gray-100': props.disabled,
      'resize-none': props.tag === 'textarea',
      'pr-10': props.searchIcon || (props.type === 'password' && props.showPasswordToggle)
    }
  ])

  const rows = computed(() => (props.tag === 'textarea' ? 4 : undefined))

  function validate(value: string) {
    if (props.pattern instanceof RegExp) {
      error.value = !props.pattern.test(value)
    } else {
      error.value = false
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
  <div class="w-full">
    <div
      :class="[variant === 'row' ? 'flex items-center gap-3' : 'flex flex-col gap-1']"
      class="w-full"
    >
      <div v-if="label || forgotPassword" class="flex justify-between">
        <Label
          v-if="label"
          :for-id="name"
          :text="label"
          :required="required"
          :class="variant === 'row' ? 'inline-label' : ''"
        />
        <a
          v-if="forgotPassword && forgotPasswordText"
          href="#"
          class="text-sm font-medium text-green-600 no-underline hover:underline"
        >
          {{ forgotPasswordText }}
        </a>
      </div>

      <div
        :class="[
          searchIcon || (type === 'password' && showPasswordToggle) ? 'relative w-full' : ''
        ]"
      >
        <component
          :is="tag"
          :id="name"
          :name="name"
          :type="inputType"
          :class="inputClasses"
          :placeholder="placeHolder"
          :value="modelValue"
          :required="required"
          :disabled="disabled"
          :rows="rows"
          autocomplete="off"
          @input="handleInput"
          @paste="handlePaste"
        />

        <!-- Ícono de búsqueda -->
        <span
          v-if="searchIcon"
          class="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-900"
          aria-hidden="true"
        >
          search
        </span>

        <!-- Ícono de toggle de contraseña -->
        <button
          v-if="type === 'password' && showPasswordToggle"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-green-600 transition-colors duration-200 hover:text-green-900 focus:outline-none"
          @click="togglePasswordVisibility"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          <span :class="iconClass" class="text-lg">
            {{ passwordIcon }}
          </span>
        </button>
      </div>

      <p v-if="error" class="mt-1 block text-xs text-red-500">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<style scoped>
  /* Solo clases de utilidad que necesiten !important o casos muy específicos */
  .material-symbols-filled {
    font-variation-settings: 'FILL' 1;
  }
</style>
