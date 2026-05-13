<script setup lang="ts">
  import { Card, Heading, Text } from '@/components/atoms'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import { useAnalyticsApplication } from '@/composables/application/useAnalyticsApplication'

  const { healthScore, healthScorePending } = useAnalyticsApplication()

  const CIRCUMFERENCE = 2 * Math.PI * 50

  const scoreHexColor = computed(() => {
    const s = healthScore.value?.totalScore ?? 0
    if (s < 40) return '#EF4444'
    if (s < 70) return '#F59E0B'
    if (s >= 100) return '#22C55E'
    return '#14B8A6'
  })

  const dashOffset = computed(() => {
    const s = Math.min(Math.max(healthScore.value?.totalScore ?? 0, 0), 100)
    return CIRCUMFERENCE * (1 - s / 100)
  })

  const levelLabel = computed(() => {
    const labels: Record<string, string> = {
      critical: 'Crítico',
      at_risk: 'En riesgo',
      regular: 'Regular',
      healthy: 'Saludable',
      optimal: 'Óptimo',
    }
    return labels[healthScore.value?.level ?? 'regular'] ?? 'Regular'
  })

  const scoreLevelClass = computed(() => {
    const level = healthScore.value?.level ?? 'regular'
    if (level === 'critical') return 'salud-score__level--danger'
    if (level === 'at_risk' || level === 'regular') return 'salud-score__level--warning'
    if (level === 'optimal') return 'salud-score__level--success'
    return 'salud-score__level--primary'
  })

  const pillars = computed(() => [
    {
      label: 'Flujo de Caja',
      icon: 'i-material-symbols-account-balance',
      score: healthScore.value?.cashFlowScore ?? 0,
      max: 25,
      tip: 'Mide si tus ingresos cubren tus gastos con margen libre.',
      isNeutral: false,
    },
    {
      label: 'Ahorro y Metas',
      icon: 'i-material-symbols-savings',
      score: healthScore.value?.savingsScore ?? 0,
      max: 35,
      tip: 'Evalúa qué tanto estás ejecutando tu plan de ahorro.',
      isNeutral: false,
    },
    {
      label: 'Control de Gastos',
      icon: 'i-material-symbols-price-check',
      score: healthScore.value?.expenseScore ?? 0,
      max: 20,
      tip: 'Compara tus gastos reales vs lo que planificaste.',
      isNeutral: false,
    },
    {
      label: 'Deudas',
      icon: 'i-material-symbols-credit-card',
      score: healthScore.value?.debtScore ?? 0,
      max: 20,
      tip: 'Analiza el impacto de tus deudas en tu salud financiera.',
      isNeutral: healthScore.value?.debtScore === 10,
    },
  ])

  function pillarBarClass(score: number, max: number): string {
    const pct = max > 0 ? (score / max) * 100 : 0
    if (pct >= 80) return 'pillar-bar--high'
    if (pct >= 40) return 'pillar-bar--medium'
    return 'pillar-bar--low'
  }
</script>

