<script setup lang="ts">
  import { FINANCIAL_PROFILE_OPTIONS } from '@/common/constants'
  import { usePlansApplication } from '@/composables/application/usePlansApplication'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import { useSettingsApplication } from '@/composables/application/useSettingsApplication'
  import { useAuth } from '@/composables/useAuth'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useAuthStore } from '@/stores/auth.store'
  import type { PlanData } from '@/types/api'
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'

  definePageMeta({
    layout: 'dashboard',
    title: 'Configuración',
    breadcrumb: 'Configuración'
  })

  const { settings, isLoading, fetchSettings, updateSettings, updateBudgetDefaults } =
    useSettingsApplication()
  const { user, finances, avatarUrl, avatarInitials, updatePersonalInfo, updateFinancialInfo } =
    useProfileApplication()
  const { fetchPublicPlans, publicPlans } = usePlansApplication()
  const { logout } = useAuth()
  const { success: successToast, error: errorToast } = useFeedback()
  const authStore = useAuthStore()

  type TabId = 'profile' | 'account' | 'notifications' | 'app' | 'billing'

  const activeTab = ref<TabId>('profile')

  const tabs: { id: TabId; label: string; icon: string; disabled?: boolean }[] = [
    { id: 'profile', label: 'Perfil', icon: 'person' },
    { id: 'account', label: 'Cuenta', icon: 'manage_accounts' },
    { id: 'billing', label: 'Facturación', icon: 'receipt_long', disabled: true },
    { id: 'notifications', label: 'Notificaciones', icon: 'notifications', disabled: true },
    { id: 'app', label: 'App', icon: 'info' }
  ]

  // [1] Perfil
  const displayNameForm = ref('')
  const dialCodeForm = ref('+57')
  const phoneNumberForm = ref('')
  const genderForm = ref<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say')

  const genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
    { label: 'Prefiero no decirlo', value: 'prefer_not_to_say' }
  ]

  const dialCodeOptions = [
    { value: '+57', label: '🇨🇴 +57' },
    { value: '+1', label: '🇺🇸 +1' },
    { value: '+52', label: '🇲🇽 +52' },
    { value: '+54', label: '🇦🇷 +54' },
    { value: '+56', label: '🇨🇱 +56' },
    { value: '+51', label: '🇵🇪 +51' },
    { value: '+58', label: '🇻🇪 +58' },
    { value: '+593', label: '🇪🇨 +593' },
    { value: '+507', label: '🇵🇦 +507' },
    { value: '+506', label: '🇨🇷 +506' },
    { value: '+503', label: '🇸🇻 +503' },
    { value: '+502', label: '🇬🇹 +502' },
    { value: '+504', label: '🇭🇳 +504' },
    { value: '+505', label: '🇳🇮 +505' }
  ]

  const parsePhone = (full: string): { dialCode: string; number: string } => {
    const codes = dialCodeOptions.map(o => o.value).sort((a, b) => b.length - a.length)
    const match = codes.find(code => full.startsWith(code))
    return match
      ? { dialCode: match, number: full.slice(match.length) }
      : { dialCode: '+57', number: full }
  }

  type ProfileSnapshot = {
    displayName: string
    dialCode: string
    phoneNumber: string
    gender: 'male' | 'female' | 'prefer_not_to_say'
  }
  const profileSnapshot = ref<ProfileSnapshot>({
    displayName: '',
    dialCode: '+57',
    phoneNumber: '',
    gender: 'prefer_not_to_say'
  })

  watch(
    () => user.value,
    val => {
      if (!val) return
      if (val.displayName) {
        displayNameForm.value = val.displayName
        profileSnapshot.value.displayName = val.displayName
      }
      if (val.phoneNumber) {
        const { dialCode, number } = parsePhone(val.phoneNumber)
        dialCodeForm.value = dialCode
        phoneNumberForm.value = number
        profileSnapshot.value.dialCode = dialCode
        profileSnapshot.value.phoneNumber = number
      }
      if (val.gender) {
        genderForm.value = val.gender as typeof genderForm.value
        profileSnapshot.value.gender = val.gender as typeof genderForm.value
      }
    },
    { immediate: true, deep: true }
  )

  const isPhoneVerified = computed(() => user.value?.isPhoneVerified ?? false)

  const isProfileDirty = computed(
    () =>
      displayNameForm.value !== profileSnapshot.value.displayName ||
      dialCodeForm.value !== profileSnapshot.value.dialCode ||
      phoneNumberForm.value !== profileSnapshot.value.phoneNumber ||
      genderForm.value !== profileSnapshot.value.gender
  )

  const isSavingProfile = ref(false)

  const handleSaveProfile = async () => {
    isSavingProfile.value = true
    try {
      const fullPhone = phoneNumberForm.value.trim()
        ? `${dialCodeForm.value}${phoneNumberForm.value.trim()}`
        : undefined
      const { success } = await updatePersonalInfo({
        displayName: displayNameForm.value,
        phone: fullPhone,
        gender: genderForm.value
      })
      if (success) {
        profileSnapshot.value = {
          displayName: displayNameForm.value,
          dialCode: dialCodeForm.value,
          phoneNumber: phoneNumberForm.value,
          gender: genderForm.value
        }
        successToast('Perfil actualizado', 'Tu información personal fue guardada correctamente.')
      } else {
        errorToast('No se pudo guardar', 'Intenta de nuevo en unos segundos.')
      }
    } finally {
      isSavingProfile.value = false
    }
  }

  // [2] Finances (profile subsection)
  const financialProfileForm = ref('')
  const financialCurrencyForm = ref('COP')

  const financialProfileOptions = FINANCIAL_PROFILE_OPTIONS

  const financesSnapshot = ref({ profile: '', currency: 'COP' })

  watch(
    () => finances.value,
    val => {
      if (!val) return
      if (val.profile) {
        financialProfileForm.value = val.profile
        financesSnapshot.value.profile = val.profile
      }
      if (val.currency) {
        financialCurrencyForm.value = val.currency
        financesSnapshot.value.currency = val.currency
      }
    },
    { immediate: true, deep: true }
  )

  const isFinancesDirty = computed(
    () => financialProfileForm.value !== financesSnapshot.value.profile
  )

  const isSavingFinances = ref(false)

  const handleSaveFinances = async () => {
    isSavingFinances.value = true
    try {
      const { success } = await updateFinancialInfo({
        currency: financialCurrencyForm.value,
        profile: financialProfileForm.value,
        usage: finances.value?.usage ?? ''
      })
      if (success) {
        financesSnapshot.value = {
          profile: financialProfileForm.value,
          currency: financialCurrencyForm.value
        }
        successToast('Finanzas actualizadas', 'Tu perfil financiero fue guardado correctamente.')
      } else {
        errorToast('No se pudo guardar', 'Intenta de nuevo en unos segundos.')
      }
    } finally {
      isSavingFinances.value = false
    }
  }

  // [3] Notificaciones
  const notificationsEnabledForm = ref(true)
  const budgetAlertThresholdForm = ref(80)

  const notificationsSnapshot = ref({ enabled: true, threshold: 80 })

  watch(
    () => settings.value,
    val => {
      if (!val) return
      notificationsEnabledForm.value = val.notificationsEnabled
      budgetAlertThresholdForm.value = val.budgetAlertThreshold
      notificationsSnapshot.value.enabled = val.notificationsEnabled
      notificationsSnapshot.value.threshold = val.budgetAlertThreshold
    },
    { immediate: true, deep: true }
  )

  const isNotificationsDirty = computed(
    () =>
      notificationsEnabledForm.value !== notificationsSnapshot.value.enabled ||
      budgetAlertThresholdForm.value !== notificationsSnapshot.value.threshold
  )

  const handleSaveNotifications = async () => {
    const [r1, r2] = await Promise.all([
      updateSettings({ notificationsEnabled: notificationsEnabledForm.value }),
      updateBudgetDefaults({ budgetAlertThreshold: budgetAlertThresholdForm.value })
    ])
    if (r1.success && r2.success) {
      notificationsSnapshot.value = {
        enabled: notificationsEnabledForm.value,
        threshold: budgetAlertThresholdForm.value
      }
      successToast('Notificaciones guardadas', 'Tus preferencias de alertas fueron actualizadas.')
    }
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
      case 'TRIAL':
        return 'Pro Trial'
      case 'FREE':
        return 'Gratis'
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
  const isFree = computed(() => accountType.value === 'FREE')
  const showUpgrade = computed(() => isTrial.value || isFree.value)

  const PLAN_ORDER: Record<string, number> = { free: 0, plus: 1, pro: 2 }

  const sortedPublicPlans = computed(() =>
    [...publicPlans.value].sort((a, b) => {
      const aIdx = PLAN_ORDER[a.name.toLowerCase()] ?? 99
      const bIdx = PLAN_ORDER[b.name.toLowerCase()] ?? 99
      return aIdx - bIdx
    })
  )

  const activePlanName = computed(() => {
    switch (accountType.value) {
      case 'PLUS':
        return 'plus'
      case 'PRO':
      case 'TRIAL':
      case 'PARTNER':
        return 'pro'
      default:
        return 'free'
    }
  })

  const isActivePlan = (plan: PlanData) => plan.name.toLowerCase() === activePlanName.value

  const planPrice = (plan: PlanData) =>
    plan.price === 0 ? 'Gratis' : formatCurrency(plan.price, plan.currency as Currency)

  onMounted(async () => {
    await Promise.all([fetchSettings(), fetchPublicPlans()])
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

    <div v-else class="settings-panel">
      <!-- Left nav -->
      <nav class="settings-panel__nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="settings-panel__nav-item"
          :class="{
            'settings-panel__nav-item--active': activeTab === tab.id,
            'settings-panel__nav-item--disabled': tab.disabled
          }"
          :disabled="tab.disabled"
          @click="!tab.disabled && (activeTab = tab.id)"
        >
          <span
            class="material-symbols-outlined settings-panel__nav-icon"
            :class="{ 'settings-panel__nav-icon--active': activeTab === tab.id && !tab.disabled }"
          >
            {{ tab.icon }}
          </span>
          <Text size="sm" :weight="activeTab === tab.id ? 'semibold' : 'normal'">
            {{ tab.label }}
          </Text>
          <span v-if="tab.disabled" class="settings-panel__nav-soon">Próximo</span>
        </button>
      </nav>

      <!-- Right content -->
      <div class="settings-panel__body">
        <!-- [1] Perfil -->
        <template v-if="activeTab === 'profile'">
          <div class="settings-section">
            <div class="settings-section__header">
              <span
                class="material-symbols-outlined settings-section__icon settings-section__icon--primary"
              >
                person
              </span>
              <div>
                <Heading level="h2" size="lg" weight="bold">Perfil</Heading>
                <Text size="xs" color="muted">Tu información personal</Text>
              </div>
            </div>

            <div class="settings-section__body">
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
                <Text size="sm" weight="medium" class="settings-card__label">Teléfono</Text>
                <div class="settings-card__phone-row">
                  <div class="settings-card__dial-col">
                    <Select v-model="dialCodeForm" name="dialCode" :options="dialCodeOptions" />
                  </div>
                  <div class="settings-card__phone-input-wrap">
                    <input
                      v-model="phoneNumberForm"
                      type="tel"
                      class="settings-card__input settings-card__input--phone"
                      placeholder="300 000 0000"
                    />
                    <span
                      class="material-symbols-outlined settings-card__phone-status-icon"
                      :class="
                        isPhoneVerified
                          ? 'settings-card__phone-status-icon--verified'
                          : 'settings-card__phone-status-icon--unverified'
                      "
                    >
                      {{ isPhoneVerified ? 'check_circle' : 'cancel' }}
                    </span>
                  </div>
                  <Button v-if="!isPhoneVerified" variant="secondary" size="sm" icon="sms" disabled>
                    Verificar
                  </Button>
                </div>
              </div>

              <div class="settings-card__field">
                <Text size="sm" weight="medium" class="settings-card__label">Sexo</Text>
                <Select v-model="genderForm" name="gender" :options="genderOptions" />
              </div>

              <div class="settings-card__actions">
                <Button
                  variant="primary"
                  size="sm"
                  :disabled="isSavingProfile || !isProfileDirty"
                  :loading="isSavingProfile"
                  @click="handleSaveProfile"
                >
                  Guardar perfil
                </Button>
              </div>
            </div>
          </div>

          <!-- Finanzas subsection -->
          <div class="settings-section settings-section--divided">
            <div class="settings-section__header">
              <span
                class="material-symbols-outlined settings-section__icon settings-section__icon--warning"
              >
                account_balance_wallet
              </span>
              <div>
                <Heading level="h2" size="lg" weight="bold">Finanzas</Heading>
                <Text size="xs" color="muted">Tu perfil financiero y moneda</Text>
              </div>
            </div>

            <div class="settings-section__body">
              <Select
                v-model="financialProfileForm"
                name="financialProfile"
                label="Perfil financiero"
                :options="financialProfileOptions"
              />

              <div class="settings-card__field">
                <Text size="sm" weight="medium" class="settings-card__label">Moneda principal</Text>
                <input
                  :value="financialCurrencyForm"
                  type="text"
                  class="settings-card__input settings-card__input--readonly"
                  readonly
                />
              </div>

              <AlertBanner variant="warning" icon="lock">
                La moneda se configuró al crear tu cuenta. Por ahora no puedes cambiarla desde aquí
                — próximamente habilitaremos esta opción.
              </AlertBanner>

              <div class="settings-card__actions">
                <Button
                  variant="primary"
                  size="sm"
                  :disabled="isSavingFinances || !isFinancesDirty"
                  :loading="isSavingFinances"
                  @click="handleSaveFinances"
                >
                  Guardar finanzas
                </Button>
              </div>
            </div>
          </div>
        </template>

        <!-- [2] Cuenta -->
        <template v-if="activeTab === 'account'">
          <!-- Plan -->
          <div class="settings-section">
            <div class="settings-section__header">
              <span
                class="material-symbols-outlined settings-section__icon settings-section__icon--primary"
              >
                workspace_premium
              </span>
              <div class="plan-header__info">
                <Heading level="h2" size="lg" weight="bold">Plan</Heading>
                <Text size="xs" color="muted">Tu suscripción y beneficios</Text>
              </div>
              <Badge :variant="planVariant">{{ planLabel }}</Badge>
            </div>

            <div class="settings-section__body">
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

              <!-- Plan cards -->
              <div class="plan-comparison">
                <div class="plan-comparison__header">
                  <Heading level="h3" size="sm" weight="semibold">Comparar planes</Heading>
                </div>

                <div v-if="!publicPlans.length" class="plan-cards">
                  <div v-for="i in 3" :key="i" class="plan-card plan-card--skeleton" />
                </div>

                <div v-else class="plan-cards">
                  <div
                    v-for="plan in sortedPublicPlans"
                    :key="plan.id"
                    class="plan-card"
                    :class="{ 'plan-card--active': isActivePlan(plan) }"
                  >
                    <div class="plan-card__header">
                      <Text size="sm" weight="semibold">{{ plan.name }}</Text>
                      <Badge v-if="isActivePlan(plan)" variant="primary" size="xs">Tu plan</Badge>
                    </div>
                    <div class="plan-card__price">
                      <span class="plan-card__price-value">{{ planPrice(plan) }}</span>
                      <Text v-if="plan.price > 0" size="xs" color="muted">/mes</Text>
                    </div>
                    <ul class="plan-card__features">
                      <li
                        v-for="feature in plan.features"
                        :key="feature"
                        class="plan-card__feature"
                      >
                        <span class="material-symbols-outlined plan-card__feature-icon">
                          check_circle
                        </span>
                        <Text size="xs">{{ feature }}</Text>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Manage subscription -->
              <div
                v-if="accountType !== 'PARTNER'"
                class="settings-card__actions settings-card__actions--start"
              >
                <Button
                  :variant="showUpgrade ? 'primary' : 'secondary'"
                  size="sm"
                  icon="workspace_premium"
                >
                  Gestionar suscripción
                </Button>
              </div>
            </div>
          </div>
        </template>

        <!-- [3] Notificaciones -->
        <div v-if="activeTab === 'notifications'" class="settings-section">
          <div class="settings-section__header">
            <span class="material-symbols-outlined settings-section__icon">notifications</span>
            <div>
              <Heading level="h2" size="lg" weight="bold">Notificaciones</Heading>
              <Text size="xs" color="muted">Alertas y recordatorios</Text>
            </div>
          </div>

          <div class="settings-section__body">
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
              <Button
                variant="primary"
                size="sm"
                :disabled="isLoading || !isNotificationsDirty"
                @click="handleSaveNotifications"
              >
                Guardar notificaciones
              </Button>
            </div>
          </div>
        </div>

        <!-- [4] App -->
        <div v-if="activeTab === 'app'" class="settings-section">
          <div class="settings-section__header">
            <span class="material-symbols-outlined settings-section__icon">info</span>
            <div>
              <Heading level="h2" size="lg" weight="bold">App</Heading>
              <Text size="xs" color="muted">Información y sesión</Text>
            </div>
          </div>

          <div class="settings-section__body">
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
        </div>
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
    @apply h-32 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .settings-page__skeleton--short {
    @apply h-24;
  }

  /* Unified panel */
  .settings-panel {
    @apply flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm;
    @apply dark:border-neutral-700 dark:bg-neutral-900;
  }

  /* Left nav */
  .settings-panel__nav {
    @apply flex w-52 shrink-0 flex-col gap-0.5 p-2;
    @apply border-r border-neutral-200 bg-neutral-50;
    @apply dark:border-neutral-700 dark:bg-neutral-800/50;
  }

  .settings-panel__nav-item {
    @apply flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors;
    @apply text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900;
    @apply dark:text-neutral-400 dark:hover:bg-neutral-700/40 dark:hover:text-neutral-100;
  }

  .settings-panel__nav-item--active {
    @apply bg-white text-neutral-900 shadow-sm;
    @apply dark:bg-neutral-900 dark:text-white;
  }

  .settings-panel__nav-item--disabled {
    @apply cursor-not-allowed opacity-50 hover:bg-transparent hover:text-neutral-600;
    @apply dark:hover:bg-transparent dark:hover:text-neutral-400;
  }

  .settings-panel__nav-soon {
    @apply ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium;
    @apply bg-neutral-200 text-neutral-500;
    @apply dark:bg-neutral-700 dark:text-neutral-400;
  }

  .settings-panel__nav-icon {
    @apply shrink-0 text-xl text-neutral-400 transition-colors;
  }

  .settings-panel__nav-icon--active {
    @apply text-primary-600;
  }

  /* Right content */
  .settings-panel__body {
    @apply min-w-0 flex-1;
  }

  /* Sections */
  .settings-section {
    @apply min-h-0;
  }

  .settings-section--divided {
    @apply border-t border-neutral-200 dark:border-neutral-700;
  }

  .settings-section__header {
    @apply flex items-center gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-700;
  }

  .settings-section__icon {
    @apply shrink-0 text-xl text-neutral-400;
  }

  .settings-section__icon--primary {
    @apply text-primary-600;
  }

  .settings-section__icon--warning {
    @apply text-warning-600;
  }

  .settings-section__body {
    @apply space-y-4 px-6 py-5;
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
    @apply text-neutral-700 dark:text-neutral-300;
  }

  .settings-card__label-row {
    @apply flex items-center justify-between;
  }

  .settings-card__input {
    @apply w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors;
    @apply focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
    @apply dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100;
  }

  .settings-card__input--readonly {
    @apply cursor-not-allowed bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400;
  }

  .settings-card__input--narrow {
    @apply w-24;
  }

  .settings-card__row {
    @apply flex items-center gap-2;
  }

  .settings-card__phone-row {
    @apply flex items-center gap-2;
  }

  .settings-card__dial-col {
    @apply w-28 shrink-0;
  }

  .settings-card__phone-input-wrap {
    @apply relative flex-1;
  }

  .settings-card__input--phone {
    @apply w-full pr-8;
  }

  .settings-card__phone-status-icon {
    @apply pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base leading-none;
  }

  .settings-card__phone-status-icon--verified {
    @apply text-success-500;
  }

  .settings-card__phone-status-icon--unverified {
    @apply text-neutral-400;
  }

  .settings-card__toggle-row {
    @apply flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700;
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
    @apply flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-700;
  }

  .settings-card__actions {
    @apply flex justify-end border-t border-neutral-200 pt-4 dark:border-neutral-700;
  }

  .settings-card__actions--start {
    @apply justify-start;
  }

  /* Plan header */
  .plan-header__info {
    @apply flex-1;
  }

  /* Trial countdown banner */
  .trial-banner {
    @apply space-y-3 rounded-xl border p-4;
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
    @apply text-3xl font-extrabold leading-none text-warning-700;
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

  /* Plan comparison cards */
  .plan-comparison {
    @apply space-y-3;
  }

  .plan-cards {
    @apply grid gap-3;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .plan-card {
    @apply space-y-3 rounded-xl border border-neutral-200 p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800/40;
  }

  .plan-card--active {
    @apply border-primary-300 bg-primary-50;
    @apply dark:border-primary-700 dark:bg-primary-900/20;
  }

  .plan-card--skeleton {
    @apply h-44 animate-pulse bg-neutral-100;
    @apply dark:bg-neutral-800;
  }

  .plan-card__header {
    @apply flex items-center justify-between gap-2;
  }

  .plan-card__price {
    @apply flex items-baseline gap-1;
  }

  .plan-card__price-value {
    @apply text-lg font-extrabold text-neutral-900 dark:text-neutral-100;
  }

  .plan-card__features {
    @apply space-y-1.5;
  }

  .plan-card__feature {
    @apply flex items-start gap-1.5;
  }

  .plan-card__feature-icon {
    @apply mt-0.5 shrink-0 text-sm text-success-500;
  }
</style>
