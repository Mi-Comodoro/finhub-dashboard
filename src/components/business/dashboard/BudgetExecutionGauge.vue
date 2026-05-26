<script setup lang="ts">
  import { computed } from 'vue'
  import VChart from 'vue-echarts'

  import Card from '@/components/atoms/card/Card.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'

  interface Props {
    incomeReceived?: number
    incomeExpected?: number
    expensesPaid?: number
    expensesPlanned?: number
    savingsGenerated?: number
    savingsTarget?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    incomeReceived: 0,
    incomeExpected: 0,
    expensesPaid: 0,
    expensesPlanned: 0,
    savingsGenerated: 0,
    savingsTarget: 0
  })

  function pct(value: number, total: number): number {
    if (!total) return 0
    return Math.min(Math.round((value / total) * 100), 100)
  }

  const incomePct = computed(() => pct(props.incomeReceived, props.incomeExpected))
  const expensePct = computed(() => pct(props.expensesPaid, props.expensesPlanned))
  const savingsPct = computed(() => pct(props.savingsGenerated, props.savingsTarget))

  const periodScore = computed(() =>
    Math.round((incomePct.value + expensePct.value + savingsPct.value) / 3)
  )

  const scoreColor = computed(() => {
    if (periodScore.value >= 70) return '#22c55e'
    if (periodScore.value >= 40) return '#f59e0b'
    return '#ef4444'
  })

  const scoreLabel = computed(() => {
    if (periodScore.value >= 70) return 'Período sano'
    if (periodScore.value >= 40) return 'En progreso'
    return 'Requiere atención'
  })

  const scoreLabelClass = computed(() => {
    if (periodScore.value >= 70) return 'execution-gauge__score-label--healthy'
    if (periodScore.value >= 40) return 'execution-gauge__score-label--regular'
    return 'execution-gauge__score-label--critical'
  })

  const gaugeOption = computed(() => ({
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: '100%',
        center: ['50%', '78%'],
        progress: {
          show: true,
          width: 16,
          itemStyle: { color: scoreColor.value }
        },
        axisLine: {
          lineStyle: {
            width: 16,
            color: [[1, '#f1f5f9']]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 32,
          fontWeight: 'bold',
          color: scoreColor.value,
          formatter: '{value}%',
          offsetCenter: [0, '-10%']
        },
        data: [{ value: periodScore.value }]
      }
    ]
  }))

  const metrics = computed(() => [
    {
      label: 'Ingresos recibidos',
      pct: incomePct.value,
      fillClass: 'execution-gauge__bar-fill--income'
    },
    {
      label: 'Gastos ejecutados',
      pct: expensePct.value,
      fillClass: 'execution-gauge__bar-fill--expense'
    },
    {
      label: 'Ahorro generado',
      pct: savingsPct.value,
      fillClass: 'execution-gauge__bar-fill--savings'
    }
  ])
</script>

<template>
  <Card class="execution-gauge">
    <div class="execution-gauge__header">
      <Heading level="h3" size="lg" weight="semibold">Estado del Período</Heading>
    </div>

    <ClientOnly>
      <VChart :option="gaugeOption" style="height: 180px" autoresize />
      <template #fallback>
        <div class="execution-gauge__fallback" />
      </template>
    </ClientOnly>

    <div class="execution-gauge__score-row">
      <span class="execution-gauge__score-label" :class="scoreLabelClass">
        {{ scoreLabel }}
      </span>
    </div>

    <div class="execution-gauge__metrics">
      <div v-for="metric in metrics" :key="metric.label" class="execution-gauge__metric">
        <div class="execution-gauge__metric-header">
          <Text size="xs" color="muted">{{ metric.label }}</Text>
          <Text size="xs" weight="semibold">{{ metric.pct }}%</Text>
        </div>
        <div class="execution-gauge__bar-track">
          <div
            class="execution-gauge__bar-fill"
            :class="metric.fillClass"
            :style="{ width: `${metric.pct}%` }"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped lang="postcss">
  .execution-gauge {
    @apply flex flex-col gap-4 p-5;
  }

  .execution-gauge__header {
    @apply flex items-center justify-between;
  }

  .execution-gauge__fallback {
    @apply h-[180px] animate-pulse rounded-lg bg-slate-100;
  }

  .execution-gauge__score-row {
    @apply -mt-3 flex justify-center;
  }

  .execution-gauge__score-label {
    @apply text-sm font-semibold;
  }

  .execution-gauge__score-label--healthy {
    @apply text-success-600;
  }

  .execution-gauge__score-label--regular {
    @apply text-warning-600;
  }

  .execution-gauge__score-label--critical {
    @apply text-danger-600;
  }

  .execution-gauge__metrics {
    @apply flex flex-col gap-2.5;
  }

  .execution-gauge__metric {
    @apply flex flex-col gap-1;
  }

  .execution-gauge__metric-header {
    @apply flex items-center justify-between;
  }

  .execution-gauge__bar-track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .execution-gauge__bar-fill {
    @apply h-full rounded-full transition-all duration-700;
  }

  .execution-gauge__bar-fill--income {
    @apply bg-primary-500;
  }

  .execution-gauge__bar-fill--expense {
    @apply bg-danger-400;
  }

  .execution-gauge__bar-fill--savings {
    @apply bg-warning-500;
  }
</style>
