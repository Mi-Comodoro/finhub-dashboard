<script setup lang="ts">
  import { ref } from 'vue'

  import { Button, GoogleIcon, Heading, Link, Text } from '@/components/atoms'
  import { Input } from '@/components/molecules'
  import { useAuth } from '~/composables/useAuth'

  const email = ref<string>('')
  const password = ref<string>('')

  // Composables - volviendo a useAuth que funcionaba
  const { login, loginWithGoogle, user, error: authError } = useAuth()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const handleGoogleLogin = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    const { success, onboardingStatus } = await loginWithGoogle()

    if (!success) {
      error.value = authError.value || 'Error desconocido durante la autenticación'
    } else {
      // Navigate based on onboarding status
      isLoading.value = false
      const onboardingCompleted = onboardingStatus === 'COMPLETED'
      const destination = onboardingCompleted ? '/dashboard' : '/onboarding'
      await navigateTo(destination)
    }
  }
  const handleEmailLogin = async (): Promise<void> => {
    if (!email.value || !password.value) {
      error.value = 'Por favor completa todos los campos'
      return
    }

    isLoading.value = true
    error.value = null

    const { success, onboardingStatus } = await login(email.value, password.value)

    if (!success) {
      error.value = authError.value || 'Error desconocido durante la autenticación'
    } else {
      // Navigate based on onboarding status
      const onboardingCompleted = onboardingStatus === 'COMPLETED'
      const destination = onboardingCompleted ? '/dashboard' : '/onboarding'
      await navigateTo(destination)

      // Clear form on successful login
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
        <Heading level="h2" size="3xl" weight="extrabold" color="primary" class="mt-8 lg:mt-5">
          Bienvenido
        </Heading>
        <Text size="base" color="secondary" class="mb-8">Inicia sesión en tu panel de FinHub</Text>
      </div>

      <!-- Error Display -->
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

      <!-- Google Login -->
      <Button
        variant="outline"
        class="w-full transition-colors duration-200"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <GoogleIcon class="mr-2" :size="20" />
        <span>
          {{ isLoading ? 'Conectando...' : 'Iniciar sesión con Google' }}
        </span>
      </Button>

      <!-- Divider -->
      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div
            class="w-full border-t border-gray-200 transition-colors duration-200 dark:border-gray-600"
          ></div>
        </div>
        <div class="relative flex justify-center">
          <Text
            size="sm"
            color="muted"
            class="bg-white px-4 transition-colors duration-200 dark:bg-gray-800"
          >
            O continúa con tu correo
          </Text>
        </div>
      </div>

      <!-- Email / Password (mock por ahora) -->
      <form class="w-full space-y-6" @submit.prevent="handleSubmit">
        <Input
          id="email"
          v-model="email"
          name="email"
          label="Correo electrónico"
          required
          placeholder="nombre@empresa.com"
          error-message="Correo inválido"
        />

        <Input
          id="password"
          v-model="password"
          name="password"
          type="password"
          placeholder="Ingresa tu contraseñaa"
          required
          label="Contraseña"
          error-message="La contraseña debe tener al menos 6 caracteres"
          show-password-toggle
          forgot-password
          forgot-password-text="¿Olvidaste tu contraseña?"
        />

        <Button
          type="submit"
          class="w-full"
          variant="primary"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Iniciar Sesión
        </Button>
      </form>

      <!-- Info solo para debug -->
      <div v-if="user">
        <Text size="sm" color="secondary">
          Sesión Google activa como
          <Text as="strong" weight="semibold" color="accent">
            {{ user.email }}
          </Text>
        </Text>
      </div>

      <Text size="base" color="secondary" class="text-center">
        ¿No tienes una cuenta?
        <Link
          href="#"
          class="font-semibold text-teal-600 transition-colors duration-200 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Regístrate
        </Link>
      </Text>
    </div>
  </div>
</template>
