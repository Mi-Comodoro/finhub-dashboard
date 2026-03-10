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
  import { useAuthStore } from '~/stores/auth.store'
  import { useFinancesStore } from '~/stores/finances.store'
  import { useUserStore } from '~/stores/user.store'
  import DateUtils from '~/utils/date'
  definePageMeta({
    layout: 'dashboard',
    middleware: 'dashboard'
  })

  // Stores
  const userStore = useUserStore()
  const financesStore = useFinancesStore()
  const authStore = useAuthStore()

  // Reactive data
  const isEditingPersonal = ref(false)
  const isEditingFinancial = ref(false)
  const isSaving = ref(false)

  // Form data - initialize from stores
  const personalForm = ref({
    displayName: userStore.displayName || '',
    email: userStore.email || '',
    phone: userStore.phone || '',
    gender: userStore.gender || '',
    country: userStore.country || ''
  })

  const financialForm = ref({
    currency: financesStore.defaultCurrency,
    profile: financesStore.financialProfile,
    usage: financesStore.financialUsage
  })

  // Computed
  const user = computed(() => ({
    displayName: userStore.displayName,
    email: userStore.email,
    photo: userStore.photo,
    phoneNumber: userStore.phone,
    status: userStore.isActive
  }))

  const finances = computed(() => financesStore.profile)

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
    () => [
      userStore.displayName,
      userStore.email,
      userStore.phone,
      userStore.gender,
      userStore.country
    ],
    () => {
      personalForm.value = {
        displayName: userStore.displayName || '',
        email: userStore.email || '',
        phone: userStore.phone || '',
        gender: userStore.gender || '',
        country: userStore.country || ''
      }
    },
    { immediate: true }
  )

  watch(
    () => [
      financesStore.defaultCurrency,
      financesStore.financialProfile,
      financesStore.financialUsage
    ],
    () => {
      financialForm.value = {
        currency: financesStore.defaultCurrency,
        profile: financesStore.financialProfile,
        usage: financesStore.financialUsage
      }
    },
    { immediate: true }
  )

  // Methods
  const startEditingPersonal = () => {
    personalForm.value = {
      displayName: userStore.displayName || '',
      email: userStore.email || '',
      phone: userStore.phone || '',
      gender: userStore.gender || '',
      country: userStore.country || ''
    }
    isEditingPersonal.value = true
  }

  const startEditingFinancial = () => {
    financialForm.value = {
      currency: financesStore.defaultCurrency,
      profile: financesStore.financialProfile,
      usage: financesStore.financialUsage
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

      if (!userStore.id) {
        console.error('User ID is required to update profile')
        return
      }

      userStore.setUser({
        id: userStore.id,
        name: userStore.userInfo.name || '',
        displayName: personalForm.value.displayName,
        email: personalForm.value.email,
        phone: personalForm.value.phone,
        gender: personalForm.value.gender,
        country: personalForm.value.country,
        photo: userStore.photo || '',
        trialEndsAt: userStore.trialEndsAt || undefined,
        isActive: userStore.isActive
      })

      isEditingPersonal.value = false
    } catch (error) {
      console.error('Error saving personal info:', error)
    } finally {
      isSaving.value = false
    }
  }

  const saveFinancialInfo = async () => {
    try {
      isSaving.value = true

      if (financesStore.financialProfile) {
        financesStore.updateFinancialProfile({
          currency: financialForm.value.currency,
          profile: financialForm.value.profile,
          usage: financialForm.value.usage
        })
      }

      financesStore.updateConfig({
        defaultCurrency: financialForm.value.currency
      })

      isEditingFinancial.value = false
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
  const endDate = userStore.trialEndsAt ? new Date(userStore.trialEndsAt) : new Date()
  const startDate = userStore.createdAt ? new Date(userStore.createdAt) : new Date()
</script>

<template>
  <div class="profile-page min-h-screen bg-slate-50">
    <!-- Main Profile Header -->
    <ProfileHeader
      :user="{
        displayName: user.displayName || '',
        email: user.email || '',
        photo: user.photo || authStore.user?.avatar || '',
        phoneNumber: user.phoneNumber || '',
        status: user.status ? 'active' : 'inactive'
      }"
      :is-verified="true"
      status-text="Cuenta Activa"
      plan-label="Nivel Pro"
    />

    <div class="mx-auto px-6 py-6">
      <!-- Two Column Layout: Personal Info + Financial Profile -->
      <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Personal Information Card -->
        <EditableInfoCard
          title="Información Personal"
          icon="person"
          icon-container-class="bg-blue-100 text-blue-600"
          :is-editing="isEditingPersonal"
          :show-edit-button="!isEditingPersonal"
          @edit="startEditingPersonal"
        >
          <template #view>
            <div class="divide-y divide-slate-100">
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
              <ProfileInfoItem label="Teléfono" :value="userStore.phone" fallback="220138076" />
              <ProfileInfoItem
                label="Género"
                :value="getGenderLabel(userStore?.gender || '')"
                fallback="Masculino"
              />
              <ProfileInfoItem
                label="País"
                :value="`${getCountryFlag(userStore.country!)} ${getCountryLabel(userStore.country!)}`"
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
            <div class="grid grid-cols-1 gap-4">
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
          icon-container-class="bg-green-100 text-green-600"
          variant="compact"
          :is-editing="isEditingFinancial"
          :show-edit-button="!isEditingFinancial"
          @edit="startEditingFinancial"
        >
          <template #view>
            <div class="divide-y divide-slate-100">
              <ProfileInfoItem label="Moneda Predeterminada">
                <Text as="span" size="sm" weight="medium" class="text-right">
                  {{ finances?.currency || 'COP' }} —
                  {{ getCurrencyName(finances?.currency) || 'Peso Colombiano' }}
                </Text>
              </ProfileInfoItem>
              <ProfileInfoItem label="Perfil">
                <Badge variant="warning" size="sm">
                  {{ finances?.profile }}
                </Badge>
              </ProfileInfoItem>
              <ProfileInfoItem label="Tipo de Uso">
                <Badge class="uppercase" variant="secondary" size="sm">
                  {{ finances?.usage || 'Personal' }}
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
            <div class="grid grid-cols-1 gap-4">
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
          accountType: authStore.accountType || 'Gratuita',
          status: userStore.isActive ? 'active' : 'inactive',
          expirationDate: userStore.trialEndsAt ? DateUtils.formatDate(endDate) : 'No especificada',
          progress: DateUtils.getProgress(startDate, endDate).percentage,
          progressText: `Quedan ${DateUtils.getProgress(startDate, endDate).remainingDays} días de prueba`,
          isPromo: false
        }"
        @manage-subscription="() => {}"
      />
    </div>
  </div>
</template>

<style scoped>
  .profile-page {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
</style>
