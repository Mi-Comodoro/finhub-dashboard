<script setup lang="ts">
  import { useAuth } from '@/composables/useAuth'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import { useSettingsApplication } from '@/composables/application/useSettingsApplication'
  import { useFeedback } from '@/composables/useFeedback'
  import { useAuthStore } from '@/stores/auth.store'
  import { formatCurrency } from '@/utils/currency'

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
  const authStore = useAuthStore()

  type TabId = 'profile' | 'account' | 'notifications' | 'app'

  const activeTab = ref<TabId>('profile')

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'profile', label: 'Perfil', icon: 'person' },
    { id: 'account', label: 'Cuenta', icon: 'manage_accounts' },
    { id: 'notifications', label: 'Notificaciones', icon: 'notifications' },
    { id: 'app', label: 'App', icon: 'info' }
  ]

  // [1] Perfil
  const displayNameForm = ref('')
  const phoneForm = ref('')
  const genderForm = ref<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say')

  const genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
    { label: 'Prefiero no decirlo', value: 'prefer_not_to_say' }
  ]

  watch(
    () => user.value,
    val => {
      if (!val) return
      if (val.displayName) displayNameForm.value = val.displayName
      if (val.phoneNumber) phoneForm.value = val.phoneNumber
      if (val.gender) genderForm.value = val.gender as typeof genderForm.value
    },
    { immediate: true, deep: true }
  )

  const isPhoneVerified = computed(() => user.value?.isPhoneVerified ?? false)

  const handleSaveProfile = async () => {
    const { success } = await updatePersonalInfo({
      displayName: displayNameForm.value,
      phone: phoneForm.value,
      gender: genderForm.value
    })
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

  // Plan / Trial
  const accountType = computed(() => authStore.accountType)
  const trialEndsAt = computed(() => user.value?.trialEndsAt ?? null)

  const TRIAL_DAYS = 45

  const daysRemaining = computed(() => {
    if (!trialEndsAt.value) return 0
    const diff = new Date(trialEndsAt.value).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const trialProgress = computed(() => {
    const used = TRIAL_DAYS - daysRemaining.value
    return Math.min(100, Math.max(0, Math.round((used / TRIAL_DAYS) * 100)))
  })

  const trialExpirationLabel = computed(() => {
    if (!trialEndsAt.value) return '—'
    return new Date(trialEndsAt.value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  const planLabel = computed(() => {
    switch (accountType.value) {
      case 'TRIAL': return 'Pro Trial'
      case 'FREE': return 'Gratis'
      case 'PLUS': return 'Plus'
      case 'PRO': return 'Pro'
      case 'PARTNER': return 'Partner'
      default: return 'Gratis'
    }
  })

  const planVariant = computed(() => {
    switch (accountType.value) {
      case 'TRIAL': return 'warning'
      case 'PLUS': return 'secondary'
      case 'PRO': return 'primary'
      case 'PARTNER': return 'success'
      default: return 'neutral'
    }
  })

  const isTrial = computed(() => accountType.value === 'TRIAL')
  const isFree = computed(() => accountType.value === 'FREE')
  const isPaid = computed(() =>
    accountType.value === 'PLUS' || accountType.value === 'PRO' || accountType.value === 'PARTNER'
  )

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

    <div v-else class="settings-page__layout">
      <!-- Left nav -->
      <nav class="settings-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="settings-nav__item"
          :class="{ 'settings-nav__item--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="material-symbols-outlined settings-nav__icon">{{ tab.icon }}</span>
          <Text size="sm" :weight="activeTab === tab.id ? 'semibold' : 'normal'">
            {{ tab.label }}
          </Text>
        </button>
      </nav>

      <!-- Right content -->
      <div class="settings-content">

        <!-- [1] Perfil -->
        <Card v-if="activeTab === 'profile'" class="settings-card">
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
                <img
                  v-if="avatarUrl"
                  :src="avatarUrl"
                  class="settings-card__avatar-img"
                  alt="avatar"
                />
                <span v-else class="settings-card__avatar-initials">{{ avatarInitials }}</span>
              </div>
              <div>
                <Text size="sm" weight="medium">{{ user?.displayName ?? '' }}</Text>
                <Text size="xs" color="muted">{{ user?.email ?? '' }}</Text>
              </div>
            </div>

            <div class="settings-card__field">
              <Text size="sm" weight="medium" class="settings-card__label">Nombre visible</Text>
              <input
                v-model="displayNameForm"
                type="text"
                class="settings-card__input"
                placeholder="Tu nombre"
              />
            </div>

            <div class="settings-card__field">
              <Text size="sm" weight="medium" class="settings-card__label">
                Correo electrónico
              </Text>
              <input
                :value="user?.email ?? ''"
                type="email"
                class="settings-card__input settings-card__input--readonly"
                readonly
              />
            </div>

            <div class="settings-card__field">
              <div class="settings-card__label-row">
                <Text size="sm" weight="medium" class="settings-card__label">
                  Teléfono
                </Text>
                <span
                  class="phone-badge"
                  :class="isPhoneVerified ? 'phone-badge--verified' : 'phone-badge--unverified'"
                >
                  <span class="material-symbols-outlined phone-badge__icon">
                    {{ isPhoneVerified ? 'verified' : 'cancel' }}
                  </span>
                  {{ isPhoneVerified ? 'Verificado' : 'No verificado' }}
                </span>
              </div>
              <input
                v-model="phoneForm"
                type="tel"
                class="settings-card__input"
                placeholder="+57 300 000 0000"
              />
            </div>

            <div class="settings-card__field">
              <Text size="sm" weight="medium" class="settings-card__label">Sexo</Text>
              <Select
                v-model="genderForm"
                name="gender"
                :options="genderOptions"
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
        <template v-if="activeTab === 'account'">
          <!-- Preferences -->
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
                <Button
                  variant="primary"
                  size="sm"
                  :disabled="isLoading"
                  @click="handleSaveCuenta"
                >
                  Guardar cuenta
                </Button>
              </div>
            </div>
          </Card>

          <!-- Plan / Trial -->
          <Card class="settings-card settings-card--plan">
            <div class="settings-card__header">
              <span class="material-symbols-outlined settings-card__icon settings-card__icon--primary">
                workspace_premium
              </span>
              <div class="plan-header__info">
                <Heading level="h2" size="lg" weight="bold">Plan</Heading>
                <Text size="xs" color="muted">Tu suscripción y beneficios</Text>
              </div>
              <span class="plan-badge" :class="`plan-badge--${planVariant}`">
                {{ planLabel }}
              </span>
            </div>

            <div class="settings-card__body">
              <!-- Trial info -->
              <template v-if="isTrial">
                <div class="plan-trial">
                  <div class="plan-trial__stats">
                    <div class="plan-trial__stat">
                      <Text size="xs" color="muted">Días restantes</Text>
                      <Text size="lg" weight="bold" color="primary">{{ daysRemaining }}</Text>
                    </div>
                    <div class="plan-trial__stat">
                      <Text size="xs" color="muted">Vence el</Text>
                      <Text size="sm" weight="semibold">{{ trialExpirationLabel }}</Text>
                    </div>
                    <div class="plan-trial__stat">
                      <Text size="xs" color="muted">Duración total</Text>
                      <Text size="sm" weight="semibold">{{ TRIAL_DAYS }} días</Text>
                    </div>
                  </div>

                  <div class="plan-trial__progress">
                    <div class="plan-trial__progress-header">
                      <Text size="xs" color="muted">Progreso del trial</Text>
                      <Text size="xs" weight="semibold">{{ trialProgress }}% usado</Text>
                    </div>
                    <ProgressBar :progress="trialProgress" variant="warning" size="sm" />
                  </div>
                </div>
              </template>

              <!-- Paid plan info -->
              <template v-if="isPaid">
                <div class="plan-paid">
                  <span class="material-symbols-outlined plan-paid__icon">verified</span>
                  <div>
                    <Text size="sm" weight="semibold">Tienes acceso completo</Text>
                    <Text size="xs" color="muted">Disfruta de todas las funcionalidades</Text>
                  </div>
                </div>
              </template>

              <!-- Upgrade CTAs (trial or free) -->
              <template v-if="isTrial || isFree">
                <div class="plan-upgrade">
                  <Text size="sm" weight="semibold" class="plan-upgrade__title">
                    Elige tu plan
                  </Text>

                  <div class="plan-cards">
                    <!-- Plus -->
                    <div class="plan-card">
                      <div class="plan-card__header">
                        <Heading level="h3" size="sm" weight="bold">Plus</Heading>
                        <Text size="xs" color="muted">Para uso personal avanzado</Text>
                      </div>
                      <div class="plan-card__price">
                        <Text size="xl" weight="bold" color="primary">
                          {{ formatCurrency(19900, 'COP') }}
                        </Text>
                        <Text size="xs" color="muted">/mes</Text>
                      </div>
                      <ul class="plan-card__features">
                        <li class="plan-card__feature">
                          <span class="material-symbols-outlined plan-card__check">check_circle</span>
                          <Text size="xs">Presupuestos ilimitados</Text>
                        </li>
                        <li class="plan-card__feature">
                          <span class="material-symbols-outlined plan-card__check">check_circle</span>
                          <Text size="xs">Metas de ahorro</Text>
                        </li>
                        <li class="plan-card__feature">
                          <span class="material-symbols-outlined plan-card__check">check_circle</span>
                          <Text size="xs">Reportes mensuales</Text>
                        </li>
                      </ul>
                      <Button variant="secondary" size="sm" class="plan-card__cta">
                        Elegir Plus
                      </Button>
                    </div>

                    <!-- Pro -->
                    <div class="plan-card plan-card--featured">
                      <div class="plan-card__badge">Recomendado</div>
                      <div class="plan-card__header">
                        <Heading level="h3" size="sm" weight="bold">Pro</Heading>
                        <Text size="xs" color="muted">Para el control total</Text>
                      </div>
                      <div class="plan-card__price">
                        <Text size="xl" weight="bold" color="primary">
                          {{ formatCurrency(34900, 'COP') }}
                        </Text>
                        <Text size="xs" color="muted">/mes</Text>
                      </div>
                      <ul class="plan-card__features">
                        <li class="plan-card__feature">
                          <span class="material-symbols-outlined plan-card__check">check_circle</span>
                          <Text size="xs">Todo lo de Plus</Text>
                        </li>
                        <li class="plan-card__feature">
                          <span class="material-symbols-outlined plan-card__check">check_circle</span>
                          <Text size="xs">Reportes avanzados</Text>
                        </li>
                        <li class="plan-card__feature">
                          <span class="material-symbols-outlined plan-card__check">check_circle</span>
                          <Text size="xs">Soporte prioritario</Text>
                        </li>
                      </ul>
                      <Button variant="primary" size="sm" class="plan-card__cta">
                        Elegir Pro
                      </Button>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </Card>
        </template>

        <!-- [3] Notificaciones -->
        <Card v-if="activeTab === 'notifications'" class="settings-card">
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
              <input
                v-model="notificationsEnabledForm"
                type="checkbox"
                class="settings-card__toggle"
              />
            </div>

            <div class="settings-card__field">
              <div class="settings-card__slider-header">
                <Text size="sm" weight="medium" class="settings-card__label">
                  Umbral de alerta de presupuesto
                </Text>
                <Text size="sm" weight="bold" color="primary">
                  {{ budgetAlertThresholdForm }}%
                </Text>
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
        </Card>

        <!-- [4] App -->
        <Card v-if="activeTab === 'app'" class="settings-card">
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

  .settings-page__layout {
    @apply flex gap-4 items-start;
  }

  /* Left nav */
  .settings-nav {
    @apply flex flex-col gap-1 w-44 shrink-0;
  }

  .settings-nav__item {
    @apply flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors text-left w-full;
    @apply text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800;
  }

  .settings-nav__item--active {
    @apply bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400;
  }

  .settings-nav__icon {
    @apply text-xl shrink-0;
  }

  /* Right content */
  .settings-content {
    @apply flex-1 min-w-0 space-y-4;
  }

  /* Cards */
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

  .settings-card__label-row {
    @apply flex items-center justify-between;
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

  /* Phone verification badge */
  .phone-badge {
    @apply flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium;
  }

  .phone-badge--verified {
    @apply bg-success-50 text-success-700;
  }

  .phone-badge--unverified {
    @apply bg-neutral-100 text-neutral-500;
  }

  .phone-badge__icon {
    @apply text-sm leading-none;
  }

  /* Plan header */
  .plan-header__info {
    @apply flex-1;
  }

  /* Plan badge */
  .plan-badge {
    @apply rounded-full px-3 py-1 text-xs font-semibold;
  }

  .plan-badge--warning {
    @apply bg-warning-100 text-warning-700;
  }

  .plan-badge--primary {
    @apply bg-primary-100 text-primary-700;
  }

  .plan-badge--secondary {
    @apply bg-secondary-100 text-secondary-700;
  }

  .plan-badge--success {
    @apply bg-success-100 text-success-700;
  }

  .plan-badge--neutral {
    @apply bg-neutral-100 text-neutral-600;
  }

  /* Trial info */
  .plan-trial {
    @apply space-y-4;
  }

  .plan-trial__stats {
    @apply grid grid-cols-3 gap-3;
  }

  .plan-trial__stat {
    @apply flex flex-col gap-1 rounded-lg border border-neutral-100 p-3 dark:border-neutral-700;
  }

  .plan-trial__progress {
    @apply space-y-2;
  }

  .plan-trial__progress-header {
    @apply flex items-center justify-between;
  }

  /* Paid plan */
  .plan-paid {
    @apply flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 p-4;
  }

  .plan-paid__icon {
    @apply text-2xl text-success-600;
  }

  /* Upgrade section */
  .plan-upgrade {
    @apply space-y-3;
  }

  .plan-upgrade__title {
    @apply text-neutral-700 dark:text-neutral-300;
  }

  .plan-cards {
    @apply grid grid-cols-2 gap-3;
  }

  .plan-card {
    @apply relative flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700;
  }

  .plan-card--featured {
    @apply border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/10;
  }

  .plan-card__badge {
    @apply absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white;
  }

  .plan-card__header {
    @apply space-y-0.5;
  }

  .plan-card__price {
    @apply flex items-baseline gap-1;
  }

  .plan-card__features {
    @apply flex-1 space-y-1.5;
  }

  .plan-card__feature {
    @apply flex items-center gap-1.5;
  }

  .plan-card__check {
    @apply text-base text-success-600;
  }

  .plan-card__cta {
    @apply w-full justify-center;
  }
</style>
