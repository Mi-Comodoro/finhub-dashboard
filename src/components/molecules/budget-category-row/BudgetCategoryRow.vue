<script setup lang="ts">
  import Text from '@/components/atoms/typography/Text.vue'
  import { formatCurrency } from '@/utils/currency'

  import type { BudgetCategoryRowProps } from './types/budget-category-row.types'

  withDefaults(defineProps<BudgetCategoryRowProps>(), {
    progress: 0
  })
</script>

<template>
  <div class="budget-category-row">
    <div class="budget-category-row__body">
      <!-- Fila de contenido: label y monto -->
      <div class="budget-category-row__main">
        <!-- Contenedor del label con indicador de color -->
        <div class="budget-category-row__label-wrapper">
          <span :class="['budget-category-row__dot', color]" />
          <Text size="sm" class="budget-category-row__label">
            {{ label }}
            <span class="budget-category-row__percentage">({{ percentage }}%)</span>
          </Text>
        </div>

        <!-- Monto: siempre visible y sin cortes -->
        <Text size="sm" weight="semibold" class="budget-category-row__amount">
          {{ formatCurrency(amount, currency) }}
        </Text>
      </div>

      <!-- Barra de progreso -->
      <div class="budget-category-row__track">
        <div
          :class="['budget-category-row__bar', color]"
          :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-category-row {
    @apply w-full;
  }

  .budget-category-row__body {
    @apply space-y-2 py-2;
  }

  .budget-category-row__main {
    @apply flex flex-wrap items-center justify-between gap-2;
  }

  .budget-category-row__label-wrapper {
    @apply flex min-w-0 flex-1 items-center gap-2;
  }

  .budget-category-row__dot {
    @apply h-3 w-3 shrink-0 rounded-full;
  }

  .budget-category-row__label {
    @apply min-w-0 flex-1 truncate;
  }

  .budget-category-row__percentage {
    @apply text-slate-400;
  }

  .budget-category-row__amount {
    @apply shrink-0 whitespace-nowrap;
  }

  .budget-category-row__track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700;
  }

  .budget-category-row__bar {
    @apply h-full rounded-full transition-all duration-700;
  }
</style>
