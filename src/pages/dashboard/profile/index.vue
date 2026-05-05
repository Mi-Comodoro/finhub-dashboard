<script setup lang="ts">
  /**
   * Profile Page - Redesigned
   * User profile management with modern card-based layout
   */

  import { computed, ref, watch } from 'vue'

  import { Badge } from '@/components/atoms'
  import {
    EditableInfoCard,
    EditSectionActions,
    Input,
    ProfileInfoItem,
    Select
  } from '@/components/molecules'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import DateUtils from '@/utils/date'
  definePageMeta({
    layout: 'dashboard',
    middleware: 'dashboard'
  })

  // Application layer
  const { updatePersonalInfo, updateFinancialInfo, user, finances } = useProfileApplication()

  // Reactive data
  const isEditingPersonal = ref(false)
  const isEditingFinancial = ref(false)
  const isSaving = ref(false)

  // Form data - initialize from application
  const personalForm = ref({
    displayName: user.value.displayName || '',
    email: user.value.email || '',
    phone: user.value.phoneNumber || '',
    gender: user.value.gender || '',
    country: user.value.country || ''
  })

  const financialForm = ref({
    currency: finances.value.currency,
    profile: finances.value.profile,
    usage: finances.value.usage
  })

  // Options for selects
  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' },
    { value: 'prefer-not-to-say', label: 'Prefiero no decir' }
  ]

  const countryOptions = [
    { label: 'México', value: 'MX' },
    { label: 'Estados Unidos', value: 'US' },
    { label: 'Canadá', value: 'CA' },
    { label: 'España', value: 'ES' },
    { label: 'Argentina', value: 'AR' },
    { label: 'Colombia', value: 'CO' },
    { label: 'Chile', value: 'CL' },
    { label: 'Perú', value: 'PE' }
  ]

  const currencyOptions = [
    { label: 'USD - Dólar Estadounidense', value: 'USD' },
    { label: 'MXN - Peso Mexicano', value: 'MXN' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'CAD - Dólar Canadiense', value: 'CAD' },
    { label: 'ARS - Peso Argentino', value: 'ARS' },
    { label: 'COP - Peso Colombiano', value: 'COP' },
    { label: 'CLP - Peso Chileno', value: 'CLP' },
    { label: 'PEN - Sol Peruano', value: 'PEN' }
  ]

  const riskOptions = [
    { label: 'Conservador', value: 'conservative' },
    { label: 'Moderado', value: 'moderate' },
    { label: 'Agresivo', value: 'aggressive' }
  ]

  const usageOptions = [
    { label: 'Personal', value: 'personal' },
    { label: 'Negocios', value: 'business' },
    { label: 'Familiar', value: 'family' }
  ]

  function getGenderLabel(gender?: string): string {
    const labels = {
      male: 'Masculino',
      female: 'Femenino',
      other: 'Otro',
      'prefer-not-to-say': 'Prefiero no decir'
    }
    return labels[gender as keyof typeof labels] || 'No especificado'
  }

  function getCountryFlag(country?: string): string {
    if (!country || country.length !== 2) return ''
    const offset = 0x1f1e6 - 0x41
    return String.fromCodePoint(...[...country.toUpperCase()].map(c => c.charCodeAt(0) + offset))
  }

  function getCountryLabel(country?: string): string {
    const labels = {
      MX: 'México',
      US: 'Estados Unidos',
      CA: 'Canadá',
      ES: 'España',
      AR: 'Argentina',
      CO: 'Colombia',
      CL: 'Chile',
      PE: 'Perú'
    }
    return labels[country as keyof typeof labels] || 'No especificado'
  }

  function getCurrencyName(currency?: string): string {
    const names = {
      USD: 'Dólar Estadounidense',
      MXN: 'Peso Mexicano',
      EUR: 'Euro',
      CAD: 'Dólar Canadiense',
      ARS: 'Peso Argentino',
      COP: 'Peso Colombiano',
      CLP: 'Peso Chileno',
      PEN: 'Sol Peruano'
    }
    return names[currency as keyof typeof names] || 'Moneda no especificada'
  }

  // Watchers
  watch(
    () => user.value,
    newUser => {
      personalForm.value = {
        displayName: newUser.displayName || '',
        email: newUser.email || '',
        phone: newUser.phoneNumber || '',
        gender: newUser.gender || '',
        country: newUser.country || ''
      }
    },
    { immediate: true, deep: true }
  )

  watch(
    () => finances.value,
    newFinances => {
      financialForm.value = {
        currency: newFinances.currency,
        profile: newFinances.profile,
        usage: newFinances.usage
      }
    },
    { immediate: true, deep: true }
  )

  // Methods
  const startEditingPersonal = () => {
    personalForm.value = {
      displayName: user.value.displayName || '',
      email: user.value.email || '',
      phone: user.value.phoneNumber || '',
      gender: user.value.gender || '',
      country: user.value.country || ''
    }
    isEditingPersonal.value = true
  }

  const startEditingFinancial = () => {
    financialForm.value = {
      currency: finances.value.currency,
      profile: finances.value.profile,
      usage: finances.value.usage
    }
    isEditingFinancial.value = true
  }

  const cancelPersonalEdit = () => {
    isEditingPersonal.value = false
  }

  const cancelFinancialEdit = () => {
    isEditingFinancial.value = false
  }

  const savePersonalInfo = async () => {
    try {
      isSaving.value = true

      const { success } = await updatePersonalInfo(personalForm.value)

      if (success) {
        isEditingPersonal.value = false
      }
    } catch (error) {
      console.error('Error saving personal info:', error)
    } finally {
      isSaving.value = false
    }
  }

  const saveFinancialInfo = async () => {
    try {
      isSaving.value = true

      const { success } = await updateFinancialInfo(financialForm.value)

      if (success) {
        isEditingFinancial.value = false
      }
    } catch (error) {
      console.error('Error saving financial info:', error)
    } finally {
      isSaving.value = false
    }
  }

  // Reactive title
  useHead({
    title: 'Profile - FinHub'
  })
  const endDate = computed(() =>
    user.value.trialEndsAt ? new Date(user.value.trialEndsAt) : new Date()
  )
  const startDate = computed(() =>
    user.value.createdAt ? new Date(user.value.createdAt) : new Date()
  )
