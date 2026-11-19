<script setup lang="ts">
  import { ref } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useLegalApplication } from '@/composables/application/useLegalApplication'

  import ConsentCheckbox from './ConsentCheckbox.vue'

  // Blocking notice for people who already have an account and must accept the current version of the
  // data policy. It only shows when the server says acceptance is mandatory and they have not accepted.
  const { needsAcceptance, policyVersion, loadConsentStatus, acceptPolicy } = useLegalApplication()

  const accepted = ref(false)
  const showInvalid = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)

  onMounted(() => {
    loadConsentStatus()
  })

  const handleAccept = async () => {
    if (!accepted.value) {
      showInvalid.value = true
      return
    }

    isSaving.value = true
    errorMessage.value = null
    const { success, message } = await acceptPolicy()
    isSaving.value = false

    if (!success) {
      errorMessage.value = message ?? 'No se pudo registrar tu autorización. Inténtalo de nuevo.'
    }
  }
</script>

<template>
  <ModalWizard :show="needsAcceptance" :protect-unsaved="false">
    <div class="policy-update">
      <CardInfo
        title="Actualizamos nuestra política de datos"
        sub-title="Para seguir usando Mi Comodoro necesitamos tu autorización"
        icon="shield"
        title-size="xl"
        weight="extrabold"
        level="h1"
        color="black"
        sub-title-size="xs"
        sub-title-color="muted"
        icon-size="md"
        icon-variant="primary"
      />

      <p class="policy-update__text">
        Publicamos una nueva versión de la Política de Tratamiento de Datos Personales: ahora
        detalla qué datos guardamos, con qué proveedores y cómo ejercer tus derechos. Léela y
        confirma tu autorización para continuar.
      </p>

      <ConsentCheckbox
        id="policy-update-consent"
        v-model="accepted"
        :policy-version="policyVersion"
        :invalid="showInvalid && !accepted"
      />

      <p v-if="errorMessage" class="policy-update__error" role="alert">{{ errorMessage }}</p>

      <div class="policy-update__actions">
        <Button
          variant="primary"
          size="sm"
          :loading="isSaving"
          :disabled="isSaving"
          @click="handleAccept"
        >
          Aceptar y continuar
        </Button>
      </div>
    </div>
  </ModalWizard>
</template>

<style scoped lang="postcss">
  .policy-update {
    @apply flex flex-col gap-4;
  }

  .policy-update__text {
    @apply text-sm leading-relaxed text-neutral-600;
    @apply dark:text-neutral-300;
  }

  .policy-update__error {
    @apply text-xs font-medium text-danger-600;
    @apply dark:text-danger-400;
  }

  .policy-update__actions {
    @apply flex justify-end;
  }
</style>
