<script setup lang="ts">
  defineProps({
    modelValue: { type: Number, default: 0 },
    label: { type: String, default: 'Porcentaje de distribución' }
  })

  const emit = defineEmits(['update:modelValue'])

  // Función que captura el cambio y lo "lanza" al padre

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement

    emit('update:modelValue', Number(target.value))
  }
  // Estado reactivo para el valor del slider
</script>

<template>
  <div class="mx-auto w-full">
    <!-- Cabecera con Título y Valor -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
        {{ label }}
      </h2>
      <span class="text-2xl font-bold text-emerald-900 dark:text-emerald-400">
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
        class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-emerald-700 dark:bg-neutral-700"
        @input="onChange"
      />

      <!-- Etiquetas de rango inferior (0, 50, 100) -->
      <div
        class="mt-4 flex justify-between px-1 text-[10px] font-medium text-gray-400 dark:text-neutral-500"
      >
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Personalización adicional para navegadores que no soportan bien accent-color */
  input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #065f46; /* emerald-800 */
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
</style>
