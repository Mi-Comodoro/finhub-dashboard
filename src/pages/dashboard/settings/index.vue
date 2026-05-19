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

  // [1] Perfil
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

  // [2] Cuenta
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

  // [3] Notificaciones
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
      <div class="settings-page__skeleton settings-page__skeleton--short" />
    </div>

    <div v-else class="settings-page__sections">
      <!-- [1] Perfil -->
      <Card class="settings-card">
        <div class="settings-card__header">
          <span class="material-symbols-outlined settings-card__icon settings-card__icon--primary">
            person
          </span>
          <div>
            <Heading level="h2" size="lg" weight="bold">Perfil</Heading>
            <Text size="xs" color="muted">Tu información personal</Text>
          </div>
        </div>

        <div class="settings-card__body">
          <div class="settings-card__avatar-row">
            <div class="settings-card__avatar">
              <img v-if="avatarUrl" :src="avatarUrl" class="settings-card__avatar-img" alt="avatar" />
              <span v-else class="settings-card__avatar-initials">{{ avatarInitials }}</span>
            </div>
            <div>
              <Text size="sm" weight="medium">{{ user?.displayName ?? '' }}</Text>
              <Text size="xs" color="muted">{{ user?.email ?? '' }}</Text>
            </div>
          </div>

          <div class="settings-card__field">
            <Text size="sm" weight="medium" class="settings-card__label">Nombre visible</Text>
            <input v-model="displayNameForm" type="text" class="settings-card__input" placeholder="Tu nombre" />
          </div>

          <div class="settings-card__field">
            <Text size="sm" weight="medium" class="settings-card__label">Correo electrónico</Text>
            <input
              :value="user?.email ?? ''"
              type="email"
              class="settings-card__input settings-card__input--readonly"
              readonly
            />
          </div>

          <div class="settings-card__actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveProfile">
              Guardar perfil
            </Button>
          </div>
        </div>
      </Card>

      <!-- [2] Cuenta -->
      <Card class="settings-card">
        <div class="settings-card__header">
          <span class="material-symbols-outlined settings-card__icon settings-card__icon--primary">
            manage_accounts
          </span>
          <div>
            <Heading level="h2" size="lg" weight="bold">Cuenta</Heading>
            <Text size="xs" color="muted">Moneda, idioma y ahorro predeterminado</Text>
          </div>
        </div>

        <div class="settings-card__body">
          <Select
            v-model="currencyForm"
            name="currency"
            label="Moneda principal"
            :options="currencyOptions"
          />
          <Select
            v-model="languageForm"
            name="language"
            label="Idioma"
            :options="languageOptions"
          />

          <div class="settings-card__field">
            <Text size="sm" weight="medium" class="settings-card__label">
              Porcentaje de ahorro predeterminado
            </Text>
            <div class="settings-card__row">
              <input
                v-model.number="savingsPercentageForm"
                type="number"
                min="0"
                max="100"
                class="settings-card__input settings-card__input--narrow"
              />
              <Text size="sm" color="muted">%</Text>
            </div>
          </div>

          <div class="settings-card__actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveCuenta">
              Guardar cuenta
            </Button>
          </div>
        </div>
      </Card>

      <!-- [3] Notificaciones -->
      <Card class="settings-card">
        <div class="settings-card__header">
          <span class="material-symbols-outlined settings-card__icon">notifications</span>
          <div>
            <Heading level="h2" size="lg" weight="bold">Notificaciones</Heading>
            <Text size="xs" color="muted">Alertas y recordatorios</Text>
          </div>
        </div>

        <div class="settings-card__body">
          <div class="settings-card__toggle-row">
            <div>
              <Text size="sm" weight="medium">Notificaciones activas</Text>
              <Text size="xs" color="muted">Recibir alertas y recordatorios</Text>
            </div>
            <input v-model="notificationsEnabledForm" type="checkbox" class="settings-card__toggle" />
          </div>

          <div class="settings-card__field">
            <div class="settings-card__slider-header">
              <Text size="sm" weight="medium" class="settings-card__label">
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
              class="settings-card__slider"
            />
            <div class="settings-card__slider-labels">
              <Text size="xs" color="muted">50%</Text>
              <Text size="xs" color="muted">100%</Text>
            </div>
          </div>

          <div class="settings-card__actions">
            <Button variant="primary" size="sm" :disabled="isLoading" @click="handleSaveNotifications">
              Guardar notificaciones
            </Button>
          </div>
        </div>
      </Card>

      <!-- [4] App info -->
      <Card class="settings-card">
        <div class="settings-card__header">
          <span class="material-symbols-outlined settings-card__icon">info</span>
          <div>
            <Heading level="h2" size="lg" weight="bold">App</Heading>
            <Text size="xs" color="muted">Información y sesión</Text>
          </div>
        </div>

        <div class="settings-card__body">
          <div class="settings-card__info-row">
            <Text size="sm" color="muted">Versión</Text>
            <Text size="sm" weight="medium">1.0.0-beta</Text>
          </div>

          <div class="settings-card__actions settings-card__actions--start">
            <Button variant="danger" size="sm" icon="logout" @click="handleLogout">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </Card>
    </div>
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
    @apply animate-pulse rounded-xl bg-slate-100 h-32 w-full;
  }

  .settings-page__skeleton--short {
    @apply h-24;
  }

  .settings-page__sections {
    @apply space-y-4;
  }

  .settings-card {
    @apply !p-0 overflow-hidden;
  }

  .settings-card__header {
    @apply flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-700;
  }

  .settings-card__icon {
    @apply text-neutral-500 text-xl;
  }

  .settings-card__icon--primary {
    @apply text-primary-600;
  }

  .settings-card__body {
    @apply space-y-4 p-5;
  }

  .settings-card__avatar-row {
    @apply flex items-center gap-3 pb-2;
  }

  .settings-card__avatar {
    @apply flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100;
  }

  .settings-card__avatar-img {
    @apply h-full w-full object-cover;
  }

  .settings-card__avatar-initials {
    @apply text-base font-bold text-primary-700;
  }

  .settings-card__field {
    @apply flex flex-col gap-1;
  }

  .settings-card__label {
    @apply text-neutral-600 dark:text-neutral-400;
  }

  .settings-card__input {
    @apply w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-neutral-700 dark:bg-neutral-900;
  }

  .settings-card__input--readonly {
    @apply cursor-not-allowed bg-neutral-50 text-neutral-400 dark:bg-neutral-800;
  }

  .settings-card__input--narrow {
    @apply w-24;
  }

  .settings-card__row {
    @apply flex items-center gap-2;
  }

  .settings-card__toggle-row {
    @apply flex items-center justify-between rounded-lg border border-neutral-100 p-4 dark:border-neutral-700;
  }

  .settings-card__toggle {
    @apply h-5 w-10 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors checked:bg-primary-600;
  }

  .settings-card__slider-header {
    @apply flex items-center justify-between;
  }

  .settings-card__slider {
    @apply w-full cursor-pointer accent-primary-600;
  }

  .settings-card__slider-labels {
    @apply flex justify-between;
  }

  .settings-card__info-row {
    @apply flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3 dark:border-neutral-700;
  }

  .settings-card__actions {
    @apply flex justify-end border-t border-neutral-100 pt-4 dark:border-neutral-700;
  }

  .settings-card__actions--start {
    @apply justify-start;
  }
</style>
