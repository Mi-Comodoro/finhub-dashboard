<script lang="ts" setup>
  import { computed, reactive, watch } from 'vue'

  import type { StackedProgressBarProps } from './types/stacked.types'

  const props = defineProps<StackedProgressBarProps>()
  const emit = defineEmits(['update:allocation'] as const)

  // Local reactive allocation for advanced cards
  const localAllocation = reactive({ ...props.allocation })

  // Clamped wants: cannot exceed 100 - needs
  const clampedWants = computed(() => {
    const max = 100 - localAllocation.needs
    return Math.min(localAllocation.wants, max)
  })

  // Derived savings: always calculated to make total = 100
  const derivedSavings = computed(() => 100 - localAllocation.needs - clampedWants.value)

  // Effective allocation (what's actually displayed/emitted)
  const effectiveAllocation = computed(() => ({
    needs: localAllocation.needs,
    wants: clampedWants.value,
    savings: derivedSavings.value
  }))

  // Emit when effectiveAllocation changes
  watch(
    effectiveAllocation,
    val => {
      if (props.advanced) emit('update:allocation', val)
    },
    { deep: true }
  )

  // Watch for props changes
  watch(
    () => props.allocation,
    newAllocation => {
      Object.assign(localAllocation, newAllocation)
    },
    { deep: true }
  )

  // Format as money
  function toMoney(pct: number): string {
    if (!props.totalIncome) return `${pct}%`
    const amount = (props.totalIncome * pct) / 100
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount)
  }
</script>