</script>

<template>
  <div class="profile-page">
    <!-- Main Profile Header -->
    <ProfileHeader
      :user="{
        displayName: user.displayName || '',
        email: user.email || '',
        photo: user.photo || '',
        phoneNumber: user.phoneNumber || '',
        status: user.status ? 'active' : 'inactive'
      }"
      :is-verified="true"
      status-text="Cuenta Activa"
      plan-label="Nivel Pro"
    />

    <div class="profile-page__container">
      <!-- Two Column Layout: Personal Info + Financial Profile -->
      <div class="profile-page__grid">
        <!-- Personal Information Card -->
        <EditableInfoCard
          title="Información Personal"
          icon="person"
          icon-container-class="bg-secondary-100 text-secondary-600"
          :is-editing="isEditingPersonal"
          :show-edit-button="!isEditingPersonal"
          @edit="startEditingPersonal"
        >
          <template #view>
            <div class="profile-page__info-list">
              <ProfileInfoItem
                label="Nombre para mostrar"
                :value="user?.displayName"
                fallback="Miguel"
              />
              <ProfileInfoItem
                label="Correo Electrónico"
                :value="user?.email"
                fallback="miguel@ejemplo.com"
              />
              <ProfileInfoItem label="Teléfono" :value="user.phoneNumber" fallback="220138076" />
              <ProfileInfoItem
                label="Género"
                :value="getGenderLabel(user.gender || '')"
                fallback="Masculino"
              />
              <ProfileInfoItem
                label="País"
                :value="`${getCountryFlag(user.country!)} ${getCountryLabel(user.country!)}`"
                fallback="Colombia"
              />
            </div>
          </template>

          <!-- Edit Personal Form -->
          <template #edit>
            <EditSectionActions
              title="Editar Información Personal"
              :is-saving="isSaving"
              @cancel="cancelPersonalEdit"
              @save="savePersonalInfo"
            />
            <div class="profile-page__form">
              <Input
                v-model="personalForm.displayName"
                name="displayName"
                label="Nombre completo"
                placeholder="Tu nombre completo"
              />
              <Input
                v-model="personalForm.email"
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                :disabled="true"
              />
              <Input
                v-model="personalForm.phone"
                name="phone"
                type="tel"
                label="Teléfono"
                placeholder="+57 300 123 4567"
              />
              <Select
                v-model="personalForm.gender"
                name="gender"
                label="Género"
                :options="genderOptions"
              />
              <Select
                v-model="personalForm.country"
                name="country"
                label="País"
                :options="countryOptions"
              />
            </div>
          </template>
        </EditableInfoCard>

        <!-- Financial Profile Card -->
        <EditableInfoCard
          title="Perfil Financiero"
          icon="account_balance"
          icon-container-class="bg-success-100 text-success-600"
          variant="compact"
          :is-editing="isEditingFinancial"
          :show-edit-button="!isEditingFinancial"
          @edit="startEditingFinancial"
        >
          <template #view>
            <div class="profile-page__info-list">
              <ProfileInfoItem label="Moneda Predeterminada">
                <Text as="span" size="sm" weight="medium" class="profile-page__currency-text">
                  {{ finances.currency || 'COP' }} —
                  {{ getCurrencyName(finances.currency) || 'Peso Colombiano' }}
                </Text>
              </ProfileInfoItem>
              <ProfileInfoItem label="Perfil">
                <Badge variant="warning" size="sm">
                  {{ finances.profile }}
                </Badge>
              </ProfileInfoItem>
              <ProfileInfoItem label="Tipo de Uso">
                <Badge class="profile-page__usage-badge" variant="secondary" size="sm">
                  {{ finances.usage || 'Personal' }}
                </Badge>
              </ProfileInfoItem>
            </div>
          </template>

          <!-- Edit Financial Form -->
          <template #edit>
            <EditSectionActions
              title="Editar Información Financiera"
              :is-saving="isSaving"
              @cancel="cancelFinancialEdit"
              @save="saveFinancialInfo"
            />
            <div class="profile-page__form">
              <Select
                v-model="financialForm.currency"
                name="currency"
                label="Moneda preferida"
                :options="currencyOptions"
              />
              <Select
                v-model="financialForm.profile"
                name="profile"
                label="Perfil de riesgo"
                :options="riskOptions"
              />
              <Select
                v-model="financialForm.usage"
                name="usage"
                label="Uso principal"
                :options="usageOptions"
              />
            </div>
          </template>
        </EditableInfoCard>
      </div>

      <!-- Account Status Card - Full Width -->
      <AccountInfoSection
        :account-info="{
          accountType: 'Gratuita',
          status: user.status ? 'active' : 'inactive',
          expirationDate: user.trialEndsAt ? DateUtils.formatDate(endDate) : 'No especificada',
          progress: DateUtils.getProgress(startDate, endDate).percentage,
          progressText: `Quedan ${DateUtils.getProgress(startDate, endDate).remainingDays} días de prueba`,
          isPromo: false
        }"
        @manage-subscription="() => {}"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .profile-page {
    @apply min-h-screen bg-slate-50;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .profile-page__container {
    @apply mx-auto px-6 py-6;
  }

  .profile-page__grid {
    @apply mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2;
  }

  .profile-page__info-list {
    @apply divide-y divide-slate-100;
  }

  .profile-page__form {
    @apply grid grid-cols-1 gap-4;
  }

  .profile-page__currency-text {
    @apply text-right;
  }

  .profile-page__usage-badge {
    @apply uppercase;
  }
</style>
