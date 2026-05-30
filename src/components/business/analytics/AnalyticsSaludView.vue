<script setup lang="ts">
  import Card from '@/components/atoms/card/Card.vue'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useAnalyticsApplication } from '@/composables/application/useAnalyticsApplication'
  import { useTheme } from '@/composables/useTheme'

  const { healthScore, healthScorePending, healthScoreError } = useAnalyticsApplication()

  const { isDark } = useTheme()
  const svgScoreColor = computed(() => (isDark.value ? '#F1F5F9' : '#0F172A'))
  const svgRingBgColor = computed(() => (isDark.value ? '#334155' : '#E2E8F0'))

  const CIRCUMFERENCE = 2 * Math.PI * 50

  const scoreHexColor = computed(() => {
    const s = healthScore.value?.score.total ?? 0
    if (s < 20) return '#EF4444'
    if (s < 40) return '#F97316'
    if (s < 60) return '#F59E0B'
    if (s < 75) return '#A3E635'
    if (s < 90) return '#14B8A6'
    return '#22C55E'
  })

  const dashOffset = computed(() => {
    const s = Math.min(Math.max(healthScore.value?.score.total ?? 0, 0), 100)
    return CIRCUMFERENCE * (1 - s / 100)
  })

  const levelLabel = computed(() => healthScore.value?.score.label ?? 'Regular')

  const scoreLevelClass = computed(() => {
    const total = healthScore.value?.score.total ?? 0
    if (total < 20) return 'salud-score__level--danger'
    if (total < 40) return 'salud-score__level--orange'
    if (total < 60) return 'salud-score__level--warning'
    if (total < 75) return 'salud-score__level--lime'
    if (total < 90) return 'salud-score__level--primary'
    return 'salud-score__level--success'
  })

  const pillars = computed(() => [
    {
      label: 'Flujo de Caja',
      icon: 'account_balance',
      score: healthScore.value?.score.pillars.cashFlow.score ?? 0,
      max: 25,
      pillarLabel: healthScore.value?.score.pillars.cashFlow.label ?? '',
      tip: 'Mide si tus ingresos cubren tus gastos con margen libre.'
    },
    {
      label: 'Ahorro y Metas',
      icon: 'savings',
      score: healthScore.value?.score.pillars.savings.score ?? 0,
      max: 25,
      pillarLabel: healthScore.value?.score.pillars.savings.label ?? '',
      tip: 'Evalúa qué tanto estás ejecutando tu plan de ahorro.'
    },
    {
      label: 'Control de Gastos',
      icon: 'price_check',
      score: healthScore.value?.score.pillars.expenses.score ?? 0,
      max: 25,
      pillarLabel: healthScore.value?.score.pillars.expenses.label ?? '',
      tip: 'Compara tus gastos reales vs lo que planificaste.'
    },
    {
      label: 'Deudas',
      icon: 'credit_card',
      score: healthScore.value?.score.pillars.debt.score ?? 0,
      max: 25,
      pillarLabel: healthScore.value?.score.pillars.debt.label ?? '',
      tip: 'Analiza el impacto de tus deudas en tu salud financiera.'
    }
  ])

  function pillarBarClass(score: number, max: number): string {
    const pct = max > 0 ? (score / max) * 100 : 0
    if (pct >= 80) return 'pillar-bar--high'
    if (pct >= 40) return 'pillar-bar--medium'
    return 'pillar-bar--low'
  }

  const SCORE_LEVELS = [
    { range: '0–19', label: 'Crítico', color: '#EF4444' },
    { range: '20–39', label: 'Precario', color: '#F97316' },
    { range: '40–59', label: 'En riesgo', color: '#F59E0B' },
    { range: '60–74', label: 'Regular', color: '#A3E635' },
    { range: '75–89', label: 'Saludable', color: '#14B8A6' },
    { range: '90–100', label: 'Óptimo', color: '#22C55E' }
  ]

  const gaugeHint = computed(() => {
    const insight = healthScore.value?.score.insight
    if (!insight) return 'Registra ingresos y gastos para ver tu diagnóstico real.'
    return insight
  })

  const PILLAR_HINTS: Record<string, string> = {
    'Flujo de Caja': 'Lo que te queda después de cubrir tus gastos',
    'Ahorro y Metas': 'Si cumples tu meta de ahorro mensual',
    'Control de Gastos': 'Si gastas menos de lo que planificaste',
    Deudas: 'Según el peso de tus deudas sobre tus ingresos'
  }

  const PILLAR_IMPROVEMENTS: Record<string, string> = {
    'Flujo de Caja':
      'Registra todos tus ingresos y evita gastos no planificados para ampliar tu margen libre.',
    'Ahorro y Metas':
      'Abona a tus metas cada mes. Nota: este puntaje mide el cumplimiento de tu plan de ahorro del presupuesto, no el total de aportes a metas.',
    'Control de Gastos':
      'Revisa qué categorías superan el presupuesto y ajusta antes del cierre del período.',
    Deudas: 'Prioriza liquidar deudas con mayor tasa de interés y evita nueva deuda de consumo.'
  }

  const insightText = computed(() => {
    const total = healthScore.value?.score.total ?? 0
    const insight = healthScore.value?.score.insight
    if (total === 0 || !insight) return null
    return insight
  })
