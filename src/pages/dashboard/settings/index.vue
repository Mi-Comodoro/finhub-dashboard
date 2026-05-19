<script setup lang="ts">
  import { useAuth } from '@/composables/useAuth'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import { useSettingsApplication } from '@/composables/application/useSettingsApplication'
  import { useFeedback } from '@/composables/useFeedback'

  definePageMeta({
    layout: 'dashboard',
    title: 'Configuración',
    breadcrumb: 'Configuración'
  })

  const { settings, isLoading, fetchSettings, updateSettings, updateBudgetDefaults } =
    useSettingsApplication()

  const { user, avatarUrl, avatarInitials, updatePersonalInfo } = useProfileApplication()

  const { logout } = useAuth()
  const { success: successToast } = useFeedback()

  // [1] Perfil form state
  const displayNameForm = ref('')

  watch(
    () => user.value?.displayName,
    val => {
      if (val) displayNameForm.value = val
    },
    { immediate: true }
  )

  const handleSaveProfile = async () => {
    const { success } = await updatePersonalInfo({ displayName: displayNameForm.value })
    if (success) successToast('Perfil actualizado', 'Tu nombre fue guardado correctamente.')
  }

  // [2] Cuenta form state
  const currencyForm = ref('COP')
  const languageForm = ref('es')
  const savingsPercentageForm = ref(20)

  const currencyOptions = [
    { label: 'COP - Peso Colombiano', value: 'COP' },
    { label: 'USD - Dólar Estadounidense', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' }
  ]

  const languageOptions = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' }
  ]

  watch(
    () => settings.value,
    val => {
      if (!val) return
      currencyForm.value = val.currency
      languageForm.value = val.language
      savingsPercentageForm.value = val.savingsPercentage
    },
    { immediate: true, deep: true }
  )

  const handleSaveCuenta = async () => {
    const [r1, r2] = await Promise.all([
      updateSettings({ currency: currencyForm.value, language: languageForm.value }),
      updateBudgetDefaults({ savingsPercentage: savingsPercentageForm.value })
    ])
    if (r1.success && r2.success)
      successToast('Cuenta actualizada', 'Tus preferencias de cuenta fueron guardadas.')
  }

  // [3] Notificaciones form state
  const notificationsEnabledForm = ref(true)
  const budgetAlertThresholdForm = ref(80)

  watch(
    () => settings.value,
    val => {
      if (!val) return
      notificationsEnabledForm.value = val.notificationsEnabled
      budgetAlertThresholdForm.value = val.budgetAlertThreshold
    },
    { immediate: true, deep: true }
  )

  const handleSaveNotifications = async () => {
    const [r1, r2] = await Promise.all([
      updateSettings({ notificationsEnabled: notificationsEnabledForm.value }),
      updateBudgetDefaults({ budgetAlertThreshold: budgetAlertThresholdForm.value })
    ])
    if (r1.success && r2.success)
      successToast('Notificaciones guardadas', 'Tus preferencias de alertas fueron actualizadas.')
  }

  const handleLogout = async () => {
    await logout()
  }

  onMounted(async () => {
    await fetchSettings()
  })
</script>

