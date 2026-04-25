<script setup lang="ts">
  import { LineChart, type LineSeriesOption } from 'echarts/charts'
  import {
    GridComponent,
    type GridComponentOption,
    LegendComponent,
    type LegendComponentOption,
    MarkLineComponent,
    type MarkLineComponentOption,
    TooltipComponent,
    type TooltipComponentOption
  } from 'echarts/components'
  import { type ComposeOption, use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { computed } from 'vue'
  import VChart from 'vue-echarts'

  import { Text } from '@/components/atoms'
  import type { Currency } from '@/utils/currency'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  use([LineChart, GridComponent, LegendComponent, MarkLineComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    | LineSeriesOption
    | GridComponentOption
    | LegendComponentOption
    | MarkLineComponentOption
    | TooltipComponentOption
  >

  interface Props {
    baseData: number[] // aportes sin interés
    interestData: number[] // aportes + interés compuesto
    months: number // 12 | 24 | 36
    startMonth?: number // mes de inicio (1-12), default 1
    targetAmount?: number // línea de objetivo
    currency: Currency
  }

  const props = defineProps<Props>()

  const hasData = computed(() => props.interestData.length > 0)

  const xLabels = computed(() => {
    const start = props.startMonth ?? 1
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return Array.from({ length: props.months }, (_, i) => {
      const monthNum = ((start - 1 + i) % 12) + 1
      return monthNames[monthNum - 1]
    })
  })

  const chartOption = computed<EChartsOption>(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ seriesName: string; value: number; color: string; axisValue: string }>) => {
        let html = `<div style="font-weight:600;margin-bottom:6px">${params[0]?.axisValue}</div>`
        params.forEach(p => {
          html += `<div style="margin:3px 0">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;
              background:${p.color};margin-right:6px"></span>
            ${p.seriesName}: <strong>${formatCurrency(p.value, props.currency)}</strong>
          </div>`
        })
        if (params.length === 2) {
          const diff = (params[1]?.value ?? 0) - (params[0]?.value ?? 0)
          if (diff > 0) {
            html += `<div style="margin-top:4px;color:#14b8a6;font-size:11px">
              +${formatCurrency(diff, props.currency)} por interés
            </div>`
          }
        }
        return html
      }
    },
    legend: {
      data: ['Solo aportes', 'Con interés compuesto'],
      bottom: 0,
      textStyle: { fontSize: 11 }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xLabels.value,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
      axisLabel: {
        formatter: (v: number) => formatCompactCurrency(v, props.currency)
      }
    },
    series: [
      {
        name: 'Solo aportes',
        type: 'line',
        data: props.baseData,
        lineStyle: { color: '#94a3b8', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#94a3b8' },
        symbol: 'none'
      },
      {
        name: 'Con interés compuesto',
        type: 'line',
        smooth: true,
        data: props.interestData,
        lineStyle: { color: CHART_COLORS.savings, width: 2.5 },
        itemStyle: { color: CHART_COLORS.savings },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: CHART_COLORS.savings + '30' },
              { offset: 1, color: CHART_COLORS.savings + '05' }
            ]
          }
        },
        symbol: 'none',
        ...(props.targetAmount && props.targetAmount > 0
          ? {
              markLine: {
                silent: true,
                symbol: 'none',
                data: [{ yAxis: props.targetAmount }],
                lineStyle: { color: '#f59e0b', type: 'dashed', width: 1.5 },
                label: {
                  formatter: 'Objetivo',
                  position: 'insideEndTop',
                  fontSize: 11,
                  color: '#f59e0b'
                }
              }
            }
          : {})
      }
    ]
  }))
</script>

<template>
  <ClientOnly v-if="hasData">
    <VChart :option="chartOption" autoresize class="h-72 w-full" />
    <template #fallback>
      <div class="h-72 w-full animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-700" />
    </template>
  </ClientOnly>
  <div v-else class="flex h-72 items-center justify-center">
    <Text size="sm" color="muted"> Realiza tu primer aporte para ver la proyección. </Text>
  </div>
</template>