</script>

<template>
  <div class="salud-view">
    <!-- Loading state -->
    <div v-if="healthScorePending" class="salud-view__loading">
      <div class="salud-view__skeleton-score" />
      <div class="salud-view__skeleton-pillars">
        <div v-for="i in 4" :key="i" class="salud-view__skeleton-pillar" />
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="healthScoreError" class="analytics-view__empty">
      <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
      <p class="analytics-view__empty-title">No se pudo cargar la salud financiera</p>
      <p class="analytics-view__empty-description">Verifica tu conexión e intenta de nuevo</p>
    </div>

    <!-- Empty state: no active budget -->
    <div v-else-if="!healthScore" class="analytics-view__empty">
      <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
      <p class="analytics-view__empty-title">Información insuficiente</p>
      <p class="analytics-view__empty-description">
        Necesitas al menos un presupuesto activo para calcular tu salud financiera
      </p>
    </div>

    <!-- Empty state: budget active but no transactions recorded yet -->
    <div
      v-else-if="
        (healthScore.totals?.income ?? 0) === 0 &&
        (healthScore.totals?.expenses ?? 0) === 0 &&
        (healthScore.totals?.savings ?? 0) === 0
      "
      class="analytics-view__empty"
    >
      <EmptyStateIllustration type="no-transactions" class="analytics-view__empty-illustration" />
      <p class="analytics-view__empty-title">Sin datos aún</p>
      <p class="analytics-view__empty-description">
        Registra tu primer ingreso o gasto para ver tu salud financiera.
      </p>
    </div>

    <!-- Content -->
    <div v-else class="salud-view__content">
      <!-- Score card -->
      <Card class="salud-view__score-card">
        <div class="salud-view__score-inner">
          <div class="salud-view__gauge-wrapper">
            <svg viewBox="0 0 120 120" class="salud-view__gauge-svg" aria-hidden="true">
              <!-- Background ring -->
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                :stroke="svgRingBgColor"
                stroke-width="10"
              />
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
                :fill="svgScoreColor"
              >
                {{ healthScore.score.total }}
              </text>
              <!-- /100 label -->
              <text x="60" y="72" text-anchor="middle" font-size="11" fill="#94A3B8">/ 100</text>
            </svg>
            <div class="salud-view__level-label">
              <span class="salud-score__level" :class="scoreLevelClass">{{ levelLabel }}</span>
              <p class="salud-gauge__hint">{{ gaugeHint }}</p>
            </div>
          </div>

          <div class="salud-view__score-info">
            <Heading level="h2" size="xl" weight="bold">Salud Financiera</Heading>
            <Text size="sm" color="muted">
              Tu puntuación suma: 25 pts (flujo de caja) + 25 pts (ahorro) + 25 pts (gastos) + 25
              pts (deudas) = 100 pts máximo.
            </Text>
          </div>
        </div>

        <!-- Color scale legend -->
        <div class="salud-scale">
          <div v-for="lvl in SCORE_LEVELS" :key="lvl.label" class="salud-scale__item">
            <span class="salud-scale__dot" :style="{ background: lvl.color }" />
            <span class="salud-scale__label">{{ lvl.range }} · {{ lvl.label }}</span>
          </div>
        </div>
      </Card>

      <!-- Pillars grid -->
      <div class="salud-view__pillars">
        <Card v-for="pillar in pillars" :key="pillar.label" class="pillar-card">
          <div class="pillar-card__header">
            <div class="pillar-card__icon-wrapper">
              <span class="material-symbols-outlined pillar-card__icon">{{ pillar.icon }}</span>
            </div>
            <span class="pillar-card__label">{{ pillar.label }}</span>
            <span :title="pillar.tip" class="material-symbols-outlined pillar-card__info-icon">
              info
            </span>
          </div>

          <div class="pillar-card__score-row">
            <span class="pillar-card__score-value">{{ pillar.score }}</span>
            <span class="pillar-card__score-max">/ {{ pillar.max }} pts</span>
          </div>
          <p class="pillar-card__pillar-label">{{ pillar.pillarLabel }}</p>
          <p class="pillar-card__hint">{{ PILLAR_HINTS[pillar.label] }}</p>
          <div class="pillar-card__track">
            <div
              class="pillar-bar"
              :class="pillarBarClass(pillar.score, pillar.max)"
              :style="{ width: `${Math.min((pillar.score / pillar.max) * 100, 100)}%` }"
            />
          </div>
          <p v-if="pillar.score / pillar.max >= 0.8" class="pillar-card__ok-note">
            Sigue así, este pilar está en buen camino.
          </p>
          <p v-else class="pillar-card__improvement">
            {{ PILLAR_IMPROVEMENTS[pillar.label] }}
          </p>
        </Card>
      </div>

      <!-- Dynamic insight -->
      <div v-if="insightText" class="salud-insight">
        <span class="material-symbols-outlined salud-insight__icon">tips_and_updates</span>
        <Text size="sm" color="muted">{{ insightText }}</Text>
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
    @apply h-48 w-full animate-pulse rounded-xl bg-slate-100;
    @apply dark:bg-neutral-700;
  }

  .salud-view__skeleton-pillars {
    @apply grid grid-cols-2 gap-4 sm:grid-cols-4;
  }

  .salud-view__skeleton-pillar {
    @apply h-32 animate-pulse rounded-xl bg-slate-100;
    @apply dark:bg-neutral-700;
  }

  /* Empty */
  .analytics-view__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .analytics-view__empty-illustration {
    @apply mx-auto h-32 w-32;
  }

  .analytics-view__empty-title {
    @apply text-base font-semibold text-neutral-800;
    @apply dark:text-neutral-200;
  }

  .analytics-view__empty-description {
    @apply max-w-xs text-sm text-neutral-500;
    @apply dark:text-neutral-400;
  }

  /* Content */
  .salud-view__content {
    @apply flex flex-col gap-4;
  }

  /* Score card */
  .salud-view__score-card {
    @apply p-4 sm:p-6;
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
    @apply mt-2 flex flex-col items-center gap-1;
  }

  .salud-score__level {
    @apply text-base font-bold;
  }

  .salud-gauge__hint {
    @apply max-w-[140px] text-center text-[11px] leading-tight text-neutral-500;
  }

  .salud-score__level--danger {
    @apply text-danger-600 dark:text-danger-400;
  }

  .salud-score__level--orange {
    color: #f97316;
  }

  .salud-score__level--warning {
    @apply text-warning-600 dark:text-warning-400;
  }

  .salud-score__level--lime {
    color: #84cc16;
  }

  .salud-score__level--primary {
    @apply text-primary-600 dark:text-primary-400;
  }

  .salud-score__level--success {
    @apply text-success-600 dark:text-success-400;
  }

  .salud-view__score-info {
    @apply flex flex-col gap-2;
  }

  /* Pillars grid */
  .salud-view__pillars {
    @apply grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4;
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
    @apply dark:bg-primary-900/20;
  }

  .pillar-card__icon {
    @apply text-base leading-none text-primary-600;
  }

  .pillar-card__label {
    @apply flex-1 text-sm font-semibold text-neutral-700;
    @apply dark:text-neutral-200;
  }

  .pillar-card__info-icon {
    @apply cursor-help text-base leading-none text-neutral-400;
  }

  .pillar-card__score-row {
    @apply flex items-baseline gap-1;
  }

  .pillar-card__score-value {
    @apply text-2xl font-bold text-neutral-800;
    @apply dark:text-neutral-100;
  }

  .pillar-card__score-max {
    @apply text-sm text-neutral-400;
  }

  .pillar-card__pillar-label {
    @apply text-xs font-medium text-neutral-600 dark:text-neutral-400;
  }

  .pillar-card__hint {
    @apply text-xs leading-tight text-neutral-500;
  }

  .pillar-card__track {
    @apply h-2 overflow-hidden rounded-full bg-neutral-100;
    @apply dark:bg-neutral-700;
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

  .pillar-card__improvement {
    @apply text-[11px] leading-snug text-neutral-500 dark:text-neutral-400;
  }

  .pillar-card__ok-note {
    @apply text-[11px] font-medium text-success-600 dark:text-success-400;
  }

  .salud-scale {
    @apply mt-3 hidden flex-wrap gap-x-4 gap-y-1 sm:flex;
  }

  .salud-scale__item {
    @apply flex items-center gap-1.5;
  }

  .salud-scale__dot {
    @apply h-2.5 w-2.5 shrink-0 rounded-full;
  }

  .salud-scale__label {
    @apply text-xs text-neutral-500 dark:text-neutral-400;
  }

  .salud-insight {
    @apply flex items-start gap-2 rounded-lg bg-neutral-50 p-3;
    @apply dark:bg-neutral-800;
  }

  .salud-insight__icon {
    @apply shrink-0 text-base leading-none text-neutral-400;
  }
</style>
