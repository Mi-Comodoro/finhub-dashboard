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
        name: 'Esperado',
        type: 'line',
        smooth: true,
        data: props.items.map(item => item.expectedIncome),
        itemStyle: { color: CHART_COLORS.planned },
        lineStyle: { color: CHART_COLORS.planned, width: 3 }
      },
      {
        name: 'Recibido',
        type: 'line',
        smooth: true,
        data: props.items.map(item => item.receivedIncome),
        itemStyle: { color: CHART_COLORS.secondary },
        lineStyle: { color: CHART_COLORS.secondary, width: 3 }
      }
    ]
  }))
</script>

<template>
  <div class="incomes-trend-chart">
    <div class="incomes-trend-chart__header">
      <Heading level="h3" size="lg" weight="semibold">Tendencia de ingresos</Heading>
      <Text size="sm" color="muted" class="incomes-trend-chart__subtitle">
        Compara por mes los ingresos planificados frente a los realmente recibidos.
      </Text>
    </div>

    <div class="incomes-trend-chart__body">
      <ClientOnly v-if="hasData">
        <VChart :option="chartOption" autoresize class="incomes-trend-chart__chart" />
        <template #fallback>
          <div class="incomes-trend-chart__skeleton" />
        </template>
      </ClientOnly>

      <div v-else class="incomes-trend-chart__empty">
        <Text size="sm" color="muted">No hay datos historicos de ingresos para mostrar.</Text>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .incomes-trend-chart {
    @apply rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800;
  }
  .incomes-trend-chart__header {
    @apply border-b border-slate-100 px-5 py-4 dark:border-slate-700;
  }
  .incomes-trend-chart__subtitle {
    @apply mt-1;
  }
  .incomes-trend-chart__body {
    @apply p-5;
  }
  .incomes-trend-chart__chart {
    @apply h-80 w-full;
  }
  .incomes-trend-chart__skeleton {
    @apply h-80 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-700;
  }
  .incomes-trend-chart__empty {
    @apply flex h-80 items-center justify-center;
  }
</style>
