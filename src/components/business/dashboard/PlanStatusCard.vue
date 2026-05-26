<script setup lang="ts">
  import { computed, ref } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import PlanUpgradeModal from '@/components/business/dashboard/PlanUpgradeModal.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import { useAuthStore } from '@/stores/auth.store'

  const authStore = useAuthStore()
  const showModal = ref(false)
  const { user } = useProfileApplication()

  const TRIAL_DAYS = 45

  const accountType = computed(() => authStore.accountType)
  const trialEndsAt = computed(() => user.value?.trialEndsAt ?? null)

  const daysRemaining = computed(() => {
    if (!trialEndsAt.value) return 0
    const diff = new Date(trialEndsAt.value).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const trialProgress = computed(() => {
    const used = TRIAL_DAYS - daysRemaining.value
    return Math.min(100, Math.max(0, Math.round((used / TRIAL_DAYS) * 100)))
  })

  const trialIsUrgent = computed(() => daysRemaining.value <= 7)

  const planLabel = computed(() => {
    switch (accountType.value) {
      case 'TRIAL':
        return 'Pro Trial'
      case 'PLUS':
        return 'Plus'
      case 'PRO':
        return 'Pro'
      case 'PARTNER':
        return 'Partner'
      default:
        return 'Gratis'
    }
  })

  const planVariant = computed(() => {
    switch (accountType.value) {
      case 'TRIAL':
        return trialIsUrgent.value ? 'danger' : 'warning'
      case 'PLUS':
        return 'secondary'
      case 'PRO':
        return 'primary'
      case 'PARTNER':
        return 'success'
      default:
        return 'default'
    }
  })

  const isTrial = computed(() => accountType.value === 'TRIAL')
  const isFree = computed(() => accountType.value === 'FREE' || !accountType.value)
  const showUpgrade = computed(() => isTrial.value || isFree.value)

  const iconVariant = computed(() => {
    if (isTrial.value) return trialIsUrgent.value ? 'danger' : 'warning'
    if (isFree.value) return 'neutral'
    return 'primary'
  })
</script>

<template>
  <div class="plan-status-card">
    <div class="plan-status-card__header">
      <CardInfo
        title="Mi cuenta"
        sub-title="Plan y suscripción"
        title-size="base"
        weight="extrabold"
        level="h3"
        color="black"
        sub-title-size="xs"
        sub-title-color="muted"
        icon="workspace_premium"
        :icon-variant="iconVariant"
        icon-size="md"
      />
      <Badge :variant="planVariant" size="xs">{{ planLabel }}</Badge>
    </div>

    <!-- Trial: días restantes + barra de progreso -->
    <template v-if="isTrial">
      <div class="plan-status-card__trial">
        <div class="plan-status-card__trial-row">
          <Text size="xs" color="muted">Tiempo restante</Text>
          <span
            class="plan-status-card__days"
            :class="trialIsUrgent ? 'plan-status-card__days--urgent' : 'plan-status-card__days--ok'"
          >
            {{ daysRemaining }}d
          </span>
        </div>
        <div class="plan-status-card__track">
          <div
            class="plan-status-card__fill"
            :class="trialIsUrgent ? 'plan-status-card__fill--urgent' : 'plan-status-card__fill--ok'"
            :style="{ width: `${trialProgress}%` }"
          />
        </div>
        <Text v-if="trialIsUrgent" size="xs" class="plan-status-card__urgent-label">
          Tu período de prueba está por vencer
        </Text>
      </div>
    </template>

    <!-- Free: mensaje de upgrade -->
    <template v-else-if="isFree">
      <Text size="xs" color="muted">Desbloquea todas las funcionalidades con un plan de pago.</Text>
    </template>

    <button class="plan-status-card__link" @click="showModal = true">
      <span>{{ showUpgrade ? 'Mejorar plan' : 'Gestionar suscripción' }}</span>
      <span class="material-symbols-outlined plan-status-card__link-icon">arrow_forward</span>
    </button>

    <ModalWizard :show="showModal">
      <PlanUpgradeModal @close="showModal = false" />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .plan-status-card {
    @apply flex flex-col gap-3 rounded-lg border border-neutral-100 bg-white p-4;
  }

  .plan-status-card__header {
    @apply flex items-start justify-between gap-2;
  }

  /* Trial */
  .plan-status-card__trial {
    @apply flex flex-col gap-1.5;
  }

  .plan-status-card__trial-row {
    @apply flex items-center justify-between;
  }

  .plan-status-card__days {
    @apply text-xs font-bold;
  }

  .plan-status-card__days--ok {
    @apply text-warning-600;
  }

  .plan-status-card__days--urgent {
    @apply text-danger-600;
  }

  .plan-status-card__track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .plan-status-card__fill {
    @apply h-full rounded-full transition-all duration-700;
  }

  .plan-status-card__fill--ok {
    @apply bg-warning-400;
  }

  .plan-status-card__fill--urgent {
    @apply bg-danger-500;
  }

  .plan-status-card__urgent-label {
    @apply text-danger-600;
  }

  /* Link */
  .plan-status-card__link {
    @apply flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-800;
  }

  .plan-status-card__link-icon {
    @apply text-sm;
  }
</style>
