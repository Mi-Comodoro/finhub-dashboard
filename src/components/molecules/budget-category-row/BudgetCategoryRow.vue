<script setup lang="ts">
  import Text from '@/components/atoms/typography/Text.vue'
  import { formatCurrency } from '@/utils/currency'

  import type { BudgetCategoryRowProps } from './types/budget-category-row.types'

  withDefaults(defineProps<BudgetCategoryRowProps>(), {
    progress: 0
  })
</script>

<template>
  <div class="w-full">
    <div class="space-y-2 py-2">
      <!-- Fila de contenido: label y monto -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <!-- Contenedor del label con indicador de color -->
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <span :class="['h-3 w-3 shrink-0 rounded-full', color]" />
          <Text size="sm" class="min-w-0 flex-1 truncate">
            {{ label }}
            <span class="text-slate-400">({{ percentage }}%)</span>
          </Text>
        </div>

        <!-- Monto: siempre visible y sin cortes -->
        <Text size="sm" weight="semibold" class="shrink-0 whitespace-nowrap">
          {{ formatCurrency(amount, currency) }}
        </Text>
      </div>

      <!-- Barra de progreso -->
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          :class="['h-full rounded-full transition-all duration-700', color]"
          :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
        />
      </div>
    </div>
  </div>
</template>
