<script setup lang="ts">
  // Define page metadata - use login layout
  definePageMeta({
    layout: 'login'
  })
  const items = [
    { item: 'Seguimiento de gastos en tiempo real' },
    { item: 'Alertas de presupuesto inteligente' },
    { item: 'Proyecta tu ahorro' }
  ]
</script>

<template>
  <div class="login-page">
    <div class="login-page__card">
      <!-- Panel Izquierdo -->
      <div class="login-page__left">
        <!-- Fondo con overlay -->
        <div
          class="login-page__bg-image"
          :style="{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(/img/screen_bg.avif)'
          }"
        ></div>
        <div class="login-page__bg-overlay"></div>

        <!-- Contenido -->
        <div class="login-page__content">
          <!-- Logo -->
          <div class="login-page__logo">
            <Heading level="h1" size="3xl" weight="extrabold" class="drop-shadow-lg" color="white">
              Mi Comodoro
            </Heading>
          </div>

          <!-- Contenido principal -->
          <div class="login-page__main">
            <CardInfo
              title="Controla tu dinero"
              level="h2"
              title-size="3xl"
              weight="extrabold"
              color="white"
              :sub-title="`Claridad financiera al alcance de tu mano. Haz un seguimiento, presupuesta y ahorra de
              manera más inteligente con información en tiempo real y objetivos basados en datos.`"
              sub-title-color="white"
              sub-title-size="sm"
              sub-title-weight="light"
              class="max-w-lg"
            />

            <div class="login-page__features">
              <ul v-for="(item, index) in items" :key="index">
                <li class="login-page__feature-item">
                  <span class="login-page__check">✓</span>
                  <Text class="text-white/90" size="sm">{{ item.item }}</Text>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Derecho -->
      <div class="login-page__right">
        <LoginForm />
        <!-- Footer -->
        <div class="login-page__footer">
          <p class="login-page__footer-text">
            Desarrollado por
            <span class="ml-2 inline-block">
              <img
                src="@/assets/svg/V2MIGUELALVAREZ.svg"
                alt="Miguel Alvarez"
                class="login-page__footer-logo"
              />
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .login-page {
    @apply flex h-screen items-center justify-center overflow-hidden;
    @apply bg-gradient-to-br from-neutral-50 to-teal-50;
    @apply font-sans transition-colors duration-200 2xl:p-4;
    @apply dark:from-neutral-900 dark:to-neutral-800;
  }

  .login-page__card {
    @apply flex w-full overflow-hidden bg-white xl:rounded-none 2xl:max-w-6xl 2xl:rounded-2xl 2xl:shadow-lg;
    @apply transition-colors duration-200;

    /* Altura responsive */
    @apply min-h-[620px] lg:min-h-[650px] xl:min-h-screen 2xl:min-h-[750px];

    @apply dark:bg-neutral-800 dark:shadow-neutral-900/50;
  }

  /* =========================
     PANEL IZQUIERDO
     ========================= */

  .login-page__left {
    /* Oculto en tablets pequeñas */
    @apply relative hidden overflow-hidden lg:flex;

    /* Un poco más ancho que el form */
    @apply lg:flex-[1.1];
  }

  .login-page__bg-image {
    @apply absolute inset-0 z-0 bg-cover bg-center bg-no-repeat;
    transform: scale(1.02);
  }

  .login-page__bg-overlay {
    @apply absolute inset-0 z-0 bg-gradient-to-br;

    /* Overlay más elegante */
    @apply from-primary-900/60 via-primary-800/50 to-primary-900/40;
  }

  .login-page__content {
    @apply relative z-10 flex h-full w-full flex-col;

    /* Padding responsive */
    @apply p-6 md:p-8 xl:p-12;
  }

  .login-page__logo {
    @apply mb-4 w-full xl:mb-8;
  }

  .login-page__main {
    @apply mt-auto flex flex-col justify-between;

    /* Menos separación vertical */
    @apply gap-4 xl:gap-6;
  }

  .login-page__features {
    @apply flex flex-col gap-2;
  }

  .login-page__feature-item {
    @apply flex items-center gap-2;
  }

  .login-page__check {
    @apply flex h-6 w-6 flex-shrink-0 items-center justify-center;
    @apply rounded-full bg-white/20 text-sm font-bold text-white;
  }

  /* =========================
     PANEL DERECHO
     ========================= */

  .login-page__right {
    @apply flex w-full flex-1 flex-col justify-between;
    @apply bg-white transition-colors duration-200;

    /* Evita que el formulario se estire demasiado */
    @apply lg:max-w-[540px];

    /* Padding responsive */
    @apply p-6 md:p-8 xl:p-12;

    @apply dark:bg-neutral-800;
  }

  .login-page__footer {
    @apply mt-6 border-t border-neutral-200;
    @apply pt-4 text-center transition-colors duration-200;

    @apply xl:mt-12 xl:pt-6;

    @apply dark:border-neutral-600;
  }

  .login-page__footer-text {
    @apply flex items-center justify-center;
    @apply text-sm text-neutral-500;

    @apply dark:text-neutral-400;
  }

  .login-page__footer-logo {
    @apply h-6 w-auto opacity-80;
    @apply dark:opacity-60;
  }

  /* =========================
     AJUSTES PARA LAPTOPS
     ========================= */

  @media (max-height: 820px) {
    .login-page__content {
      @apply p-6;
    }

    .login-page__left {
      @apply relative hidden overflow-hidden lg:flex;
      @apply lg:flex-1 lg:p-4;
      @apply 2xl:flex-[1.1];
    }

    .login-page__right {
      @apply flex w-full flex-1 flex-col justify-between;
      @apply bg-white transition-colors duration-200;

      /* Laptop */
      @apply lg:max-w-[620px];

      /* Pantallas grandes */
      @apply 2xl:max-w-[540px];

      @apply p-6 md:p-8 xl:p-12;

      @apply dark:bg-neutral-800;
    }
    .login-page__logo {
      @apply mb-4;
    }

    .login-page__main {
      @apply gap-4;
    }

    .login-page__footer {
      @apply mt-4 pt-4;
    }
  }
</style>
