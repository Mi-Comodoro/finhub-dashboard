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
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-teal-50 p-4 font-sans transition-colors duration-200 dark:from-neutral-900 dark:to-neutral-800"
  >
    <div
      class="flex min-h-[700px] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-colors duration-200 dark:bg-neutral-800 dark:shadow-neutral-900/50"
    >
      <!-- Panel Izquierdo -->
      <div class="relative flex-1 overflow-hidden">
        <!-- Fondo con overlay -->
        <div
          class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          :style="{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(/img/screen_bg.avif)'
          }"
        ></div>
        <div
          class="absolute inset-0 z-0 bg-gradient-to-br from-primary-900/70 via-primary-800/60 to-primary-900/50"
        ></div>

        <!-- Contenido -->
        <div class="relative z-10 flex h-full w-full flex-col p-8 lg:p-12">
          <!-- Logo -->
          <div class="mb-6 w-full lg:mb-8">
            <Heading level="h1" size="3xl" weight="extrabold" class="drop-shadow-lg" color="white">
              FinHub
            </Heading>
          </div>

          <!-- Contenido principal -->
          <div class="mt-auto flex flex-col justify-between gap-6">
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
            />

            <div class="flex flex-col gap-2">
              <ul v-for="(item, index) in items" :key="index">
                <li class="flex items-center gap-2">
                  <span
                    class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white"
                  >
                    ✓
                  </span>
                  <Text class="text-white/90" size="sm">{{ item.item }}</Text>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Derecho -->
      <div
        class="flex flex-1 flex-col justify-between bg-white p-8 transition-colors duration-200 dark:bg-neutral-800 lg:p-12"
      >
        <LoginForm />
        <!-- Footer -->
        <div
          class="mt-12 border-t border-neutral-200 pt-6 text-center transition-colors duration-200 dark:border-neutral-600"
        >
          <p
            class="flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400"
          >
            Desarrollado por
            <span class="ml-2 inline-block">
              <img
                src="@/assets/svg/V2MIGUELALVAREZ.svg"
                alt="Miguel Alvarez"
                class="h-6 w-auto opacity-80 dark:opacity-60"
              />
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