<template>
  <div class="budget-strategy-card__allocation">
    <!-- BARRA — siempre visible, reactiva en CUSTOM -->
    <div class="allocation-bar">
      <div
        class="allocation-bar__segment allocation-bar__segment--needs"
        :style="{ width: `${effectiveAllocation.needs}%` }"
      >
        <span v-if="effectiveAllocation.needs >= 10" class="allocation-bar__label">
          {{ effectiveAllocation.needs }}%
        </span>
      </div>
      <div
        class="allocation-bar__segment allocation-bar__segment--wants"
        :style="{ width: `${effectiveAllocation.wants}%` }"
      >
        <span v-if="effectiveAllocation.wants >= 10" class="allocation-bar__label">
          {{ effectiveAllocation.wants }}%
        </span>
      </div>
      <div
        class="allocation-bar__segment allocation-bar__segment--savings"
        :style="{ width: `${effectiveAllocation.savings}%` }"
      >
        <span v-if="effectiveAllocation.savings >= 10" class="allocation-bar__label">
          {{ effectiveAllocation.savings }}%
        </span>
      </div>
    </div>

    <!-- MONTOS debajo de la barra (si hay totalIncome) -->
    <div v-if="totalIncome" class="allocation-amounts">
      <span class="allocation-amounts__item allocation-amounts__item--needs">
        {{ toMoney(effectiveAllocation.needs) }}
      </span>
      <span class="allocation-amounts__item allocation-amounts__item--wants">
        {{ toMoney(effectiveAllocation.wants) }}
      </span>
      <span class="allocation-amounts__item allocation-amounts__item--savings">
        {{ toMoney(effectiveAllocation.savings) }}
      </span>
    </div>

    <!-- SLIDERS — solo en CUSTOM seleccionado -->
    <div v-if="advanced && selected" class="allocation-sliders">
      <!-- Necesidades -->
      <div class="allocation-slider">
        <div class="allocation-slider__header">
          <span class="allocation-slider__dot allocation-slider__dot--needs" />
          <span class="allocation-slider__label">Necesidades</span>
          <span class="allocation-slider__value">
            {{ effectiveAllocation.needs }}%
            <span v-if="totalIncome" class="allocation-slider__money">
              · {{ toMoney(effectiveAllocation.needs) }}
            </span>
          </span>
        </div>
        <input
          v-model.number="localAllocation.needs"
          type="range"
          min="0"
          :max="100 - clampedWants"
          step="1"
          class="allocation-slider__range allocation-slider__range--needs"
        />
      </div>

      <!-- Deseos -->
      <div class="allocation-slider">
        <div class="allocation-slider__header">
          <span class="allocation-slider__dot allocation-slider__dot--wants" />
          <span class="allocation-slider__label">Deseos</span>
          <span class="allocation-slider__value">
            {{ clampedWants }}%
            <span v-if="totalIncome" class="allocation-slider__money">
              · {{ toMoney(clampedWants) }}
            </span>
          </span>
        </div>
        <input
          v-model.number="localAllocation.wants"
          type="range"
          min="0"
          :max="100 - localAllocation.needs"
          step="1"
          class="allocation-slider__range allocation-slider__range--wants"
        />
      </div>

      <!-- Ahorros — solo lectura, calculado -->
      <div class="allocation-slider allocation-slider--readonly">
        <div class="allocation-slider__header">
          <span class="allocation-slider__dot allocation-slider__dot--savings" />
          <span class="allocation-slider__label">Ahorros</span>
          <span class="allocation-slider__value allocation-slider__value--derived">
            {{ derivedSavings }}%
            <span v-if="totalIncome" class="allocation-slider__money">
              · {{ toMoney(derivedSavings) }}
            </span>
          </span>
        </div>
        <!-- Barra de progreso visual, no interactiva -->
        <div class="allocation-slider__readonly-bar">
          <div
            class="allocation-slider__readonly-fill allocation-slider__readonly-fill--savings"
            :style="{ width: `${derivedSavings}%` }"
          />
        </div>
        <span class="allocation-slider__hint">Calculado automáticamente</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  /* Barra de asignación */
  .allocation-bar {
    @apply mt-1 flex h-8 w-full overflow-hidden rounded-lg;
  }
  .allocation-bar__segment {
    @apply flex items-center justify-center text-xs font-semibold text-white transition-all duration-200;
  }
  .allocation-bar__segment--needs {
    @apply bg-primary-500;
  }
  .allocation-bar__segment--wants {
    @apply bg-success-500;
  }
  .allocation-bar__segment--savings {
    @apply bg-secondary-700;
  }
  .allocation-bar__label {
    @apply font-bold;
  }

  /* Montos debajo de la barra */
  .allocation-amounts {
    @apply mt-1 flex justify-between px-1;
  }
  .allocation-amounts__item {
    @apply text-xs font-semibold;
  }
  .allocation-amounts__item--needs {
    @apply text-primary-600;
  }
  .allocation-amounts__item--wants {
    @apply text-success-600;
  }
  .allocation-amounts__item--savings {
    @apply text-secondary-700;
  }

  /* Sliders */
  .allocation-sliders {
    @apply mt-4 space-y-4;
  }
  .allocation-slider {
    @apply space-y-1;
  }
  .allocation-slider--readonly {
    @apply opacity-75;
  }
  .allocation-slider__header {
    @apply flex items-center gap-2;
  }
  .allocation-slider__dot {
    @apply h-3 w-3 shrink-0 rounded-full;
  }
  .allocation-slider__dot--needs {
    @apply bg-primary-500;
  }
  .allocation-slider__dot--wants {
    @apply bg-success-500;
  }
  .allocation-slider__dot--savings {
    @apply bg-secondary-700;
  }
  .allocation-slider__label {
    @apply flex-1 text-sm font-medium text-neutral-700;
  }
  .allocation-slider__value {
    @apply text-sm font-semibold text-neutral-900;
  }
  .allocation-slider__value--derived {
    @apply text-secondary-700;
  }
  .allocation-slider__money {
    @apply text-xs font-normal text-neutral-500;
  }
  .allocation-slider__range {
    @apply h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200;
  }
  .allocation-slider__range--needs {
    accent-color: theme('colors.primary.500');
  }
  .allocation-slider__range--wants {
    accent-color: theme('colors.success.500');
  }
  .allocation-slider__hint {
    @apply text-xs italic text-neutral-400;
  }
  .allocation-slider__readonly-bar {
    @apply h-2 w-full overflow-hidden rounded-lg bg-neutral-200;
  }
  .allocation-slider__readonly-fill--savings {
    @apply h-full bg-secondary-700 transition-all duration-200;
  }
</style>
