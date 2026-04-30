<script setup lang="ts">
  import { computed } from 'vue'
  import VChart from 'vue-echarts'

  import { Card, Heading } from '@/components/atoms'
  import type { Currency } from '@/utils/currency'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  interface Props {
    expectedIncome?: number
    receivedIncome?: number
    estimatedSavings?: number
    generatedSavings?: number
    plannedExpenses?: number
    paidExpenses?: number
    currency?: Currency
  }

  const props = withDefaults(defineProps<Props>(), {
    expectedIncome: 0,
    receivedIncome: 0,
    estimatedSavings: 0,
    generatedSavings: 0,
    plannedExpenses: 0,
    paidExpenses: 0,
    currency: 'COP'
  })

  const chartOption = computed(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (
          params: { value: number; axisValue: number; seriesName: string; color: string }[]
        ) => {
          let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0]!.axisValue}</div>`
          params.forEach(
            (param: { value: number; axisValue: number; seriesName: string; color: string }) => {
              const value = formatCurrency(param.value, props.currency)
              result += `
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                <span>${param.seriesName}: <strong>${value}</strong></span>
              </div>
            `
            }
          )
          return result
        }
      },
      legend: {
        data: ['Planificado', 'Real'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Ingresos', 'Ahorros', 'Gastos']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => formatCompactCurrency(value, props.currency)
        }
      },
      series: [
        {
          name: 'Planificado',
          type: 'bar',
          data: [props.expectedIncome, props.estimatedSavings, props.plannedExpenses],
          itemStyle: {
            color: CHART_COLORS.needs
          }
        },
        {
          name: 'Real',
          type: 'bar',
          data: [props.receivedIncome, props.generatedSavings, props.paidExpenses],
          itemStyle: {
            color: CHART_COLORS.savings
          }
        }
      ]
    }
  })
</script>

<template>
  <Card class="balance-chart">
    <div class="balance-chart__header">
      <Heading level="h3" size="lg" weight="semibold">Balance Financiero</Heading>
    </div>

    <ClientOnly>
      <VChart :option="chartOption" style="height: 300px" autoresize />
      <template #fallback>
        <div class="balance-chart__fallback">
          <div class="balance-chart__fallback-loader" />
        </div>
      </template>
    </ClientOnly>
  </Card>
</template>

<style scoped lang="postcss">
.balance-chart {
  @apply p-5;
}

.balance-chart__header {
  @apply mb-4 flex items-center justify-between;
}

.balance-chart__fallback {
  @apply flex h-[300px] items-center justify-center;
}

.balance-chart__fallback-loader {
  @apply h-32 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700;
}
</style>
