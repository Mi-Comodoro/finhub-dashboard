<script setup lang="ts">
  import { ref } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import GoogleIcon from '@/components/atoms/icons/GoogleIcon.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import ConsentCheckbox from '@/components/business/legal/ConsentCheckbox.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import PasswordInput from '@/components/molecules/input/PasswordInput.vue'
  import { useLegalApplication } from '@/composables/application/useLegalApplication'
  import { useAuth } from '@/composables/useAuth'

  import type { LoginFormState } from './types/login-form.types'

  const email = ref<LoginFormState['email']>('')
  const password = ref<LoginFormState['password']>('')

  const { login, loginWithGoogle, error: authError } = useAuth()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Data-policy authorization (Ley 1581): only active when the server makes it mandatory
  const { consentRequired, policyVersion, loadVersions } = useLegalApplication()
  const needsConsent = ref(false)
  const consentAccepted = ref(false)
  const showConsentInvalid = ref(false)

  onMounted(() => {
    loadVersions()
  })

  const handleGoogleLogin = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const { success, consentRequired: askConsent } = await loginWithGoogle()

      if (askConsent) {
        // Existing accounts never get here: only a new account needs to accept first
        needsConsent.value = true
        return
      }

      if (!success) {
        error.value = authError.value || 'Error desconocido durante la autenticacion'
        return
      }

      await navigateTo('/dashboard')
    } finally {
      isLoading.value = false
    }
  }

  const handleGoogleConsent = async (): Promise<void> => {
    if (!consentAccepted.value) {
      showConsentInvalid.value = true
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const { success } = await loginWithGoogle(policyVersion.value)

      if (!success) {
        error.value = authError.value || 'Error desconocido durante la autenticacion'
        return
      }

      await navigateTo('/dashboard')
    } finally {
      isLoading.value = false
    }
  }

  const handleEmailLogin = async (): Promise<void> => {
    if (!email.value || !password.value) {
      error.value = 'Por favor completa todos los campos'
      return
    }

    isLoading.value = true
    error.value = null

    const { success } = await login(email.value, password.value)

    if (!success) {
      error.value = authError.value || 'Error desconocido durante la autenticacion'
    } else {
      const destination = '/dashboard'
      await navigateTo(destination)

      email.value = ''
      password.value = ''
    }

    isLoading.value = false
  }

  const handleSubmit = (): void => {
    handleEmailLogin()
  }
</script>

<template>
  <div class="login-form">
    <div class="login-form__content">
      <div>
        <CardInfo
          level="h2"
          title-size="3xl"
          title="Bienvenido"
          color="black"
          weight="extrabold"
          sub-title="Inicia sesion en tu panel de Mi Comodoro"
          sub-title-size="sm"
          sub-title-color="muted"
        />
      </div>

      <div v-if="error" class="login-form__error">
        <div class="login-form__error-body">
          <Text size="sm" weight="medium" class="login-form__error-text">
            {{ error }}
          </Text>
        </div>
      </div>

      <Button
        variant="outline"
        class="login-form__google-button"
        size="sm"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <GoogleIcon class="login-form__google-icon" :size="18" />
        <span>
          {{ isLoading ? 'Conectando...' : 'Iniciar sesion con Google' }}
        </span>
      </Button>

      <div v-if="needsConsent" class="login-form__new-account">
        <Text size="sm" weight="medium">
          Para crear tu cuenta con Google necesitamos tu autorización.
        </Text>
        <ConsentCheckbox
          id="login-consent"
          v-model="consentAccepted"
          :policy-version="policyVersion"
          :invalid="showConsentInvalid && !consentAccepted"
        />
        <Button
          variant="primary"
          size="sm"
          class="login-form__full-width"
          :loading="isLoading"
          :disabled="isLoading"
          @click="handleGoogleConsent"
        >
          Aceptar y crear mi cuenta
        </Button>
      </div>

      <p v-else-if="!consentRequired" class="login-form__consent">
        Al continuar, autorizas el tratamiento de tu nombre, correo e imagen según nuestra
        <NuxtLink to="/privacy" class="login-form__consent-link" target="_blank">
          Política de Privacidad
        </NuxtLink>
        .
      </p>

      <div class="login-form__divider">
        <div class="login-form__divider-line-wrapper">
          <div class="login-form__divider-line"></div>
        </div>
        <div class="login-form__divider-label-wrapper">
          <Text size="sm" color="muted" class="login-form__divider-label">
            O continua con tu correo
          </Text>
        </div>
      </div>

      <form class="login-form__form" @submit.prevent="handleSubmit">
        <Input
          id="email"
          v-model="email"
          name="email"
          label="Correo electronico"
          required
          placeholder="nombre@empresa.com"
          error-message="Correo invalido"
        />

        <PasswordInput
          id="password"
          v-model="password"
          name="password"
          placeholder="Ingresa tu contrasena"
          required
          label="Contraseña"
          error-message="La contrasena debe tener al menos 6 caracteres"
        />

        <Button
          type="submit"
          class="login-form__full-width"
          variant="primary"
          size="sm"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Iniciar Sesion
        </Button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .login-form {
    @apply max-w-lg p-4;
  }

  .login-form__content {
    @apply flex w-full flex-col gap-6;
  }

  .login-form__error {
    @apply rounded-lg border border-red-200 bg-red-50 p-4 transition-colors duration-200;
    @apply dark:border-red-800 dark:bg-red-900/20;
  }

  .login-form__error-body {
    @apply flex items-center;
  }

  .login-form__error-text {
    @apply text-red-800 dark:text-red-200;
  }

  .login-form__google-button {
    @apply flex w-full items-center justify-center transition-colors duration-200 hover:bg-neutral-100;
    @apply dark:hover:bg-neutral-700/50;
  }

  .login-form__google-icon {
    @apply mr-2;
  }

  .login-form__full-width {
    @apply w-full;
  }

  .login-form__divider {
    @apply relative;
  }

  .login-form__divider-line-wrapper {
    @apply absolute inset-0 flex items-center;
  }

  .login-form__divider-line {
    @apply w-full border-t border-neutral-200 transition-colors duration-200;
    @apply dark:border-neutral-600;
  }

  .login-form__divider-label-wrapper {
    @apply relative flex justify-center;
  }

  .login-form__divider-label {
    @apply bg-white px-4 transition-colors duration-200;
    @apply dark:bg-neutral-800;
  }

  .login-form__form {
    @apply w-full space-y-2;
  }

  .login-form__new-account {
    @apply flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4;
    @apply dark:border-primary-800 dark:bg-primary-900/20;
  }

  .login-form__consent {
    @apply text-center text-xs leading-relaxed text-neutral-500;
    @apply dark:text-neutral-400;
  }

  .login-form__consent-link {
    @apply text-primary-600 underline underline-offset-2;
    @apply hover:text-primary-700;
    @apply dark:text-primary-400;
  }
</style>
