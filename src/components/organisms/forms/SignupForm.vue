<script setup lang="ts">
  import { ref, watch } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import Label from '@/components/atoms/typography/Label.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import PasswordInput from '@/components/molecules/input/PasswordInput.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { useAuth } from '@/composables/useAuth'
  import { DIAL_CODE_OPTIONS } from '~/common/constants'

  import type { SignupFormEmits, SignupFormProps } from './types/signup-form.types'

  defineProps<SignupFormProps>()
  const emit = defineEmits<SignupFormEmits>()

  const name = ref('')
  const handleValue = ref('')
  const handleTouched = ref(false)
  const email = ref('')
  const phoneNumber = ref('')
  const dialCode = ref('+57')
  const password = ref('')
  const confirmPassword = ref('')

  const { signup, error: authError } = useAuth()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const handleError = ref<string | null>(null)

  function suggestHandle(raw: string): string {
    return raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/^[^a-z]+/, '')
      .slice(0, 20)
  }

  watch(name, newName => {
    if (!handleTouched.value) {
      const suggestion = suggestHandle(newName)
      if (suggestion.length >= 1) handleValue.value = suggestion
    }
  })

  watch(handleValue, newVal => {
    const cleaned = newVal
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20)
    if (cleaned !== newVal) handleValue.value = cleaned
  })

  function onHandleBlur() {
    handleTouched.value = true
    validateHandle()
  }

  function validateHandle() {
    const v = handleValue.value
    if (!v.trim()) {
      handleError.value = 'El nombre de usuario es requerido'
      return false
    }
    if (v.length < 3) {
      handleError.value = 'Mínimo 3 caracteres'
      return false
    }
    if (v.length > 20) {
      handleError.value = 'Máximo 20 caracteres'
      return false
    }
    if (!/^[a-z]/.test(v)) {
      handleError.value = 'Debe comenzar con una letra'
      return false
    }
    if (!/^[a-z][a-z0-9_]*$/.test(v)) {
      handleError.value = 'Solo letras minúsculas, números y _'
      return false
    }
    handleError.value = null
    return true
  }

  const validate = (): string | null => {
    if (!name.value.trim() || name.value.trim().length < 2) {
      return 'El nombre es requerido (mínimo 2 caracteres)'
    }
    if (!validateHandle()) return handleError.value
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      return 'Ingresa un correo electrónico válido'
    }
    if (!phoneNumber.value.trim()) {
      return 'El número de teléfono es requerido'
    }
    if (!/^\d+$/.test(phoneNumber.value)) {
      return 'El teléfono solo debe contener números'
    }
    if (phoneNumber.value.length < 7) {
      return 'El teléfono debe tener al menos 7 dígitos'
    }
    if (!password.value || password.value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (password.value !== confirmPassword.value) {
      return 'Las contraseñas no coinciden'
    }
    return null
  }

  const handleSubmit = async (): Promise<void> => {
    const validationError = validate()
    if (validationError) {
      error.value = validationError
      return
    }

    isLoading.value = true
    error.value = null

    const { success } = await signup({
      email: email.value,
      password: password.value,
      name: name.value,
      displayName: name.value,
      handle: handleValue.value,
      phone: `${dialCode.value}${phoneNumber.value}`
    })

    if (!success) {
      error.value = authError.value || 'Error desconocido al crear la cuenta'
    } else {
      await navigateTo('/dashboard')
    }

    isLoading.value = false
  }
</script>

<template>
  <div class="signup-form">
    <div class="signup-form__inner">
      <div>
        <CardInfo
          level="h2"
          title-size="3xl"
          title="Crea tu cuenta"
          color="black"
          weight="extrabold"
          sub-title="Regístrate en Mi Comodoro y toma control de tus finanzas"
          sub-title-size="sm"
          sub-title-color="muted"
        />
      </div>

      <div v-if="error" class="signup-form__error">
        <div class="signup-form__error-inner">
          <Text size="sm" weight="medium" class="signup-form__error-text">
            {{ error }}
          </Text>
        </div>
      </div>

      <form class="signup-form__fields" @submit.prevent="handleSubmit">
        <Input
          id="name"
          v-model="name"
          name="name"
          label="Nombre completo"
          required
          placeholder="Ej. Juan Pérez"
          error-message="El nombre es requerido"
        />

        <Input
          id="handle"
          v-model="handleValue"
          name="handle"
          label="Nombre de usuario"
          prefix="@"
          placeholder="tunombre"
          required
          :error="handleError ?? ''"
          hint="Tus amigos te encontrarán con tu @usuario. Solo letras minúsculas, números y _ ."
          @blur="onHandleBlur"
        />

        <Input
          id="email"
          v-model="email"
          name="email"
          label="Correo electrónico"
          required
          placeholder="nombre@empresa.com"
          error-message="Correo inválido"
        />

        <!-- Teléfono -->
        <div class="signup-form__field-group">
          <Label variant="form" size="sm" weight="bold" color="black" require>Teléfono</Label>
          <div class="signup-form__phone-fields">
            <Select
              v-model="dialCode"
              name="dialCode"
              :options="DIAL_CODE_OPTIONS"
              placeholder="+57"
              class="signup-form__dial-select"
            />
            <div class="signup-form__phone-number">
              <Input
                id="phoneNumber"
                v-model="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="300 123 4567"
                required
                error-message="El teléfono es requerido"
              />
            </div>
          </div>
        </div>

        <PasswordInput
          id="password"
          v-model="password"
          name="password"
          placeholder="Mínimo 8 caracteres"
          required
          label="Contraseña"
          error-message="La contraseña debe tener al menos 8 caracteres"
        />

        <PasswordInput
          id="confirmPassword"
          v-model="confirmPassword"
          name="confirmPassword"
          placeholder="Repite tu contraseña"
          required
          label="Confirmar contraseña"
          error-message="Las contraseñas no coinciden"
        />

        <Button
          type="submit"
          class="signup-form__submit"
          variant="primary"
          size="sm"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Crear cuenta
        </Button>
      </form>

      <Text size="sm" color="muted" class="signup-form__login-prompt">
        ¿Ya tienes una cuenta?
        <button type="button" class="signup-form__login-link" @click="emit('back-to-login')">
          Inicia sesión
        </button>
      </Text>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .signup-form {
    @apply w-full p-4;
  }

  .signup-form__inner {
    @apply flex w-full flex-col gap-6;
  }

  .signup-form__error {
    @apply rounded-lg border border-red-200 bg-red-50 p-4 transition-colors duration-200;
    @apply dark:border-red-800 dark:bg-red-900/20;
  }

  .signup-form__error-inner {
    @apply flex items-center;
  }

  .signup-form__error-text {
    @apply text-red-800;
    @apply dark:text-red-200;
  }

  .signup-form__fields {
    @apply w-full space-y-2;
  }

  .signup-form__field-group {
    @apply mb-1 space-y-1;
  }

  /* ── Teléfono ── */
  .signup-form__phone-fields {
    @apply flex gap-2;
  }

  .signup-form__dial-select {
    @apply w-32 flex-shrink-0;
  }

  .signup-form__phone-number {
    @apply flex-1;
  }

  .signup-form__submit {
    @apply w-full;
  }

  .signup-form__login-prompt {
    @apply text-center;
  }

  .signup-form__login-link {
    @apply font-semibold text-teal-600 transition-colors duration-200;
    @apply hover:text-teal-700;
    @apply dark:text-teal-400 dark:hover:text-teal-300;
  }
</style>