<template>
  <div class="salud-view">
    <!-- Loading state -->
    <div v-if="healthScorePending" class="salud-view__loading">
      <USkeleton class="salud-view__skeleton-score" />
      <div class="salud-view__skeleton-pillars">
        <USkeleton v-for="i in 4" :key="i" class="salud-view__skeleton-pillar" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!healthScore" class="salud-view__empty">
      <EmptyStateIllustration type="help" class="salud-view__empty-illustration" />
      <Heading level="h3" size="lg" weight="semibold">Sin datos suficientes</Heading>
      <Text size="sm" color="muted">
        Registra ingresos, gastos y metas para calcular tu salud financiera.
      </Text>
    </div>

    <!-- Content -->
    <div v-else class="salud-view__content">
      <!-- Score card -->
      <Card class="salud-view__score-card">
        <div class="salud-view__score-inner">
          <div class="salud-view__gauge-wrapper">
            <svg viewBox="0 0 120 120" class="salud-view__gauge-svg" aria-hidden="true">
              <!-- Background ring -->
              <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" stroke-width="10" />
              <!-- Progress ring -->
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                :stroke="scoreHexColor"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="CIRCUMFERENCE"
                :stroke-dashoffset="dashOffset"
                transform="rotate(-90 60 60)"
              />
              <!-- Score number -->
              <text
                x="60"
                y="55"
                text-anchor="middle"
                font-size="30"
                font-weight="800"
                fill="#0F172A"
              >
                {{ healthScore.totalScore }}
              </text>
              <!-- /100 label -->
              <text x="60" y="72" text-anchor="middle" font-size="11" fill="#94A3B8">
                / 100
              </text>
            </svg>
            <div class="salud-view__level-label">
              <span class="salud-score__level" :class="scoreLevelClass">{{ levelLabel }}</span>
            </div>
          </div>

          <div class="salud-view__score-info">
            <Heading level="h2" size="xl" weight="bold">Salud Financiera</Heading>
            <Text size="sm" color="muted">
              Tu puntuación combina flujo de caja, ahorro, control de gastos y gestión de deudas.
            </Text>
          </div>
        </div>
      </Card>

      <!-- Pillars grid -->
      <div class="salud-view__pillars">
        <Card v-for="pillar in pillars" :key="pillar.label" class="pillar-card">
          <div class="pillar-card__header">
            <div class="pillar-card__icon-wrapper">
              <UIcon :name="pillar.icon" class="pillar-card__icon" />
            </div>
            <span class="pillar-card__label">{{ pillar.label }}</span>
            <UTooltip :text="pillar.tip">
              <UIcon name="i-material-symbols-info-outline" class="pillar-card__info-icon" />
            </UTooltip>
          </div>

          <template v-if="pillar.isNeutral">
            <div class="pillar-card__neutral">
              <UBadge color="neutral" variant="soft" size="xs">en planificación</UBadge>
              <Text size="xs" color="muted">Los datos de deudas estarán disponibles pronto.</Text>
            </div>
          </template>

          <template v-else>
            <div class="pillar-card__score-row">
              <span class="pillar-card__score-value">{{ pillar.score }}</span>
              <span class="pillar-card__score-max">/ {{ pillar.max }} pts</span>
            </div>
            <div class="pillar-card__track">
              <div
                class="pillar-bar"
                :class="pillarBarClass(pillar.score, pillar.max)"
                :style="{ width: `${Math.min((pillar.score / pillar.max) * 100, 100)}%` }"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .salud-view {
    @apply flex flex-col gap-4;
  }

  /* Loading */
  .salud-view__loading {
    @apply flex flex-col gap-4;
  }

  .salud-view__skeleton-score {
    @apply h-48 w-full rounded-xl;
  }

  .salud-view__skeleton-pillars {
    @apply grid grid-cols-2 gap-4 sm:grid-cols-4;
  }

  .salud-view__skeleton-pillar {
    @apply h-32 rounded-xl;
  }

  /* Empty */
  .salud-view__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .salud-view__empty-illustration {
    @apply h-32 w-32;
  }

  /* Content */
  .salud-view__content {
    @apply flex flex-col gap-4;
  }

  /* Score card */
  .salud-view__score-card {
    @apply p-6;
  }

  .salud-view__score-inner {
    @apply flex flex-col items-center gap-6 sm:flex-row;
  }

  .salud-view__gauge-wrapper {
    @apply flex shrink-0 flex-col items-center;
  }

  .salud-view__gauge-svg {
    @apply h-40 w-40;
  }

  .salud-view__level-label {
    @apply mt-2;
  }

  .salud-score__level {
    @apply text-base font-bold;
  }

  .salud-score__level--danger {
    @apply text-danger-600;
  }

  .salud-score__level--warning {
    @apply text-warning-600;
  }

  .salud-score__level--primary {
    @apply text-primary-600;
  }

  .salud-score__level--success {
    @apply text-success-600;
  }

  .salud-view__score-info {
    @apply flex flex-col gap-2;
  }

  /* Pillars grid */
  .salud-view__pillars {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4;
  }

  /* Pillar card */
  .pillar-card {
    @apply flex flex-col gap-3 p-4;
  }

  .pillar-card__header {
    @apply flex items-center gap-2;
  }

  .pillar-card__icon-wrapper {
    @apply flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50;
  }

  .pillar-card__icon {
    @apply h-4 w-4 text-primary-600;
  }

  .pillar-card__label {
    @apply flex-1 text-sm font-semibold text-neutral-700;
  }

  .pillar-card__info-icon {
    @apply h-4 w-4 cursor-help text-neutral-400;
  }

  .pillar-card__score-row {
    @apply flex items-baseline gap-1;
  }

  .pillar-card__score-value {
    @apply text-2xl font-bold text-neutral-800;
  }

  .pillar-card__score-max {
    @apply text-sm text-neutral-400;
  }

  .pillar-card__track {
    @apply h-2 overflow-hidden rounded-full bg-neutral-100;
  }

  .pillar-bar {
    @apply h-full rounded-full transition-all duration-700;
  }

  .pillar-bar--high {
    @apply bg-primary-500;
  }

  .pillar-bar--medium {
    @apply bg-warning-500;
  }

  .pillar-bar--low {
    @apply bg-danger-400;
  }

  .pillar-card__neutral {
    @apply flex flex-col gap-2;
  }
</style>
