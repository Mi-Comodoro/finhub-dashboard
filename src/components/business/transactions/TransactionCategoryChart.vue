<script setup lang="ts">
  import { BarChart, type BarSeriesOption } from 'echarts/charts'
  import {
    GridComponent,
    type GridComponentOption,
    TooltipComponent,
    type TooltipComponentOption
  } from 'echarts/components'
  import { type ComposeOption, use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { computed } from 'vue'
  import VChart from 'vue-echarts'

  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import type { Currency } from '@/utils/currency'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'
  import type { TransactionSummary } from '~/types/domain'

  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<BarSeriesOption | GridComponentOption | TooltipComponentOption>

  interface Props {
    transactions: TransactionSummary[]
    currency?: Currency
  }

  const props = withDefaults(defineProps<Props>(), {
    currency: 'COP'
  })

  const expenseCategories = computed(() =>
    Object.values(
      props.transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce(
          (acc, transaction) => {
            const name = transaction.category?.name ?? 'Sin categoria'
            const current = acc[name] ?? { name, amount: 0 }
            current.amount += transaction.amount ?? 0
            acc[name] = current
            return acc
          },
          {} as Record<string, { name: string; amount: number }>
        )
    ).sort((a, b) => b.amount - a.amount)
  )

  const hasData = computed(() => expenseCategories.value.length > 0)

  const chartOption = computed<EChartsOption>(() => ({
    grid: {
      left: '2%',
      right: '2%',
      top: 20,
      bottom: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        formatter: (value: number) => formatCompactCurrency(value, props.currency)
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: expenseCategories.value.map(category => category.name),
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#334155',
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const item = params[0]
        if (!item) return ''
        return `${item.name}: <strong>${formatCurrency(Number(item.value || 0), props.currency)}</strong>`
      }
    },
    series: [
      {
        type: 'bar',
        data: expenseCategories.value.map(category => category.amount),
        itemStyle: {
          color: CHART_COLORS.expense,
          borderRadius: [0, 8, 8, 0]
        },
        barMaxWidth: 24
      }
    ]
  }))
</script>

<template>
  <div class="transaction-category-chart">
    <div class="transaction-category-chart__header">
      <Heading level="h3" size="lg" weight="semibold">Gastos por categoria</Heading>
      <Text size="sm" color="muted" class="transaction-category-chart__subtitle">
        Muestra en que categorias se concentra la mayor parte del gasto registrado.
      </Text>
    </div>

    <div class="transaction-category-chart__body">
      <ClientOnly v-if="hasData">
        <VChart :option="chartOption" autoresize class="transaction-category-chart__chart" />
        <template #fallback>
          <div class="transaction-category-chart__skeleton" />
        </template>
      </ClientOnly>

      <div v-else class="transaction-category-chart__empty">
        <Text size="sm" color="muted">No hay gastos para mostrar esta grafica.</Text>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .transaction-category-chart {
    @apply rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800;
  }

  .transaction-category-chart__header {
    @apply border-b border-slate-100 px-5 py-4 dark:border-slate-700;
  }

  .transaction-category-chart__subtitle {
    @apply mt-1;
  }

  .transaction-category-chart__body {
    @apply p-5;
  }

  .transaction-category-chart__chart {
    @apply h-56 w-full;
  }

  .transaction-category-chart__skeleton {
    @apply h-56 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-700;
  }

  .transaction-category-chart__empty {
    @apply flex h-56 items-center justify-center;
  }
</style>
