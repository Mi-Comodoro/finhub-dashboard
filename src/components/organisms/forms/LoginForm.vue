<script setup lang="ts">
  import { log } from 'console'
  import { ref } from 'vue'

  import { Button, GoogleIcon } from '~/components/atoms'
  import { Input } from '~/components/molecules'

  const email = ref('')
  const password = ref('')

  const handleSubmit = () => {
    log('Intento de inicio de sesión:', {
      email: email.value,
      password: password.value
    })

    email.value = ''
    password.value = ''
  }
</script>
<template>
  <div class="max-w-lg p-4">
    <div class="flex w-full flex-col gap-6">
      <div>
        <h2 class="mt-8 text-3xl font-black text-gray-900 lg:mt-5">Bienvenido</h2>
        <p class="mb-8 text-gray-600">Inicia sesión en tu panel de FinHub</p>
      </div>

      <Button variant="outline" class="w-ful bg-white hover:bg-gray-200">
        <GoogleIcon class="mr-2" :size="20" />
        <span>Iniciar sesión con Google</span>
      </Button>

      <!-- Divider -->
      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-4 text-gray-500">O continúa con tu correo</span>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="w-full space-y-6">
        <div>
          <Input
            id="email"
            v-model="email"
            name="email"
            label="Correo electrónico"
            required
            place-holder="nombre@empresa.com"
            error-message="Correo inválido"
          />
        </div>

        <div>
          <Input
            id="password"
            name="password"
            v-model="password"
            type="password"
            place-holder="Ingresa tu contraseñaa"
            required
            label="Contraseña"
            error-message="La contraseña debe tener al menos 6 caracteres"
            show-password-toggle
            forgot-password
            forgot-password-text="¿Olvidaste tu contraseña?"
          />
        </div>

        <Button type="submit" class="w-full" variant="primary">Iniciar Sesión</Button>
      </form>

      <div class="text-center text-gray-600">
        ¿No tienes una cuenta?
        <a href="#" class="font-semibold text-primary-600 hover:underline">Regístrate</a>
      </div>
    </div>
  </div>
</template>
