<script setup lang="ts">
  /**
   * AccountInfoSection Component
   * Molecule-level component for displaying account information and subscription details
   */

  import { Badge, Button, Card, Heading, Label } from '@/components/atoms'
  import { ProgressBar } from '@/components/molecules'

  import IconChip from '../icon-chip/IconChip.vue'
  import type { AccountInfoSectionProps } from './types/account-info-section.types'

  withDefaults(defineProps<AccountInfoSectionProps>(), {
    accountInfo: () => ({
      accountType: 'Pro Trial',
      status: 'Activa',
      expirationDate: '15 Oct, 2024',
      progress: 70,
      progressText: 'Obtén el Pro Trial de tu suscripción de prueba',
      isPromo: true
    }),
    showManageButton: true
  })

  const emit = defineEmits(['manageSubscription'])

  const onManageSubscription = () => {
    emit('manageSubscription')
  }
</script>

<template>
  <Card variant="elevated" class-name="account-info-section">
    <div class="account-info-section__header">
      <div class="account-info-section__header-main">
        <IconChip icon="security" container-class="bg-purple-100 text-purple-600" />
        <Heading level="h2" size="lg" weight="semibold" class-name="account-info-section__title">
          Estado de la Cuenta
        </Heading>
      </div>
      <Button
        v-if="showManageButton"
        variant="ghost"
        size="sm"
        icon="settings"
        @click="onManageSubscription"
      >
        Gestionar Suscripción
      </Button>
    </div>

    <div class="account-info-section__content">
      <div class="account-info-section__details-grid">
        <div class="account-info-section__field">
          <Label variant="form" size="sm" class-name="account-info-section__field-label">
            TIPO DE CUENTA
          </Label>
          <div class="account-info-section__field-value">
            <Badge class="account-info-section__badge" variant="warning">
              {{ accountInfo.accountType }}
            </Badge>
          </div>
        </div>
        <div class="account-info-section__field account-info-section__field--status">
          <Label variant="form" size="sm" class-name="account-info-section__field-label">
            ESTADO
          </Label>
          <StatusIndicator
            class="uppercase"
            size="lg"
            :status="accountInfo.status === 'active' ? 'default' : 'inactive'"
          >
            {{ accountInfo.status }}
          </StatusIndicator>
        </div>
        <div class="account-info-section__field">
          <Label variant="form" size="sm" class-name="account-info-section__field-label">
            VENCIMIENTO
          </Label>
          <p class="account-info-section__expiration">
            <span class="">
              <Icon name="event" class="mr-1 text-secondary-500" size="md" />
            </span>
            {{ accountInfo.expirationDate }}
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="account-info-section__progress">
        <ProgressBar :progress="accountInfo.progress" variant="primary" size="md" title="Tiempo" />
        <p class="account-info-section__progress-text">{{ accountInfo.progressText }}</p>
      </div>
    </div>
  </Card>
</template>

<style lang="postcss" scoped>
  .account-info-section__header {
    @apply flex items-center justify-between border-b border-gray-100 p-6;
  }

  .account-info-section__header-main {
    @apply flex items-center gap-2;
  }

  .account-info-section__title {
    @apply text-gray-900;
  }

  .account-info-section__content {
    @apply space-y-6 p-6;
  }

  .account-info-section__details-grid {
    @apply grid grid-cols-1 gap-6 md:grid-cols-3;
  }

  .account-info-section__field {
    @apply space-y-1;
  }

  .account-info-section__field-label {
    @apply text-sm font-bold text-gray-500;
  }

  .account-info-section__field-value {
    @apply flex items-center gap-2;
  }

  .account-info-section__field--status {
    @apply flex w-fit flex-col gap-2;
  }

  .account-info-section__badge {
    @apply text-xs font-bold;
  }

  .account-info-section__badge--status {
    @apply uppercase;
  }

  .account-info-section__expiration {
    @apply flex items-center gap-1 font-bold text-gray-900;
  }

  .account-info-section__progress {
    @apply space-y-3;
  }

  .account-info-section__progress-text {
    @apply text-sm text-gray-900;
  }
</style>
