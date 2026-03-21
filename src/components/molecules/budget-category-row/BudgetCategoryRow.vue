<script setup lang="ts">
  import { Text } from '@/components/atoms'
  import { formatCurrency } from '@/utils/currency'

  import type { BudgetCategoryRowProps } from './types/budget-category-row.types'

  withDefaults(defineProps<BudgetCategoryRowProps>(), {
    progress: 0
  })
</script>

<template>
  <div class="flex w-full flex-col xl:w-4/5 xl:space-y-4">
    <div class="space-y-2 py-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex min-w-0 items-center gap-2">
          <span :class="['h-3 w-3 shrink-0 rounded-full', color]" />
          <Text size="sm" class="truncate">
            {{ label }}
            <span class="text-slate-400">({{ percentage }}%)</span>
          </Text>
        </div>
        <Text size="sm" weight="semibold" class="shrink-0">
          {{ formatCurrency(amount, currency) }}
        </Text>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          :class="['h-full rounded-full transition-all duration-700', color]"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>
  </div>
</template>
