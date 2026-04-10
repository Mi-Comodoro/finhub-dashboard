<script setup lang="ts">
  import { BarChart, type BarSeriesOption } from 'echarts/charts'
  import {
    GridComponent,
    type GridComponentOption,
    TooltipComponent,
    type TooltipComponentOption
  } from 'echarts/components'
  import { type ComposeOption,use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { computed } from 'vue'
  import VChart from 'vue-echarts'

  import { Heading, Text } from '@/components/atoms'
  import type { BudgetHistoricalSummaryItem } from '~/types/domain'

  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<BarSeriesOption | GridComponentOption | TooltipComponentOption>

  interface Props {
    items: BudgetHistoricalSummaryItem[]
  }

  const props = defineProps<Props>()

  const hasData = computed(() => props.items.length > 0)

  const chartOption = computed<EChartsOption>(() => ({
    grid: {
      left: '2%',
      right: '2%',
      top: 20,
      bottom: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.items.map(item => item.month),
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `${value}%`
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const item = params[0]
        if (!item) return ''
        return `${item.name}: <strong>${Number(item.value || 0).toFixed(2)}%</strong>`
      }
    },
    series: [
      {
        type: 'bar',
        data: props.items.map(item => Number(item.savingsRate.toFixed(2))),
        itemStyle: {
          color: '#534AB7',
          borderRadius: [8, 8, 0, 0]
        },
        barMaxWidth: 32
      }
    ]
  }))
</script>

<template>
  <div class="rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
      <Heading level="h3" size="lg" weight="semibold">Tasa de ahorro</Heading>
      <Text size="sm" color="muted" class="mt-1">
        Mide que porcentaje del ingreso recibido termino convirtiendose en ahorro.
      </Text>
    </div>

    <div class="p-5">
      <ClientOnly v-if="hasData">
        <VChart :option="chartOption" autoresize class="h-80 w-full" />
        <template #fallback>
          <div class="h-80 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-700" />
        </template>
      </ClientOnly>

      <div v-else class="flex h-80 items-center justify-center">
        <Text size="sm" color="muted">No hay tasa de ahorro historica para mostrar.</Text>
      </div>
    </div>
  </div>
</template>
