<script setup lang="ts">
  import { computed } from 'vue'

  import type { FinancialHealthGaugeProps } from './types/financial-health-gauge.types'

  const props = withDefaults(defineProps<FinancialHealthGaugeProps>(), {
    score: 0,
    savingsRate: 0,
    incomeRate: 0,
    expenseRate: 0,
    hasDebtModule: false
  })

  // SVG gauge constants
  const CX = 100
  const CY = 100
  const R = 80
  const STROKE_WIDTH = 14

  // Semicircle arc length (π * R)
  const ARC_LENGTH = Math.PI * R

  // Score clamped 0-100
  const clampedScore = computed(() => Math.min(Math.max(props.score ?? 0, 0), 100))

  // Dash offset for filled arc: 0 = full, ARC_LENGTH = empty
  const filledDash = computed(() => (clampedScore.value / 100) * ARC_LENGTH)
  const emptyDash = computed(() => ARC_LENGTH - filledDash.value)

  // Needle angle: starts at -180deg (left), ends at 0deg (right)
  const needleAngle = computed(() => -180 + (clampedScore.value / 100) * 180)

  // Needle endpoint
  const needleLength = 62
  const needleX = computed(() => {
    const rad = (needleAngle.value * Math.PI) / 180
    return CX + needleLength * Math.cos(rad)
  })
  const needleY = computed(() => {
    const rad = (needleAngle.value * Math.PI) / 180
    return CY + needleLength * Math.sin(rad)
  })

  type ScoreLevel = 'Crítico' | 'Regular' | 'Saludable' | 'Óptimo'

  const scoreLevel = computed((): ScoreLevel => {
    const s = clampedScore.value
    if (s === 100) return 'Óptimo'
    if (s >= 70) return 'Saludable'
    if (s >= 40) return 'Regular'
    return 'Crítico'
  })

  const scoreLevelClass = computed(() => {
    const level = scoreLevel.value
    if (level === 'Crítico') return 'gauge__score-level--critical'
    if (level === 'Regular') return 'gauge__score-level--warning'
    if (level === 'Óptimo') return 'gauge__score-level--optimal'
    return 'gauge__score-level--healthy'
  })

  const metrics = computed(() => [
    {
      label: 'Ahorro ejecutado',
      value: props.savingsRate ?? 0,
      available: true
    },
    {
      label: 'Ingresos recibidos',
      value: props.incomeRate ?? 0,
      available: true
    },
    {
      label: 'Gastos planificados',
      value: props.expenseRate ?? 0,
      available: true
    },
    {
      label: 'Deudas activas',
      value: 0,
      available: props.hasDebtModule
    }
  ])

  function metricBarClass(value: number): string {
    if (value >= 80) return 'gauge__metric-bar--high'
    if (value >= 40) return 'gauge__metric-bar--medium'
    return 'gauge__metric-bar--low'
  }
</script>

<template>
  <div class="gauge">
    <div class="gauge__inner">
      <!-- SVG Semicircular gauge -->
      <div class="gauge__svg-wrapper">
        <svg
          viewBox="0 0 200 110"
          class="gauge__svg"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#EF4444" />
              <stop offset="50%" stop-color="#F59E0B" />
              <stop offset="100%" stop-color="#14B8A6" />
            </linearGradient>
          </defs>

          <!-- Background track -->
          <path
            :d="`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`"
            fill="none"
            stroke="#E2E8F0"
            :stroke-width="STROKE_WIDTH"
            stroke-linecap="round"
          />

          <!-- Filled arc -->
          <path
            :d="`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`"
            fill="none"
            stroke="url(#gaugeGradient)"
            :stroke-width="STROKE_WIDTH"
            stroke-linecap="round"
            :stroke-dasharray="`${filledDash} ${emptyDash + 1}`"
          />

          <!-- Needle -->
          <line
            :x1="CX"
            :y1="CY"
            :x2="needleX"
            :y2="needleY"
            stroke="#1E293B"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <circle :cx="CX" :cy="CY" r="4" fill="#1E293B" />

          <!-- Score text -->
          <text
            :x="CX"
            :y="CY - 10"
            text-anchor="middle"
            font-size="22"
            font-weight="800"
            fill="#0F172A"
          >
            {{ clampedScore }}
          </text>
          <text :x="CX" :y="CY + 8" text-anchor="middle" font-size="9" fill="#64748B">
            de 100 pts
          </text>

          <!-- Bottom labels -->
          <text x="22" y="112" text-anchor="middle" font-size="7.5" fill="#94A3B8">Crítico</text>
          <text :x="CX" y="112" text-anchor="middle" font-size="7.5" fill="#94A3B8">Regular</text>
          <text x="178" y="112" text-anchor="middle" font-size="7.5" fill="#94A3B8">Óptimo</text>
        </svg>

        <!-- Level label below SVG -->
        <div class="gauge__score-label">
          <span class="gauge__score-level" :class="scoreLevelClass">
            {{ scoreLevel }}
          </span>
        </div>
      </div>

      <!-- Metrics list -->
      <div class="gauge__metrics">
        <div v-for="metric in metrics" :key="metric.label" class="gauge__metric">
          <div class="gauge__metric-header">
            <span class="gauge__metric-label">{{ metric.label }}</span>
            <span v-if="metric.available" class="gauge__metric-value">{{ metric.value }}%</span>
            <span v-else class="gauge__metric-pending">— en planificación</span>
          </div>
          <div v-if="metric.available" class="gauge__metric-track">
            <div
              class="gauge__metric-bar"
              :class="metricBarClass(metric.value)"
              :style="{ width: `${Math.min(metric.value, 100)}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .gauge {
    @apply rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800;
  }

  .gauge__inner {
    @apply flex flex-col items-center gap-6 sm:flex-row;
  }

  .gauge__svg-wrapper {
    @apply flex shrink-0 flex-col items-center;
  }

  .gauge__svg {
    @apply w-44;
  }

  .gauge__score-label {
    @apply mt-1 text-center;
  }

  .gauge__score-level {
    @apply text-sm font-bold;
  }

  .gauge__score-level--critical {
    @apply text-danger-600;
  }

  .gauge__score-level--warning {
    @apply text-warning-600;
  }

  .gauge__score-level--healthy {
    @apply text-primary-600;
  }

  .gauge__score-level--optimal {
    @apply text-success-600;
  }

  .gauge__metrics {
    @apply min-w-0 flex-1 space-y-3;
  }

  .gauge__metric {
    @apply space-y-1;
  }

  .gauge__metric-header {
    @apply flex items-center justify-between gap-2;
  }

  .gauge__metric-label {
    @apply text-xs text-neutral-600;
  }

  .gauge__metric-value {
    @apply text-xs font-semibold text-neutral-700;
  }

  .gauge__metric-pending {
    @apply text-xs text-neutral-400;
  }

  .gauge__metric-track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .gauge__metric-bar {
    @apply h-full rounded-full transition-all duration-700;
  }

  .gauge__metric-bar--high {
    @apply bg-primary-500;
  }

  .gauge__metric-bar--medium {
    @apply bg-warning-500;
  }

  .gauge__metric-bar--low {
    @apply bg-danger-400;
  }
</style>
