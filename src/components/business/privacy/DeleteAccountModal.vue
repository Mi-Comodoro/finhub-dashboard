<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import {
    DELETION_CONFIRMATION_PHRASE,
    usePrivacyApplication
  } from '@/composables/application/usePrivacyApplication'
  import { usePrivacyPresenter } from '@/composables/presenters/usePrivacyPresenter'
  import { useAuth } from '@/composables/useAuth'

  import type { DeleteAccountModalProps } from './types/delete-account-modal.types'

  const props = defineProps<DeleteAccountModalProps>()
  const emit = defineEmits<(e: 'close' | 'download') => void>()

  const { deletion, requestDeletion, isLoading } = usePrivacyApplication()
  const { scheduledDateLabel } = usePrivacyPresenter()
  const { logout } = useAuth()

  const confirmation = ref('')
  const errorMessage = ref<string | null>(null)
  // Step 1: warnings + confirmation. Step 2: the request was registered.
  const requested = ref(false)

  const canConfirm = computed(
    () => confirmation.value.trim().toUpperCase() === DELETION_CONFIRMATION_PHRASE
  )

  watch(
    () => props.show,
    show => {
      if (show) {
        confirmation.value = ''
        errorMessage.value = null
        requested.value = false
      }
    }
  )

  const handleConfirm = async () => {
    if (!canConfirm.value) return
    errorMessage.value = null

    const { success, message } = await requestDeletion(confirmation.value.trim())
    if (success) {
      requested.value = true
      return
    }
    errorMessage.value = message ?? 'No se pudo programar la eliminación. Inténtalo de nuevo.'
  }

  // The server closed every session when the request was registered
  const handleDone = async () => {
    try {
      await logout()
    } catch {
      // The session is already invalid; leaving is all that matters
    }
    emit('close')
    await navigateTo('/')
  }
</script>

<template>
  <ModalWizard :show="show" :protect-unsaved="false" @update:show="!requested && emit('close')">
    <div class="delete-account">
      <template v-if="!requested">
        <CardInfo
          title="Eliminar mi cuenta"
          sub-title="Léelo con calma: tú decides y puedes arrepentirte durante 90 días"
          icon="delete_forever"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon-size="md"
          icon-variant="primary"
        />

        <p class="delete-account__lead">Esto es lo que pasará si continúas:</p>
        <ul class="delete-account__list">
          <li>
            Tu cuenta queda
            <strong>programada para eliminarse en 90 días.</strong>
            Hasta entonces tus datos siguen guardados.
          </li>
          <li>
            <strong>Cerramos tu sesión ahora.</strong>
            Si vuelves a entrar antes de esa fecha, puedes cancelar la eliminación.
          </li>
          <li>
            Pasado el plazo se borran
            <strong>de forma permanente</strong>
            tus cuentas, presupuestos, metas, movimientos, deudas, amistades y notificaciones. No se
            puede deshacer.
          </li>
          <li>
            Lo que compartiste con otras personas (por ejemplo, gastos de un grupo) se conserva sin
            tu nombre, para no cambiar sus cuentas.
          </li>
          <li>
            Las copias de seguridad pueden conservar tus datos un tiempo breve más, hasta que se
            renuevan.
          </li>
        </ul>

        <AlertBanner variant="info" title="¿Quieres conservar tu información?">
          Descarga tus datos antes de continuar.
          <button type="button" class="delete-account__link" @click="emit('download')">
            Descargar mis datos
          </button>
        </AlertBanner>

        <div class="delete-account__confirm">
          <Input
            id="delete-account-confirmation"
            v-model="confirmation"
            name="confirmation"
            :label="`Para confirmar, escribe ${DELETION_CONFIRMATION_PHRASE}`"
            placeholder="ELIMINAR MI CUENTA"
            autocomplete="off"
          />
        </div>

        <p v-if="errorMessage" class="delete-account__error" role="alert">{{ errorMessage }}</p>

        <div class="delete-account__actions">
          <Button variant="ghost" size="sm" @click="emit('close')">Mejor no</Button>
          <Button
            variant="danger"
            size="sm"
            icon="delete_forever"
            :disabled="!canConfirm || isLoading"
            :loading="isLoading"
            @click="handleConfirm"
          >
            Programar la eliminación
          </Button>
        </div>
      </template>

      <template v-else>
        <CardInfo
          title="Solicitud registrada"
          sub-title="Tu cuenta se eliminará de forma permanente en la fecha indicada"
          icon="event_available"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon-size="md"
          icon-variant="primary"
        />
        <AlertBanner variant="warning" title="Fecha de eliminación permanente">
          {{ scheduledDateLabel(deletion?.scheduledAt) }}
        </AlertBanner>
        <p class="delete-account__lead">
          Cerramos tu sesión. Si cambias de opinión, inicia sesión otra vez antes de esa fecha y
          cancela la eliminación desde Configuración o desde el aviso que verás arriba.
        </p>
        <div class="delete-account__actions">
          <Button variant="primary" size="sm" @click="handleDone">Entendido</Button>
        </div>
      </template>
    </div>
  </ModalWizard>
</template>

<style scoped lang="postcss">
  .delete-account {
    @apply flex flex-col gap-4;
  }

  .delete-account__lead {
    @apply text-sm leading-relaxed text-neutral-600;
    @apply dark:text-neutral-300;
  }

  .delete-account__list {
    @apply flex flex-col gap-2 pl-5;
  }

  .delete-account__list li {
    @apply list-disc text-sm leading-relaxed text-neutral-600;
    @apply dark:text-neutral-300;
  }

  .delete-account__link {
    @apply ml-1 font-semibold text-primary-700 underline underline-offset-2;
    @apply dark:text-primary-400;
  }

  .delete-account__confirm {
    @apply flex flex-col gap-1;
  }

  .delete-account__error {
    @apply text-xs font-medium text-danger-600;
    @apply dark:text-danger-400;
  }

  .delete-account__actions {
    @apply flex justify-end gap-2;
  }
</style>
