<script setup lang="ts">
  import { computed } from 'vue'

  import type { FinancialHealthGaugeProps } from './types/financial-health-gauge.types'

  const props = withDefaults(defineProps<FinancialHealthGaugeProps>(), {
    score: 0,
    level: 'critical',
    cashFlowScore: 0,
    savingsScore: 0,
    expenseScore: 0,
    debtScore: 10,
    hasDebtModule: false
  })

  const LEVEL_LABELS: Record<string, string> = {
    critical: 'Crítico',
    at_risk: 'En riesgo',
    regular: 'Regular',
    healthy: 'Saludable',
    optimal: 'Óptimo'
  }

  // SVG gauge constants
  const CX = 100
  const CY = 100
  const R = 80
  const STROKE_WIDTH = 14

  const ARC_LENGTH = Math.PI * R

  const clampedScore = computed(() => Math.min(Math.max(props.score ?? 0, 0), 100))

  const filledDash = computed(() => (clampedScore.value / 100) * ARC_LENGTH)
  const emptyDash = computed(() => ARC_LENGTH - filledDash.value)

  const needleAngle = computed(() => -180 + (clampedScore.value / 100) * 180)

  const needleLength = 62
  const needleX = computed(() => {
    const rad = (needleAngle.value * Math.PI) / 180
    return CX + needleLength * Math.cos(rad)
  })
  const needleY = computed(() => {
    const rad = (needleAngle.value * Math.PI) / 180
    return CY + needleLength * Math.sin(rad)
  })

  const scoreLabel = computed(() => LEVEL_LABELS[props.level ?? 'critical'] ?? 'Crítico')

  const scoreLevelClass = computed(() => {
    const level = props.level ?? 'critical'
    if (level === 'critical') return 'gauge__score-level--critical'
    if (level === 'at_risk') return 'gauge__score-level--warning'
    if (level === 'regular') return 'gauge__score-level--warning'
    if (level === 'optimal') return 'gauge__score-level--optimal'
    return 'gauge__score-level--healthy'
  })

  const pillars = computed(() => [
    {
      label: 'Flujo de caja',
      score: props.cashFlowScore ?? 0,
      max: 25,
      available: true
    },
    {
      label: 'Ahorro y metas',
      score: props.savingsScore ?? 0,
      max: 35,
      available: true
    },
    {
      label: 'Control de gastos',
      score: props.expenseScore ?? 0,
      max: 20,
      available: true
    },
    {
      label: 'Deudas',
      score: props.debtScore ?? 0,
      max: 20,
      available: props.hasDebtModule
    }
  ])

  function pillarBarClass(score: number, max: number): string {
    const pct = max > 0 ? (score / max) * 100 : 0
    if (pct >= 80) return 'gauge__pillar-bar--high'
    if (pct >= 40) return 'gauge__pillar-bar--medium'
    return 'gauge__pillar-bar--low'
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
            {{ scoreLabel }}
          </span>
        </div>
      </div>

      <!-- Pillars breakdown table -->
      <div class="gauge__pillars">
        <div class="gauge__pillars-header">
          <span class="gauge__pillars-col gauge__pillars-col--label">Pilar</span>
          <span class="gauge__pillars-col gauge__pillars-col--score">Pts</span>
          <span class="gauge__pillars-col gauge__pillars-col--max">Máx</span>
        </div>
        <div v-for="pillar in pillars" :key="pillar.label" class="gauge__pillar">
          <div class="gauge__pillar-row">
            <span class="gauge__pillar-label">{{ pillar.label }}</span>
            <span v-if="pillar.available" class="gauge__pillar-score">{{ pillar.score }}</span>
            <span v-else class="gauge__pillar-pending">— planificado</span>
            <span class="gauge__pillar-max">{{ pillar.max }}</span>
          </div>
          <div v-if="pillar.available" class="gauge__pillar-track">
            <div
              class="gauge__pillar-bar"
              :class="pillarBarClass(pillar.score, pillar.max)"
              :style="{ width: `${Math.min((pillar.score / pillar.max) * 100, 100)}%` }"
            />
          </div>
          <div v-else class="gauge__pillar-track">
            <div class="gauge__pillar-track-placeholder" />
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

  .gauge__pillars {
    @apply min-w-0 flex-1 space-y-2;
  }

  .gauge__pillars-header {
    @apply flex items-center gap-2 border-b border-neutral-100 pb-1;
  }

  .gauge__pillars-col {
    @apply text-xs font-semibold text-neutral-400;
  }

  .gauge__pillars-col--label {
    @apply flex-1;
  }

  .gauge__pillars-col--score {
    @apply w-8 text-right;
  }

  .gauge__pillars-col--max {
    @apply w-8 text-right;
  }

  .gauge__pillar {
    @apply space-y-1;
  }

  .gauge__pillar-row {
    @apply flex items-center gap-2;
  }

  .gauge__pillar-label {
    @apply flex-1 text-xs text-neutral-600;
  }

  .gauge__pillar-score {
    @apply w-8 text-right text-xs font-semibold text-neutral-700;
  }

  .gauge__pillar-pending {
    @apply flex-1 text-xs text-neutral-400;
  }

  .gauge__pillar-max {
    @apply w-8 text-right text-xs text-neutral-400;
  }

  .gauge__pillar-track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .gauge__pillar-track-placeholder {
    @apply h-full w-full rounded-full bg-neutral-100;
  }

  .gauge__pillar-bar {
    @apply h-full rounded-full transition-all duration-700;
  }

  .gauge__pillar-bar--high {
    @apply bg-primary-500;
  }

  .gauge__pillar-bar--medium {
    @apply bg-warning-500;
  }

  .gauge__pillar-bar--low {
    @apply bg-danger-400;
  }
</style>
