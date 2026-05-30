<script setup lang="ts">
  import { ref } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import GoogleIcon from '@/components/atoms/icons/GoogleIcon.vue'
  import Link from '@/components/atoms/typography/Link.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import PasswordInput from '@/components/molecules/input/PasswordInput.vue'
  import { useAuth } from '@/composables/useAuth'

  import type { LoginFormState } from './types/login-form.types'

  const email = ref<LoginFormState['email']>('')
  const password = ref<LoginFormState['password']>('')

  const { login, loginWithGoogle, error: authError } = useAuth()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const handleGoogleLogin = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const { success } = await loginWithGoogle()

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
  <div class="max-w-lg p-4">
    <div class="flex w-full flex-col gap-6">
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

      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 p-4 transition-colors duration-200 dark:border-red-800 dark:bg-red-900/20"
      >
        <div class="flex items-center">
          <Text size="sm" weight="medium" class="text-red-800 dark:text-red-200">
            {{ error }}
          </Text>
        </div>
      </div>

      <Button
        variant="outline"
        class="flex w-full items-center justify-center transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
        size="sm"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <GoogleIcon class="mr-2" :size="18" />
        <span>
          {{ isLoading ? 'Conectando...' : 'Iniciar sesion con Google' }}
        </span>
      </Button>

      <p class="login-form__consent">
        Al continuar, autorizas el tratamiento de tu nombre, correo e imagen según nuestra
        <NuxtLink to="/privacy" class="login-form__consent-link" target="_blank">
          Política de Privacidad
        </NuxtLink>
        .
      </p>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div
            class="w-full border-t border-neutral-200 transition-colors duration-200 dark:border-neutral-600"
          ></div>
        </div>
        <div class="relative flex justify-center">
          <Text
            size="sm"
            color="muted"
            class="bg-white px-4 transition-colors duration-200 dark:bg-neutral-800"
          >
            O continua con tu correo
          </Text>
        </div>
      </div>

      <form class="w-full space-y-2" @submit.prevent="handleSubmit">
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
          class="w-full"
          variant="primary"
          size="sm"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Iniciar Sesion
        </Button>
      </form>

      <Text size="sm" color="muted" class="text-center">
        No tienes una cuenta?
        <Link
          href="#"
          size="sm"
          class="font-semibold text-teal-600 transition-colors duration-200 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Registrate
        </Link>
      </Text>
    </div>
  </div>
</template>

<style scoped lang="postcss">
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
