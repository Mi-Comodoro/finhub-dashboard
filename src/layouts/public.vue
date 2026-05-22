<script setup lang="ts">
  import { useTheme } from '~/composables/useTheme'

  const { initTheme } = useTheme()

  onMounted(() => {
    initTheme()
  })
</script>

<template>
  <div class="public-layout">
    <header class="public-layout__header">
      <div class="public-layout__header-inner">
        <NuxtLink to="/" class="public-layout__logo">Mi Comodoro</NuxtLink>
        <NuxtLink to="/" class="public-layout__login-link">Iniciar sesión</NuxtLink>
      </div>
    </header>

    <main class="public-layout__main">
      <div class="public-layout__content">
        <slot />
      </div>
    </main>

    <footer class="public-layout__footer">
      <p class="public-layout__footer-text">
        © {{ new Date().getFullYear() }} Mi Comodoro. Todos los derechos reservados.
      </p>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
  .public-layout {
    @apply flex min-h-screen flex-col bg-neutral-50 font-sans;
    @apply dark:bg-neutral-900;
  }

  .public-layout__header {
    @apply border-b border-neutral-200 bg-white;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .public-layout__header-inner {
    @apply mx-auto flex max-w-3xl items-center justify-between px-4 py-4;
  }

  .public-layout__logo {
    @apply text-xl font-extrabold text-primary-700;
    @apply dark:text-primary-400;
  }

  .public-layout__login-link {
    @apply text-sm font-medium text-primary-600 underline underline-offset-2;
    @apply hover:text-primary-700;
    @apply dark:text-primary-400 dark:hover:text-primary-300;
  }

  .public-layout__main {
    @apply flex-1 py-10;
  }

  .public-layout__content {
    @apply mx-auto max-w-3xl px-4;
  }

  .public-layout__footer {
    @apply border-t border-neutral-200 bg-white py-6;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .public-layout__footer-text {
    @apply text-center text-xs text-neutral-500;
    @apply dark:text-neutral-400;
  }
</style>