<template>
  <div class="settings-page">
    <div class="settings-page__header">
      <Heading level="h1" size="2xl" weight="extrabold">Configuración</Heading>
      <Text size="sm" color="muted">Personaliza tu experiencia</Text>
    </div>

    <div v-if="isLoading && !settings" class="settings-page__loading">
      <div class="settings-page__skeleton" />
      <div class="settings-page__skeleton settings-page__skeleton--short" />
    </div>

    <UAccordion
      v-else
      :items="[
        { label: 'Perfil', icon: 'i-material-symbols-person', slot: 'perfil' },
        { label: 'Cuenta', icon: 'i-material-symbols-manage-accounts', slot: 'cuenta' },
        { label: 'Notificaciones', icon: 'i-material-symbols-notifications', slot: 'notificaciones' },
        { label: 'App', icon: 'i-material-symbols-info', slot: 'app' }
      ]"
      :default-open="0"
      class="settings-page__accordion"
    >
      <!-- [1] Perfil -->
      <template #perfil>
        <div class="settings-section">
          <div class="settings-section__avatar">
            <UAvatar
              v-if="avatarUrl"
              :src="avatarUrl"
              size="xl"
              :alt="user?.displayName ?? ''"
            />
            <div v-else class="settings-section__avatar-initials">
              <Text size="lg" weight="bold">{{ avatarInitials }}</Text>
            </div>
          </div>

          <div class="settings-section__field">
            <Text size="sm" weight="medium" class="settings-section__label">Nombre visible</Text>
            <input
              v-model="displayNameForm"
              type="text"
              class="settings-section__input"
              placeholder="Tu nombre"
            />
          </div>

          <div class="settings-section__field">
            <Text size="sm" weight="medium" class="settings-section__label">Correo electrónico</Text>
            <input
              :value="user?.email ?? ''"
              type="email"
              class="settings-section__input settings-section__input--readonly"
              readonly
            />
          </div>

          <div class="settings-section__actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveProfile">
              Guardar perfil
            </Button>
          </div>
        </div>
      </template>

      <!-- [2] Cuenta -->
      <template #cuenta>
        <div class="settings-section">
          <div class="settings-section__field">
            <Text size="sm" weight="medium" class="settings-section__label">Moneda principal</Text>
            <Select
              v-model="currencyForm"
              name="currency"
              label=""
              :options="currencyOptions"
            />
          </div>

          <div class="settings-section__field">
            <Text size="sm" weight="medium" class="settings-section__label">Idioma</Text>
            <Select
              v-model="languageForm"
              name="language"
              label=""
              :options="languageOptions"
            />
          </div>

          <div class="settings-section__field">
            <Text size="sm" weight="medium" class="settings-section__label">
              Porcentaje de ahorro predeterminado
            </Text>
            <div class="settings-section__percentage">
              <input
                v-model.number="savingsPercentageForm"
                type="number"
                min="0"
                max="100"
                class="settings-section__input settings-section__input--narrow"
              />
              <Text size="sm" color="muted">%</Text>
            </div>
          </div>

          <div class="settings-section__actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveCuenta">
              Guardar cuenta
            </Button>
          </div>
        </div>
      </template>

      <!-- [3] Notificaciones -->
      <template #notificaciones>
        <div class="settings-section">
          <div class="settings-section__toggle-row">
            <div>
              <Text size="sm" weight="medium">Notificaciones activas</Text>
              <Text size="xs" color="muted">Recibir alertas y recordatorios</Text>
            </div>
            <input
              v-model="notificationsEnabledForm"
              type="checkbox"
              class="settings-section__toggle"
            />
          </div>

          <div class="settings-section__field">
            <div class="settings-section__slider-header">
              <Text size="sm" weight="medium" class="settings-section__label">
                Umbral de alerta de presupuesto
              </Text>
              <Text size="sm" weight="bold" color="primary">{{ budgetAlertThresholdForm }}%</Text>
            </div>
            <input
              v-model.number="budgetAlertThresholdForm"
              type="range"
              min="50"
              max="100"
              step="5"
              class="settings-section__slider"
            />
            <div class="settings-section__slider-labels">
              <Text size="xs" color="muted">50%</Text>
              <Text size="xs" color="muted">100%</Text>
            </div>
          </div>

          <div class="settings-section__actions">
            <Button
              variant="primary"
              size="sm"
              :disabled="isLoading"
              @click="handleSaveNotifications"
            >
              Guardar notificaciones
            </Button>
          </div>
        </div>
      </template>

      <!-- [4] App info -->
      <template #app>
        <div class="settings-section">
          <div class="settings-section__info-row">
            <Text size="sm" color="muted">Versión</Text>
            <Text size="sm" weight="medium">1.0.0-beta</Text>
          </div>

          <div class="settings-section__actions settings-section__actions--start">
            <Button variant="danger" size="sm" icon="logout" @click="handleLogout">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<style scoped lang="postcss">
  .settings-page {
    @apply space-y-4;
  }

  .settings-page__header {
    @apply mb-2;
  }

  .settings-page__loading {
    @apply space-y-3;
  }

  .settings-page__skeleton {
    @apply animate-pulse rounded-xl bg-slate-100 h-16 w-full;
  }

  .settings-page__skeleton--short {
    @apply h-12 w-3/4;
  }

  .settings-page__accordion {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .settings-section {
    @apply space-y-4 p-5;
  }

  .settings-section__avatar {
    @apply flex items-center gap-4 pb-2;
  }

  .settings-section__avatar-initials {
    @apply flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700;
  }

  .settings-section__field {
    @apply flex flex-col gap-2;
  }

  .settings-section__label {
    @apply text-neutral-700 dark:text-neutral-300;
  }

  .settings-section__input {
    @apply w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-neutral-700 dark:bg-neutral-900;
  }

  .settings-section__input--readonly {
    @apply cursor-not-allowed bg-neutral-50 text-neutral-400 dark:bg-neutral-800;
  }

  .settings-section__input--narrow {
    @apply w-24;
  }

  .settings-section__percentage {
    @apply flex items-center gap-2;
  }

  .settings-section__toggle-row {
    @apply flex items-center justify-between rounded-lg border border-neutral-100 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .settings-section__toggle {
    @apply h-5 w-10 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors checked:bg-primary-600;
  }

  .settings-section__slider-header {
    @apply flex items-center justify-between;
  }

  .settings-section__slider {
    @apply w-full cursor-pointer accent-primary-600;
  }

  .settings-section__slider-labels {
    @apply flex justify-between;
  }

  .settings-section__info-row {
    @apply flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3 dark:border-neutral-700;
  }

  .settings-section__actions {
    @apply flex justify-end border-t border-neutral-100 pt-4 dark:border-neutral-700;
  }

  .settings-section__actions--start {
    @apply justify-start;
  }
</style>
