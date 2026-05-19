<script setup lang="ts">
  import { useAuth } from '@/composables/useAuth'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import { useSettingsApplication } from '@/composables/application/useSettingsApplication'
  import { useFeedback } from '@/composables/useFeedback'
  import { useAuthStore } from '@/stores/auth.store'

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

  const trialIsUrgent = computed(() => daysRemaining.value <= 7)

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
      case 'TRIAL': return trialIsUrgent.value ? 'danger' : 'warning'
      case 'PLUS': return 'secondary'
      case 'PRO': return 'primary'
      case 'PARTNER': return 'success'
      default: return 'neutral'
    }
  })

  const isTrial = computed(() => accountType.value === 'TRIAL')
  const isFree = computed(() => accountType.value === 'FREE')
  const showUpgrade = computed(() => isTrial.value || isFree.value)

  // Feature comparison table
  type FeatureValue = boolean | string
  interface PlanFeature {
    label: string
    free: FeatureValue
    plus: FeatureValue
    pro: FeatureValue
  }

  const planFeatures: PlanFeature[] = [
    { label: 'Presupuestos activos',  free: '1',             plus: '3',               pro: 'Ilimitados'       },
    { label: 'Transacciones',         free: 'Ilimitadas',    plus: 'Ilimitadas',      pro: 'Ilimitadas'       },
    { label: 'Metas de ahorro',       free: 'Ilimitadas',    plus: 'Ilimitadas',      pro: 'Ilimitadas'       },
    { label: 'Cuentas registradas',   free: '3',             plus: 'Ilimitadas',      pro: 'Ilimitadas'       },
    { label: 'Categorías',            free: 'Predefinidas',  plus: 'Personalizadas',  pro: 'Personalizadas'   },
    { label: 'Proyecciones',          free: '1 año',         plus: '3 años',          pro: '10+ años'         },
    { label: 'Reportes',              free: 'Básico',        plus: 'Mensual + Anual', pro: 'Completos'        },
    { label: 'Compartido con',        free: false,           plus: '2 personas',      pro: '6 personas'       },
    { label: 'Histórico',             free: '6 meses',       plus: '18 meses',        pro: 'Ilimitado'        },
    { label: 'Exportar datos',        free: false,           plus: 'CSV',             pro: 'CSV · PDF · Excel'},
  ]

  const activeColumn = computed(() => {
    switch (accountType.value) {
      case 'PLUS': return 'plus'
      case 'PRO':
      case 'TRIAL':
      case 'PARTNER': return 'pro'
      default: return 'free'
    }
  })

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

          <!-- Plan -->
          <Card class="settings-card">
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

              <!-- Trial countdown -->
              <div
                v-if="isTrial"
                class="trial-banner"
                :class="trialIsUrgent ? 'trial-banner--urgent' : 'trial-banner--normal'"
              >
                <div class="trial-banner__top">
                  <div class="trial-banner__countdown">
                    <Text size="xs" color="muted">Tiempo restante del trial</Text>
                    <div class="trial-banner__days">
                      <span class="trial-banner__days-number">{{ daysRemaining }}</span>
                      <Text size="sm" color="muted">días</Text>
                    </div>
                  </div>
                  <div class="trial-banner__meta">
                    <Text size="xs" color="muted">Vence el {{ trialExpirationLabel }}</Text>
                    <Text v-if="trialIsUrgent" size="xs" color="error">
                      Al vencer pasarás al plan Gratis automáticamente.
                    </Text>
                    <Text v-else size="xs" color="muted">
                      Al vencer pasarás al plan Gratis automáticamente.
                    </Text>
                  </div>
                </div>
                <div class="trial-banner__progress">
                  <div class="trial-banner__progress-labels">
                    <Text size="xs" color="muted">Inicio</Text>
                    <Text size="xs" color="muted">{{ trialProgress }}% transcurrido</Text>
                    <Text size="xs" color="muted">Día {{ TRIAL_DAYS }}</Text>
                  </div>
                  <ProgressBar
                    :progress="trialProgress"
                    :variant="trialIsUrgent ? 'danger' : 'warning'"
                    size="sm"
                  />
                </div>
              </div>

              <!-- Partner badge -->
              <div v-if="accountType === 'PARTNER'" class="plan-partner">
                <span class="material-symbols-outlined plan-partner__icon">handshake</span>
                <div>
                  <Text size="sm" weight="semibold">Cuenta Partner</Text>
                  <Text size="xs" color="muted">Acceso Pro completo sin costo</Text>
                </div>
              </div>

              <!-- Feature comparison table -->
              <div class="plan-comparison">
                <div class="plan-comparison__header">
                  <Heading level="h3" size="sm" weight="semibold">Comparar planes</Heading>
                </div>

                <div class="plan-table">
                  <!-- Column headers -->
                  <div class="plan-table__row plan-table__row--head">
                    <div class="plan-table__feature-col" />
                    <div
                      class="plan-table__plan-col"
                      :class="{ 'plan-table__plan-col--active': activeColumn === 'free' }"
                    >
                      <Text size="xs" weight="semibold">Gratis</Text>
                    </div>
                    <div
                      class="plan-table__plan-col"
                      :class="{ 'plan-table__plan-col--active': activeColumn === 'plus' }"
                    >
                      <Text size="xs" weight="semibold">Plus</Text>
                    </div>
                    <div
                      class="plan-table__plan-col"
                      :class="{ 'plan-table__plan-col--active': activeColumn === 'pro' }"
                    >
                      <Text size="xs" weight="semibold">Pro</Text>
                    </div>
                  </div>

                  <!-- Feature rows -->
                  <div
                    v-for="feature in planFeatures"
                    :key="feature.label"
                    class="plan-table__row"
                  >
                    <div class="plan-table__feature-col">
                      <Text size="xs">{{ feature.label }}</Text>
                    </div>

                    <div
                      class="plan-table__plan-col"
                      :class="{ 'plan-table__plan-col--active': activeColumn === 'free' }"
                    >
                      <template v-if="typeof feature.free === 'boolean'">
                        <span
                          class="material-symbols-outlined plan-table__icon"
                          :class="feature.free ? 'plan-table__icon--yes' : 'plan-table__icon--no'"
                        >
                          {{ feature.free ? 'check_circle' : 'cancel' }}
                        </span>
                      </template>
                      <Text v-else size="xs">{{ feature.free }}</Text>
                    </div>

                    <div
                      class="plan-table__plan-col"
                      :class="{ 'plan-table__plan-col--active': activeColumn === 'plus' }"
                    >
                      <template v-if="typeof feature.plus === 'boolean'">
                        <span
                          class="material-symbols-outlined plan-table__icon"
                          :class="feature.plus ? 'plan-table__icon--yes' : 'plan-table__icon--no'"
                        >
                          {{ feature.plus ? 'check_circle' : 'cancel' }}
                        </span>
                      </template>
                      <Text v-else size="xs">{{ feature.plus }}</Text>
                    </div>

                    <div
                      class="plan-table__plan-col"
                      :class="{ 'plan-table__plan-col--active': activeColumn === 'pro' }"
                    >
                      <template v-if="typeof feature.pro === 'boolean'">
                        <span
                          class="material-symbols-outlined plan-table__icon"
                          :class="feature.pro ? 'plan-table__icon--yes' : 'plan-table__icon--no'"
                        >
                          {{ feature.pro ? 'check_circle' : 'cancel' }}
                        </span>
                      </template>
                      <Text v-else size="xs">{{ feature.pro }}</Text>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Manage subscription -->
              <div v-if="accountType !== 'PARTNER'" class="settings-card__actions settings-card__actions--start">
                <Button
                  :variant="showUpgrade ? 'primary' : 'secondary'"
                  size="sm"
                  icon="workspace_premium"
                >
                  Gestionar suscripción
                </Button>
              </div>

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

  .plan-badge--danger {
    @apply bg-danger-100 text-danger-700;
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

  /* Trial countdown banner */
  .trial-banner {
    @apply rounded-xl border p-4 space-y-3;
  }

  .trial-banner--normal {
    @apply border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20;
  }

  .trial-banner--urgent {
    @apply border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20;
  }

  .trial-banner__top {
    @apply flex items-start justify-between gap-4;
  }

  .trial-banner__countdown {
    @apply flex flex-col gap-1;
  }

  .trial-banner__days {
    @apply flex items-baseline gap-1.5;
  }

  .trial-banner__days-number {
    @apply text-3xl font-extrabold text-warning-700 leading-none;
  }

  .trial-banner--urgent .trial-banner__days-number {
    @apply text-danger-700;
  }

  .trial-banner__meta {
    @apply flex flex-col gap-1 text-right;
  }

  .trial-banner__progress {
    @apply space-y-1;
  }

  .trial-banner__progress-labels {
    @apply flex items-center justify-between;
  }

  /* Partner badge */
  .plan-partner {
    @apply flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20;
  }

  .plan-partner__icon {
    @apply text-2xl text-success-600;
  }

  /* Feature comparison table */
  .plan-comparison {
    @apply space-y-2;
  }

  .plan-table {
    @apply rounded-xl border border-neutral-200 overflow-hidden dark:border-neutral-700;
  }

  .plan-table__row {
    @apply grid items-center border-b border-neutral-100 last:border-0 dark:border-neutral-700;
    grid-template-columns: 1fr repeat(3, 80px);
  }

  .plan-table__row--head {
    @apply bg-neutral-50 dark:bg-neutral-800/50;
  }

  .plan-table__feature-col {
    @apply px-3 py-2.5;
  }

  .plan-table__plan-col {
    @apply flex flex-col items-center justify-center px-2 py-2.5 text-center;
  }

  .plan-table__plan-col--active {
    @apply bg-primary-50 dark:bg-primary-900/20;
  }

  .plan-table__row--head .plan-table__plan-col--active {
    @apply bg-primary-100 dark:bg-primary-900/40;
  }

  .plan-table__icon {
    @apply text-base;
  }

  .plan-table__icon--yes {
    @apply text-success-600;
  }

  .plan-table__icon--no {
    @apply text-neutral-300;
  }

</style>
