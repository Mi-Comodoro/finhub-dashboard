<!--
  Budget Strategy Form - Simplified Single Bar + Sliders
  Organism component for budget allocation during onboarding
-->

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import { Button, Icon } from '@/components/atoms'

  const props = defineProps<{
    totalIncome?: number
  }>()

  const emit = defineEmits(['update:modelValue', 'valid'])

  /* ---------------------------------------------
   * STATE
   * --------------------------------------------- */
  const isCustomizing = ref(false)
  const allocation = ref({
    needs: 50,
    wants: 30,
    savings: 20
  })

  /* ---------------------------------------------
   * COMPUTED
   * --------------------------------------------- */
  const total = computed(
    () => allocation.value.needs + allocation.value.wants + allocation.value.savings
  )

  const isValid = computed(() => total.value === 100)

  const totalStatus = computed(() => {
    if (total.value === 100) return 'valid'
    if (total.value > 100) return 'excess'
    return 'missing'
  })

  /* ---------------------------------------------
   * HELPERS
   * --------------------------------------------- */
  function toMoney(pct: number): string {
    if (!props.totalIncome) return ''
    const amount = (props.totalIncome * pct) / 100
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  /* ---------------------------------------------
   * ACTIONS
   * --------------------------------------------- */
  const toggleCustomize = () => {
    if (isCustomizing.value) {
      // Resetear a valores por defecto
      allocation.value = { needs: 50, wants: 30, savings: 20 }
    }
    isCustomizing.value = !isCustomizing.value
  }

  /* ---------------------------------------------
   * WATCHERS & LIFECYCLE
   * --------------------------------------------- */
  watch(
    [allocation, isCustomizing],
    () => {
      emit('valid', isValid.value)
      emit('update:modelValue', {
        strategy: isCustomizing.value ? 'CUSTOM' : 'BALANCED',
        usage: 'personal',
        customAllocations: { ...allocation.value }
      })
    },
    { deep: true }
  )

  onMounted(() => {
    emit('valid', isValid.value)
    emit('update:modelValue', {
      strategy: 'BALANCED',
      usage: 'personal',
      customAllocations: { ...allocation.value }
    })
  })
</script>

<template>
  <div class="strategy-step">
    <!-- BARRA DE ASIGNACIÓN -->
    <div class="strategy-step__bar-container">
      <div class="strategy-step__bar">
        <div
          class="strategy-step__segment strategy-step__segment--needs"
          :style="{ width: `${allocation.needs}%` }"
        >
          <span v-if="allocation.needs >= 10" class="strategy-step__segment-label">
            {{ allocation.needs }}%
          </span>
        </div>
        <div
          class="strategy-step__segment strategy-step__segment--wants"
          :style="{ width: `${allocation.wants}%` }"
        >
          <span v-if="allocation.wants >= 10" class="strategy-step__segment-label">
            {{ allocation.wants }}%
          </span>
        </div>
        <div
          class="strategy-step__segment strategy-step__segment--savings"
          :style="{ width: `${allocation.savings}%` }"
        >
          <span v-if="allocation.savings >= 10" class="strategy-step__segment-label">
            {{ allocation.savings }}%
          </span>
        </div>
      </div>

      <!-- Labels y montos alineados con cada segmento -->
      <div class="strategy-step__bar-info">
        <div class="strategy-step__bar-info-cell" :style="{ width: `${allocation.needs}%` }">
          <span class="strategy-step__info-label">Necesidades</span>
          <span class="strategy-step__info-value">
            {{ allocation.needs }}%
            <span v-if="totalIncome" class="strategy-step__info-money">
              · {{ toMoney(allocation.needs) }}
            </span>
          </span>
        </div>
        <div class="strategy-step__bar-info-cell" :style="{ width: `${allocation.wants}%` }">
          <span class="strategy-step__info-label">Deseos</span>
          <span class="strategy-step__info-value">
            {{ allocation.wants }}%
            <span v-if="totalIncome" class="strategy-step__info-money">
              · {{ toMoney(allocation.wants) }}
            </span>
          </span>
        </div>
        <div class="strategy-step__bar-info-cell" :style="{ width: `${allocation.savings}%` }">
          <span class="strategy-step__info-label">Ahorros</span>
          <span class="strategy-step__info-value">
            {{ allocation.savings }}%
            <span v-if="totalIncome" class="strategy-step__info-money">
              · {{ toMoney(allocation.savings) }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- BOTÓN PERSONALIZAR -->
    <div class="strategy-step__actions">
      <Button
        variant="ghost"
        size="sm"
        :icon="isCustomizing ? 'expand_less' : 'tune'"
        @click="toggleCustomize"
      >
        {{ isCustomizing ? 'Usar valores por defecto' : 'Personalizar' }}
      </Button>
    </div>

    <!-- SLIDERS (solo si está personalizando) -->
    <div v-if="isCustomizing" class="strategy-step__sliders">
      <!-- Necesidades -->
      <div class="strategy-step__slider-group">
        <div class="strategy-step__slider-header">
          <span class="strategy-step__slider-dot strategy-step__slider-dot--needs" />
          <span class="strategy-step__slider-name">Necesidades</span>
          <span class="strategy-step__slider-pct">{{ allocation.needs }}%</span>
        </div>
        <input
          v-model.number="allocation.needs"
          type="range"
          min="0"
          max="100"
          step="1"
          class="strategy-step__slider-range strategy-step__slider-range--needs"
        />
      </div>

      <!-- Deseos -->
      <div class="strategy-step__slider-group">
        <div class="strategy-step__slider-header">
          <span class="strategy-step__slider-dot strategy-step__slider-dot--wants" />
          <span class="strategy-step__slider-name">Deseos</span>
          <span class="strategy-step__slider-pct">{{ allocation.wants }}%</span>
        </div>
        <input
          v-model.number="allocation.wants"
          type="range"
          min="0"
          max="100"
          step="1"
          class="strategy-step__slider-range strategy-step__slider-range--wants"
        />
      </div>

      <!-- Ahorros -->
      <div class="strategy-step__slider-group">
        <div class="strategy-step__slider-header">
          <span class="strategy-step__slider-dot strategy-step__slider-dot--savings" />
          <span class="strategy-step__slider-name">Ahorros</span>
          <span class="strategy-step__slider-pct">{{ allocation.savings }}%</span>
        </div>
        <input
          v-model.number="allocation.savings"
          type="range"
          min="0"
          max="100"
          step="1"
          class="strategy-step__slider-range strategy-step__slider-range--savings"
        />
      </div>

      <!-- INDICADOR DE TOTAL -->
      <div :class="['strategy-step__total', `strategy-step__total--${totalStatus}`]">
        <Icon :name="total === 100 ? 'check_circle' : 'error'" />
        Total: {{ total }}%
        <span v-if="total !== 100" class="strategy-step__total-hint">
          {{ total > 100 ? `Excede ${total - 100}%` : `Faltan ${100 - total}%` }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .strategy-step {
    @apply mx-auto w-full max-w-2xl space-y-6 px-4 py-6;
  }

  /* Barra de asignación */
  .strategy-step__bar-container {
    @apply space-y-2;
  }

  .strategy-step__bar {
    @apply flex h-10 w-full overflow-hidden rounded-lg shadow-sm transition-all duration-300;
  }

  .strategy-step__segment {
    @apply flex items-center justify-center transition-all duration-300;
  }

  .strategy-step__segment--needs {
    @apply bg-primary-500 dark:bg-primary-600;
  }

  .strategy-step__segment--wants {
    @apply bg-success-500 dark:bg-success-600;
  }

  .strategy-step__segment--savings {
    @apply bg-secondary-700 dark:bg-secondary-800;
  }

  .strategy-step__segment-label {
    @apply text-sm font-bold text-white drop-shadow-sm;
  }

  /* Info grid alineada con segmentos */
  .strategy-step__bar-info {
    @apply mt-2 flex w-full;
  }

  .strategy-step__bar-info-cell {
    @apply flex flex-col transition-all duration-300;
  }

  .strategy-step__info-label {
    @apply text-xs text-neutral-500 dark:text-neutral-400;
  }

  .strategy-step__info-value {
    @apply text-xs font-semibold text-neutral-800 dark:text-neutral-200;
  }

  .strategy-step__info-money {
    @apply font-normal text-neutral-500 dark:text-neutral-400;
  }

  /* Botón actions */
  .strategy-step__actions {
    @apply mt-3 flex justify-end;
  }

  /* Sliders */
  .strategy-step__sliders {
    @apply space-y-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800;
  }

  .strategy-step__slider-group {
    @apply space-y-2;
  }

  .strategy-step__slider-header {
    @apply flex items-center gap-2;
  }

  .strategy-step__slider-dot {
    @apply h-3 w-3 shrink-0 rounded-full;
  }

  .strategy-step__slider-dot--needs {
    @apply bg-primary-500;
  }

  .strategy-step__slider-dot--wants {
    @apply bg-success-500;
  }

  .strategy-step__slider-dot--savings {
    @apply bg-secondary-700;
  }

  .strategy-step__slider-name {
    @apply flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-200;
  }

  .strategy-step__slider-pct {
    @apply ml-auto text-sm font-bold text-neutral-900 dark:text-neutral-100;
  }

  .strategy-step__slider-range {
    @apply h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 transition-all dark:bg-neutral-700;
  }

  .strategy-step__slider-range--needs {
    accent-color: theme('colors.primary.500');
  }

  .strategy-step__slider-range--wants {
    accent-color: theme('colors.success.500');
  }

  .strategy-step__slider-range--savings {
    accent-color: theme('colors.secondary.700');
  }

  /* Indicador de total */
  .strategy-step__total {
    @apply mt-4 flex items-center gap-2 rounded-md p-3 text-sm font-medium transition-colors;
  }

  .strategy-step__total--valid {
    @apply bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400;
  }

  .strategy-step__total--excess {
    @apply bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400;
  }

  .strategy-step__total--missing {
    @apply bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400;
  }

  .strategy-step__total-hint {
    @apply ml-1 text-xs opacity-75;
  }
</style>
