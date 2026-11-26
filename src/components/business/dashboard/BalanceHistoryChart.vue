<script setup lang="ts">
  import { LineChart, type LineSeriesOption } from 'echarts/charts'
  import {
    GridComponent,
    type GridComponentOption,
    LegendComponent,
    type LegendComponentOption,
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
  import { formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'
  import type { BudgetHistoricalSummaryItem } from '~/types/domain'

  use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    LineSeriesOption | GridComponentOption | TooltipComponentOption | LegendComponentOption
  >

  interface Props {
    items: BudgetHistoricalSummaryItem[]
    currency?: Currency
  }

  const props = withDefaults(defineProps<Props>(), {
    currency: 'COP'
  })

  const hasData = computed(() => props.items.length > 0)

  const chartOption = computed<EChartsOption>(() => ({
    grid: {
      left: '2%',
      right: '2%',
      top: 24,
      bottom: '2%',
      containLabel: true
    },
    legend: {
      top: 0
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ seriesName: string; value: number }>) =>
        params
          .map(
            param =>
              `${param.seriesName}: <strong>${formatCurrency(Number(param.value || 0), props.currency)}</strong>`
          )
          .join('<br>')
    },
    xAxis: {
      type: 'category',
      data: props.items.map(item => item.month),
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Ingresos',
        type: 'line',
        smooth: true,
        data: props.items.map(item => item.receivedIncome),
        itemStyle: { color: CHART_COLORS.income },
        lineStyle: { color: CHART_COLORS.income, width: 3 }
      },
      {
        name: 'Gastos',
        type: 'line',
        smooth: true,
        data: props.items.map(item => item.totalExpenses),
        itemStyle: { color: CHART_COLORS.expense },
        lineStyle: { color: CHART_COLORS.expense, width: 3 }
      },
      {
        name: 'Ahorro',
        type: 'line',
        smooth: true,
        data: props.items.map(item => item.totalSavings),
        itemStyle: { color: CHART_COLORS.savings },
        lineStyle: { color: CHART_COLORS.savings, width: 3 }
      }
    ]
  }))
</script>

<template>
  <div class="balance-history-chart">
    <div class="balance-history-chart__header">
      <Heading level="h3" size="lg" weight="semibold">Historial de balance</Heading>
      <Text size="sm" color="muted" class="balance-history-chart__subtitle">
        Resume el comportamiento mensual de ingresos, gastos y ahorro ejecutado.
      </Text>
    </div>

    <div class="balance-history-chart__body">
      <ClientOnly v-if="hasData">
        <VChart :option="chartOption" autoresize class="balance-history-chart__chart" />
        <template #fallback>
          <div class="balance-history-chart__skeleton" />
        </template>
      </ClientOnly>

      <div v-else class="balance-history-chart__empty">
        <Text size="sm" color="muted">No hay balance historico para mostrar.</Text>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .balance-history-chart {
    @apply rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800;
  }

  .balance-history-chart__header {
    @apply border-b border-slate-100 px-5 py-4 dark:border-slate-700;
  }

  .balance-history-chart__subtitle {
    @apply mt-1;
  }

  .balance-history-chart__body {
    @apply p-5;
  }

  .balance-history-chart__chart {
    @apply h-80 w-full;
  }

  .balance-history-chart__skeleton {
    @apply h-80 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-700;
  }

  .balance-history-chart__empty {
    @apply flex h-80 items-center justify-center;
  }
</style>
