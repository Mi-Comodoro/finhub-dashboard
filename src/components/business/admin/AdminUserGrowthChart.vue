<script setup lang="ts">
  import { LineChart, type LineSeriesOption } from 'echarts/charts'
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

  import { useTimezone } from '@/composables/useTimezone'
  import { CHART_COLORS } from '@/utils/design-tokens'
  import type { GrowthPeriod, UserGrowthDataPoint } from '~/types/domain'

  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    LineSeriesOption | GridComponentOption | TooltipComponentOption
  >

  interface Props {
    data: UserGrowthDataPoint[]
    period: GrowthPeriod
  }

  const props = defineProps<Props>()

  const { tz } = useTimezone()

  const formatAxisDate = (isoDate: string): string => {
    const d = new Date(isoDate)
    if (props.period === '30d')
      return new Intl.DateTimeFormat('es-CO', {
        month: 'short',
        day: 'numeric',
        timeZone: tz.value
      }).format(d)
    if (props.period === '90d')
      return new Intl.DateTimeFormat('es-CO', {
        month: 'short',
        day: 'numeric',
        timeZone: tz.value
      }).format(d)
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      timeZone: tz.value
    }).format(d)
  }

  const formatTooltipDate = (isoDate: string): string => {
    const d = new Date(isoDate)
    if (props.period === '12m')
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        timeZone: tz.value
      }).format(d)
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz.value
    }).format(d)
  }

  const chartOption = computed<EChartsOption>(() => ({
    grid: { left: '2%', right: '2%', top: 20, bottom: '2%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ dataIndex: number; value: number }>) => {
        const p = params[0]
        const point = props.data[p.dataIndex]
        return `${formatTooltipDate(point.date)}<br><strong>${p.value} nuevos usuarios</strong>`
      }
    },
    xAxis: {
      type: 'category',
      data: props.data.map(d => formatAxisDate(d.date)),
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
      axisLabel: { fontSize: 11, color: '#94a3b8' }
    },
    series: [
      {
        name: 'Nuevos usuarios',
        type: 'line',
        smooth: true,
        data: props.data.map(d => d.newUsers),
        itemStyle: { color: CHART_COLORS.income },
        lineStyle: { color: CHART_COLORS.income, width: 2 },
        areaStyle: { color: CHART_COLORS.income, opacity: 0.08 },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }))
</script>

<template>
  <ClientOnly>
    <VChart :option="chartOption" autoresize class="admin-growth-chart" />
    <template #fallback>
      <div class="admin-growth-chart admin-growth-chart--skeleton" />
    </template>
  </ClientOnly>
</template>

<style scoped lang="postcss">
  .admin-growth-chart {
    @apply h-72 w-full;
  }

  .admin-growth-chart--skeleton {
    @apply animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700;
  }
</style>
