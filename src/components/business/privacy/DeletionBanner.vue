<script setup lang="ts">
  import { onMounted } from 'vue'

  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import { usePrivacyApplication } from '@/composables/application/usePrivacyApplication'
  import { usePrivacyPresenter } from '@/composables/presenters/usePrivacyPresenter'
  import { useFeedback } from '@/composables/useFeedBack'

  // Permanent notice at the top of the dashboard while the account is scheduled for deletion
  const { deletion, isDeletionRequested, isLoading, loadDeletionStatus, cancelDeletion } =
    usePrivacyApplication()
  const { scheduledDateLabel, daysLeftLabel } = usePrivacyPresenter()
  const { success: successToast, error: errorToast } = useFeedback()

  onMounted(() => {
    loadDeletionStatus()
  })

  const handleCancel = async () => {
    const { success, message } = await cancelDeletion()
    if (success) successToast('Eliminación cancelada', 'Tu cuenta sigue activa.')
    else errorToast('No se pudo cancelar', message ?? 'Inténtalo de nuevo en un momento.')
  }
</script>

<template>
  <AlertBanner
    v-if="isDeletionRequested"
    variant="warning"
    title="Tu cuenta está programada para eliminarse"
    class="deletion-banner"
    role="status"
  >
    <span>
      Se borrará de forma permanente el {{ scheduledDateLabel(deletion?.scheduledAt) }} ({{
        daysLeftLabel(deletion?.daysLeft)
      }}).
    </span>
    <Button
      variant="secondary"
      size="sm"
      class="deletion-banner__action"
      :loading="isLoading"
      :disabled="isLoading"
      @click="handleCancel"
    >
      Cancelar la eliminación
    </Button>
  </AlertBanner>
</template>

<style scoped lang="postcss">
  .deletion-banner {
    @apply mb-4;
  }

  .deletion-banner__action {
    @apply ml-3;
  }
</style>
