<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'

  import { Badge, Button, Text } from '@/components/atoms'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import { usePlansApplication } from '@/composables/application/usePlansApplication'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import { useAuthStore } from '@/stores/auth.store'
  import type { PlanData } from '@/types/api'
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'

  const emit = defineEmits<{ close: [] }>()

  const authStore = useAuthStore()
  const { user } = useProfileApplication()
  const { fetchPublicPlans, publicPlans } = usePlansApplication()

  const accountType = computed(() => authStore.accountType)
  const trialEndsAt = computed(() => user.value?.trialEndsAt ?? null)

  const daysRemaining = computed(() => {
    if (!trialEndsAt.value) return 0
    const diff = new Date(trialEndsAt.value).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const trialIsUrgent = computed(() => daysRemaining.value <= 7)
  const isTrial = computed(() => accountType.value === 'TRIAL')

  const PLAN_ORDER: Record<string, number> = { free: 0, plus: 1, pro: 2 }

  const sortedPlans = computed(() =>
    [...publicPlans.value].sort((a, b) => {
      const aIdx = PLAN_ORDER[a.name.toLowerCase()] ?? 99
      const bIdx = PLAN_ORDER[b.name.toLowerCase()] ?? 99
      return aIdx - bIdx
    })
  )

  const activePlanName = computed(() => {
    switch (accountType.value) {
      case 'TRIAL':
      case 'PRO':
        return 'pro'
      case 'PLUS':
        return 'plus'
      default:
        return 'free'
    }
  })

  const isActivePlan = (plan: PlanData) => plan.name.toLowerCase() === activePlanName.value

  const planPrice = (plan: PlanData) =>
    plan.price === 0 ? 'Gratis' : formatCurrency(plan.price, plan.currency as Currency)

  const badgeVariant = (plan: PlanData): string => {
    switch (plan.name.toLowerCase()) {
      case 'plus':
        return 'secondary'
      case 'pro':
        return 'primary'
      default:
        return 'default'
    }
  }

  const selectedPlanId = ref<string | null>(null)

  const selectedPlan = computed(
    () => sortedPlans.value.find(p => p.id === selectedPlanId.value) ?? null
  )

  const selectPlan = (plan: PlanData) => {
    if (isActivePlan(plan)) return
    selectedPlanId.value = selectedPlanId.value === plan.id ? null : plan.id
  }

  onMounted(fetchPublicPlans)
</script>

<template>
  <div class="plan-modal">
    <!-- Header -->
    <CardInfo
      title="Planes disponibles"
      sub-title="Elige el plan que mejor se adapte a tus necesidades"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="xs"
      sub-title-color="muted"
      icon="workspace_premium"
      icon-variant="warning"
      icon-size="md"
    />

    <!-- Trial banner -->
    <div
      v-if="isTrial"
      class="plan-modal__trial-banner"
      :class="trialIsUrgent ? 'plan-modal__trial-banner--urgent' : ''"
    >
      <span class="material-symbols-outlined plan-modal__trial-icon">schedule</span>
      <Text size="xs">
        <template v-if="trialIsUrgent">
          Tu prueba vence en
          <strong>{{ daysRemaining }} días</strong>
          . Actualiza para no perder el acceso.
        </template>
        <template v-else>
          Estás en período de prueba — te quedan
          <strong>{{ daysRemaining }} días</strong>
          .
        </template>
      </Text>
    </div>

    <!-- Skeleton -->
    <div v-if="!publicPlans.length" class="plan-modal__cards">
      <div v-for="i in 3" :key="i" class="plan-modal__card plan-modal__card--skeleton" />
    </div>

    <!-- Plan cards -->
    <div v-else class="plan-modal__cards">
      <div
        v-for="plan in sortedPlans"
        :key="plan.id"
        class="plan-modal__card"
        :class="{
          'plan-modal__card--active': isActivePlan(plan),
          'plan-modal__card--selected': selectedPlanId === plan.id,
          'plan-modal__card--selectable': !isActivePlan(plan)
        }"
        @click="selectPlan(plan)"
      >
        <div class="plan-modal__card-header">
          <Text size="sm" weight="semibold">{{ plan.name }}</Text>
          <Badge v-if="isActivePlan(plan)" :variant="badgeVariant(plan)" size="xs">Tu plan</Badge>
          <span
            v-else-if="selectedPlanId === plan.id"
            class="material-symbols-outlined plan-modal__card-check"
          >
            check_circle
          </span>
        </div>

        <div class="plan-modal__price">
          <span class="plan-modal__price-value">{{ planPrice(plan) }}</span>
          <Text v-if="plan.price > 0" size="xs" color="muted">/mes</Text>
        </div>

        <ul class="plan-modal__features">
          <li v-for="feature in plan.features" :key="feature" class="plan-modal__feature">
            <span class="material-symbols-outlined plan-modal__feature-icon">check_circle</span>
            <Text size="xs">{{ feature }}</Text>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="plan-modal__footer">
      <Button variant="primary" size="sm" icon="workspace_premium" :disabled="!selectedPlan">
        {{ selectedPlan ? `Cambiar a ${selectedPlan.name}` : 'Selecciona un plan' }}
      </Button>
      <Button variant="ghost" size="sm" @click="emit('close')">Cancelar</Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .plan-modal {
    @apply flex flex-col gap-6;
  }

  /* Trial banner */
  .plan-modal__trial-banner {
    @apply flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2;
  }

  .plan-modal__trial-banner--urgent {
    @apply border-danger-200 bg-danger-50;
  }

  .plan-modal__trial-icon {
    @apply shrink-0 text-base text-warning-500;
  }

  .plan-modal__trial-banner--urgent .plan-modal__trial-icon {
    @apply text-danger-500;
  }

  /* Cards */
  .plan-modal__cards {
    @apply grid gap-3;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .plan-modal__card {
    @apply flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 transition-all duration-150;
  }

  .plan-modal__card--selectable {
    @apply cursor-pointer hover:border-primary-300 hover:bg-primary-50/40;
  }

  .plan-modal__card--active {
    @apply border-primary-200 bg-primary-50;
  }

  .plan-modal__card--selected {
    @apply border-primary-500 bg-primary-50 ring-2 ring-primary-300 ring-offset-1;
  }

  .plan-modal__card--skeleton {
    @apply h-48 animate-pulse rounded-xl bg-slate-100;
  }

  .plan-modal__card-header {
    @apply flex items-center justify-between gap-2;
  }

  .plan-modal__card-check {
    @apply text-base text-primary-600;
  }

  .plan-modal__price {
    @apply flex items-baseline gap-1;
  }

  .plan-modal__price-value {
    @apply text-2xl font-extrabold text-neutral-900;
  }

  .plan-modal__features {
    @apply flex flex-col gap-1.5;
  }

  .plan-modal__feature {
    @apply flex items-start gap-1.5;
  }

  .plan-modal__feature-icon {
    @apply shrink-0 text-base leading-none text-success-500;
  }

  /* Footer */
  .plan-modal__footer {
    @apply flex items-center gap-3 border-t border-neutral-100 pt-2;
  }
</style>
