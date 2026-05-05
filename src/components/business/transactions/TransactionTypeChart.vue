<script setup lang="ts">
  import { PieChart, type PieSeriesOption } from 'echarts/charts'
  import {
    LegendComponent,
    type LegendComponentOption,
    TooltipComponent,
    type TooltipComponentOption
  } from 'echarts/components'
  import { type ComposeOption, use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { computed } from 'vue'
  import VChart from 'vue-echarts'

  import { Heading, Text } from '@/components/atoms'
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'
  import type { TransactionSummary } from '~/types/domain'

  use([PieChart, LegendComponent, TooltipComponent, CanvasRenderer])

  type EChartsOption = ComposeOption<
    PieSeriesOption | TooltipComponentOption | LegendComponentOption
  >

  interface Props {
    transactions: TransactionSummary[]
    currency?: Currency
  }

  const props = withDefaults(defineProps<Props>(), {
    currency: 'COP'
  })

  const TYPE_META: Record<TransactionSummary['type'], { label: string; color: string }> = {
    income: { label: 'Ingresos', color: CHART_COLORS.income },
    expense: { label: 'Gastos', color: CHART_COLORS.expense },
    savings: { label: 'Ahorro', color: CHART_COLORS.savings }
  }

  const seriesData = computed(() =>
    (Object.keys(TYPE_META) as TransactionSummary['type'][]).map(type => ({
      name: TYPE_META[type].label,
      color: TYPE_META[type].color,
      value: props.transactions
        .filter(transaction => transaction.type === type)
        .reduce((total, transaction) => total + (transaction.amount ?? 0), 0),
      itemStyle: {
        color: TYPE_META[type].color
      }
    }))
  )

  const legendItems = computed(() => seriesData.value.filter(item => item.value > 0))

  const hasData = computed(() => legendItems.value.length > 0)

  const chartOption = computed<EChartsOption>(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number }) =>
        `${params.name}: <strong>${formatCurrency(Number(params.value || 0), props.currency)}</strong>`
    },
    legend: {
      show: false
    },
    series: [
      {
        type: 'pie',
        radius: ['56%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: {
          show: false
        },
        data: seriesData.value
      }
    ]
  }))
</script>

<template>
  <div
    class="rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
  >
    <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
      <Heading level="h3" size="lg" weight="semibold">Distribucion por tipo</Heading>
      <Text size="sm" color="muted" class="mt-1">
        Resume cuanto del movimiento corresponde a ingresos, gastos y ahorro.
      </Text>
    </div>

    <div class="grid gap-4 p-5 md:grid-cols-[220px,1fr] md:items-center">
      <ClientOnly v-if="hasData">
        <VChart :option="chartOption" autoresize class="h-56 w-full" />
        <template #fallback>
          <div class="h-56 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-700" />
        </template>
      </ClientOnly>

      <div v-if="hasData" class="space-y-3">
        <div
          v-for="item in legendItems"
          :key="item.name"
          class="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <div class="flex items-center gap-3">
            <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: item.color }" />
            <Text size="sm" weight="medium">{{ item.name }}</Text>
          </div>
          <Text size="sm" weight="semibold">
            {{ formatCurrency(item.value, currency) }}
          </Text>
        </div>
      </div>

      <div v-else class="flex h-56 items-center justify-center md:col-span-2">
        <Text size="sm" color="muted">No hay transacciones para mostrar esta grafica.</Text>
      </div>
    </div>
  </div>
</template>
