<script setup lang="ts">
  import { Text } from '@/components/atoms'
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'

  interface Props {
    label: string
    percentage: number
    amount: number
    currency: Currency
    /** Tailwind color class applied to the dot and the progress bar fill — e.g. "bg-teal-500" */
    color: string
    /** 0–100 progress value; defaults to 0 until transactions are linked */
    progress?: number
  }

  withDefaults(defineProps<Props>(), {
    progress: 0
  })
</script>

<template>
  <div class="space-y-1.5">
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
</template>
