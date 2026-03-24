<script setup lang="ts">
  import { type Currency, formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'

  import type { Column } from './types/index'

  interface Data {
    [key: string]: string | number | boolean | Date | null | object | undefined
  }
  const props = defineProps<{
    column: Column
    row: Data
    currency: Currency
  }>()

  const value = props.row[props.column.key]
</script>

<template>
  <slot :name="`cell-${column.key}`" :row="row" :value="value">
    <template v-if="column.type === 'currency'">
      {{ formatCurrency(value as number, currency, 2) }}
    </template>

    <template v-else-if="column.type === 'date'">
      {{ value ? DateUtils.formatDate(value as Date) : 'N/A' }}
    </template>

    <template v-else>
      {{ value }}
    </template>
  </slot>
</template>
