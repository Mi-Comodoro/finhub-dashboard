<script setup lang="ts"></script>
<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 p-4 font-sans"
  >
    <div
      class="flex min-h-[700px] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
    >
      <!-- Panel Izquierdo -->
      <div class="relative flex-1 overflow-hidden">
        <!-- Fondo con overlay -->
        <div
          class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          :style="{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80)'
          }"
        ></div>
        <div
          class="absolute inset-0 z-0 bg-gradient-to-br from-green-900/70 via-indigo-800/60 to-indigo-700/50"
        ></div>

        <!-- Contenido -->
        <div class="relative z-10 flex h-full w-full flex-col p-8 lg:p-12">
          <!-- Logo -->
          <div class="mb-6 w-full lg:mb-8">
            <h1 class="text-2xl font-extrabold text-white drop-shadow-lg lg:text-3xl">FinHub</h1>
          </div>

          <!-- Contenido principal -->
          <div class="mt-auto">
            <h2 class="mb-4 text-3xl font-extrabold text-white drop-shadow-md lg:text-4xl">
              Controla tu dinero
            </h2>
            <p class="mb-8 text-base text-white/90 drop-shadow-sm lg:text-lg">
              Claridad financiera al alcance de tu mano. Haz un seguimiento, presupuesta y ahorra de
              manera más inteligente con información en tiempo real y objetivos basados en datos.
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white"
                >
                  ✓
                </div>
                <span class="text-white/90">Seguimiento de gastos en tiempo real</span>
              </li>
              <li class="flex items-center gap-3">
                <div
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white"
                >
                  ✓
                </div>
                <span class="text-white/90">Alertas de presupuesto inteligente</span>
              </li>
              <li class="flex items-center gap-3">
                <div
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white"
                >
                  ✓
                </div>
                <span class="text-white/90">Proyecta tu ahorro</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Panel Derecho -->
      <div class="flex flex-1 flex-col justify-between p-8 lg:p-12">
        <LoginForm />
        <!-- Footer -->
        <div class="mt-12 border-t border-gray-200 pt-8 text-center">
          <p class="text-sm text-gray-500">
            Desarrollado por
            <span class="ml-2 inline-block">
              <img src="@/assets/svg/V2MIGUELALVAREZ.svg" alt="Miguel Alvarez" class="h-6 w-auto" />
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
