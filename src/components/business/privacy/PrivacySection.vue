<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { usePrivacyApplication } from '@/composables/application/usePrivacyApplication'
  import { usePrivacyPresenter } from '@/composables/presenters/usePrivacyPresenter'
  import { useFeedback } from '@/composables/useFeedBack'

  import DeleteAccountModal from './DeleteAccountModal.vue'

  const {
    deletion,
    isDeletionRequested,
    isLoading,
    loadDeletionStatus,
    exportMyData,
    cancelDeletion
  } = usePrivacyApplication()
  const { scheduledDateLabel, daysLeftLabel } = usePrivacyPresenter()
  const { success: successToast, error: errorToast } = useFeedback()

  const showDeleteModal = ref(false)
  const isDownloading = ref(false)

  onMounted(() => {
    loadDeletionStatus()
  })

  // Hands the file to the browser; the content was built by the application layer
  const handleDownload = async () => {
    isDownloading.value = true
    const { success, message, fileName, content } = await exportMyData()
    isDownloading.value = false

    if (!success) {
      errorToast('No se pudo descargar', message ?? 'Inténtalo de nuevo en un momento.')
      return
    }

    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    successToast(
      'Datos descargados',
      'Guarda el archivo en un lugar seguro: contiene tu información.'
    )
  }

  const handleCancel = async () => {
    const { success, message } = await cancelDeletion()
    if (success) {
      successToast('Eliminación cancelada', 'Tu cuenta sigue activa.')
    } else {
      errorToast('No se pudo cancelar', message ?? 'Inténtalo de nuevo en un momento.')
    }
  }
</script>

<template>
  <div class="privacy-section">
    <div class="privacy-section__header">
      <span class="material-symbols-outlined privacy-section__icon">shield_person</span>
      <div>
        <Heading level="h2" size="lg" weight="bold">Privacidad y datos</Heading>
        <Text size="xs" color="muted">
          Tus datos son tuyos: descárgalos o elimínalos cuando quieras
        </Text>
      </div>
    </div>

    <div class="privacy-section__body">
      <!-- Right of access -->
      <div class="privacy-section__row">
        <div>
          <Text size="sm" weight="semibold">Descargar mis datos</Text>
          <Text size="xs" color="muted">
            Un archivo con todo lo que Mi Comodoro guarda sobre ti: perfil, cuentas, presupuestos,
            metas, movimientos, deudas y grupos. No incluye tu contraseña.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon="download"
          :loading="isDownloading"
          :disabled="isDownloading"
          @click="handleDownload"
        >
          Descargar
        </Button>
      </div>

      <!-- Right of erasure -->
      <div class="privacy-section__row privacy-section__row--danger">
        <div>
          <Text size="sm" weight="semibold">Eliminar mi cuenta</Text>
          <Text size="xs" color="muted">
            Tus datos se borran de forma permanente. Los conservamos hasta 90 días por si cambias de
            opinión.
          </Text>
        </div>
        <Button
          v-if="!isDeletionRequested"
          variant="danger"
          size="sm"
          icon="delete_forever"
          @click="showDeleteModal = true"
        >
          Eliminar mi cuenta
        </Button>
      </div>

      <AlertBanner
        v-if="isDeletionRequested"
        variant="warning"
        title="Tu cuenta está programada para eliminarse"
      >
        Se borrará de forma permanente el {{ scheduledDateLabel(deletion?.scheduledAt) }} ({{
          daysLeftLabel(deletion?.daysLeft)
        }}).
        <Button
          variant="secondary"
          size="sm"
          class="privacy-section__cancel"
          :loading="isLoading"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Cancelar la eliminación
        </Button>
      </AlertBanner>

      <Text size="xs" color="muted">
        Más información en la
        <NuxtLink to="/privacy" target="_blank" class="privacy-section__link">
          Política de Tratamiento de Datos
        </NuxtLink>
        .
      </Text>
    </div>

    <DeleteAccountModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      @download="handleDownload"
    />
  </div>
</template>

<style scoped lang="postcss">
  .privacy-section {
    @apply mt-6 rounded-xl border border-neutral-200 bg-white;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .privacy-section__header {
    @apply flex items-center gap-3 border-b border-neutral-200 px-6 py-4;
    @apply dark:border-neutral-700;
  }

  .privacy-section__icon {
    @apply shrink-0 text-xl text-primary-600;
  }

  .privacy-section__body {
    @apply flex flex-col gap-4 px-6 py-5;
  }

  .privacy-section__row {
    @apply flex flex-col items-start justify-between gap-3 rounded-lg border border-neutral-200 p-4;
    @apply sm:flex-row sm:items-center;
    @apply dark:border-neutral-700;
  }

  .privacy-section__row--danger {
    @apply border-danger-200 bg-danger-50;
    @apply dark:border-danger-800 dark:bg-danger-900/20;
  }

  .privacy-section__cancel {
    @apply mt-2;
  }

  .privacy-section__link {
    @apply text-primary-600 underline underline-offset-2;
    @apply hover:text-primary-700;
    @apply dark:text-primary-400;
  }
</style>
