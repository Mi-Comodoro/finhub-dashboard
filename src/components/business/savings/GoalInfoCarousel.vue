<script setup lang="ts">
  const TIPS = [
    'El interés se calcula día a día con interés compuesto.',
    'Tu capital crece un poco cada día que permanece depositado.',
    'En vistas de 3 meses o más, los aportes futuros son estimados basados en tu último aporte registrado.',
    'Las proyecciones son estimadas y pueden variar según las actualizaciones de tasa de interés por parte de las entidades financieras.'
  ]

  const current = ref(0)

  const goTo = (index: number) => {
    current.value = index
  }

  let timer: ReturnType<typeof setInterval>

  const startTimer = () => {
    timer = setInterval(() => {
      current.value = (current.value + 1) % TIPS.length
    }, 5000)
  }

  const resetTimer = (index: number) => {
    clearInterval(timer)
    goTo(index)
    startTimer()
  }

  onMounted(startTimer)
  onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="goal-info-carousel">
    <div class="goal-info-carousel__header">
      <span class="material-symbols-outlined goal-info-carousel__icon">lightbulb</span>
      <span class="goal-info-carousel__title">Datos de Interés</span>
    </div>

    <div class="goal-info-carousel__body">
      <Transition name="carousel-fade" mode="out-in">
        <p :key="current" class="goal-info-carousel__text">
          {{ TIPS[current] }}
        </p>
      </Transition>
    </div>

    <div class="goal-info-carousel__dots">
      <button
        v-for="(_, i) in TIPS"
        :key="i"
        :class="['goal-info-carousel__dot', { 'goal-info-carousel__dot--active': i === current }]"
        @click="resetTimer(i)"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .goal-info-carousel {
    @apply flex flex-col gap-3 rounded-xl border border-secondary-200 bg-secondary-50 px-5 py-4;
    @apply dark:border-secondary-800 dark:bg-secondary-950;
  }

  .goal-info-carousel__header {
    @apply flex items-center gap-2;
  }

  .goal-info-carousel__icon {
    @apply text-base text-secondary-500;
  }

  .goal-info-carousel__title {
    @apply text-sm font-semibold text-secondary-700 dark:text-secondary-300;
  }

  .goal-info-carousel__body {
    @apply min-h-[2.5rem];
  }

  .goal-info-carousel__text {
    @apply text-sm leading-relaxed text-secondary-700 dark:text-secondary-300;
  }

  .goal-info-carousel__dots {
    @apply flex items-center gap-1.5;
  }

  .goal-info-carousel__dot {
    @apply h-1.5 w-1.5 rounded-full bg-secondary-300 transition-all duration-300 dark:bg-secondary-700;
  }

  .goal-info-carousel__dot--active {
    @apply w-4 bg-secondary-500;
  }
</style>

<style>
  .carousel-fade-enter-active,
  .carousel-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .carousel-fade-enter-from,
  .carousel-fade-leave-to {
    opacity: 0;
  }
</style>
