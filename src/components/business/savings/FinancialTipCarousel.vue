<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'

  import Tips from '@/components/business/tips/Tips.vue'

  interface FinancialTip {
    id: string
    icon: string
    message: string
    subMessage?: string
  }

  interface Props {
    tips?: FinancialTip[]
  }

  const props = withDefaults(defineProps<Props>(), {
    tips: () => []
  })

  const currentIndex = ref(0)
  const isPaused = ref(false) // Control de pausa
  let intervalId: ReturnType<typeof setInterval> | null = null

  const currentTip = computed(() => props.tips[currentIndex.value])

  const next = () => {
    if (props.tips.length <= 1) return
    currentIndex.value = (currentIndex.value + 1) % props.tips.length
  }

  const startTimer = () => {
    stopTimer()
    // Mantenemos tus 9 segundos originales
    intervalId = setInterval(() => {
      if (!isPaused.value) {
        next()
      }
    }, 9000)
  }

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId)
  }

  onMounted(() => startTimer())
  onUnmounted(() => stopTimer())
</script>

<template>
  <div class="financial-tip-carousel" @mouseenter="isPaused = true" @mouseleave="isPaused = false">
    <Transition name="tip-fade" mode="out-in">
      <Tips
        :key="currentIndex"
        :icon="currentTip?.icon!"
        :title="currentTip?.message!"
        :description="currentTip?.subMessage!"
      />
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
  .financial-tip-carousel {
    @apply flex items-start gap-3 overflow-hidden rounded-lg dark:bg-secondary-900/20;
  }

  /* Transición suave: Desvanecimiento con un ligero movimiento hacia arriba */
  .tip-fade-enter-active,
  .tip-fade-leave-active {
    transition: all 0.5s ease;
  }

  .tip-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .tip-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
</style>
