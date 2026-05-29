<script setup lang="ts">
  import { useTheme } from '@/composables/useTheme'

  defineProps({
    modelValue: { type: Number, default: 0 },
    label: { type: String, default: 'Porcentaje de distribución' }
  })

  const emit = defineEmits(['update:modelValue'])

  const { isDark } = useTheme()
  const thumbColor = computed(() => (isDark.value ? '#2dd4bf' : '#0f766e'))

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', Number(target.value))
  }
</script>

<template>
  <div class="mx-auto w-full">
    <!-- Cabecera con Título y Valor -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {{ label }}
      </h2>
      <span class="text-2xl font-bold text-primary-900 dark:text-primary-300">
        {{ modelValue }}%
      </span>
    </div>

    <!-- Contenedor del Slider -->
    <div class="group relative w-full">
      <input
        :value="modelValue"
        type="range"
        min="0"
        max="100"
        step="1"
        class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary-600 dark:bg-neutral-600"
        @input="onChange"
      />

      <!-- Etiquetas de rango inferior (0, 50, 100) -->
      <div
        class="mt-4 flex justify-between px-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500"
      >
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Fallback thumb for browsers that don't support accent-color */
  input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: v-bind(thumbColor);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
</style>
