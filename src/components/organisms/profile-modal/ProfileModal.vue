<script setup lang="ts">
  import { ref, watch } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import EditSectionActions from '@/components/molecules/edit-section-actions/EditSectionActions.vue'
  import EditableInfoCard from '@/components/molecules/editable-info-card/EditableInfoCard.vue'
  import Input from '@/components/molecules/input/Input.vue'
  import ProfileInfoItem from '@/components/molecules/profile-info-item/ProfileInfoItem.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useProfileApplication } from '@/composables/application/useProfileApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import { FINANCIAL_PROFILE_OPTIONS, GENDER_OPTIONS } from '~/common/constants'

  defineProps<{ show: boolean }>()
  const emit = defineEmits<{ 'update:show': [value: boolean] }>()

  const { updatePersonalInfo, updateFinancialInfo, user, finances, avatarUrl } =
    useProfileApplication()
  const { success: showSuccess, error: showError } = useFeedback()

  const isEditingPersonal = ref(false)
  const isEditingFinancial = ref(false)
  const isSaving = ref(false)

  const personalForm = ref({
    displayName: '',
    email: '',
    phone: '',
    gender: '',
    country: ''
  })

  const financialForm = ref({
    currency: '',
    profile: '',
    usage: ''
  })

  watch(
    () => user.value,
    u => {
      personalForm.value = {
        displayName: u.displayName || '',
        email: u.email || '',
        phone: u.phoneNumber || '',
        gender: u.gender || '',
        country: u.country || ''
      }
    },
    { immediate: true, deep: true }
  )

  watch(
    () => finances.value,
    f => {
      financialForm.value = { currency: f.currency, profile: f.profile, usage: f.usage }
    },
    { immediate: true, deep: true }
  )

  const countryOptions = [
    { label: 'Colombia', value: 'CO' },
    { label: 'México', value: 'MX' },
    { label: 'Estados Unidos', value: 'US' },
    { label: 'España', value: 'ES' },
    { label: 'Argentina', value: 'AR' },
    { label: 'Chile', value: 'CL' },
    { label: 'Perú', value: 'PE' },
    { label: 'Venezuela', value: 'VE' }
  ]

  const usageOptions = [
    { label: 'Personal', value: 'personal' },
    { label: 'Negocios', value: 'business' },
    { label: 'Familiar', value: 'family' }
  ]

  function getOptionLabel(
    options: { value: string; label: string }[],
    value?: string | null
  ): string {
    return options.find(o => o.value === value)?.label ?? 'No especificado'
  }

  const userInitials = computed(() => {
    const name = user.value.displayName || ''
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  })

  const savePersonalInfo = async () => {
    try {
      isSaving.value = true
      const { success } = await updatePersonalInfo(personalForm.value)
      if (success) {
        isEditingPersonal.value = false
        showSuccess('Perfil actualizado', 'Tu información personal fue guardada correctamente.')
      } else {
        showError('Error al guardar', 'No se pudo actualizar tu información.')
      }
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
        showSuccess('Perfil financiero actualizado', 'Tu configuración fue guardada correctamente.')
      } else {
        showError('Error al guardar', 'No se pudo actualizar tu perfil financiero.')
      }
    } finally {
      isSaving.value = false
    }
  }

  const close = () => emit('update:show', false)
</script>

<template>
  <ModalWizard :show="show" @update:show="emit('update:show', $event)">
    <div class="profile-modal__header">
      <div class="profile-modal__user">
        <div class="profile-modal__avatar">
          <NuxtImg
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="user.displayName ?? 'Avatar'"
            class="profile-modal__avatar-img"
          />
          <span v-else class="profile-modal__avatar-initials">{{ userInitials }}</span>
        </div>
        <div>
          <p class="profile-modal__user-name">
            {{ user.displayName || user.email?.split('@')[0] || 'Usuario' }}
          </p>
          <p class="profile-modal__user-email">{{ user.email }}</p>
        </div>
      </div>
      <button class="profile-modal__close" @click="close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <EditableInfoCard
      title="Información Personal"
      icon="person"
      icon-container-class="bg-secondary-100 text-secondary-600"
      :is-editing="isEditingPersonal"
      :show-edit-button="!isEditingPersonal"
      @edit="isEditingPersonal = true"
    >
      <template #view>
        <ProfileInfoItem label="Nombre para mostrar" :value="user.displayName" />
        <ProfileInfoItem label="Correo" :value="user.email" />
        <ProfileInfoItem label="Teléfono" :value="user.phoneNumber" />
        <ProfileInfoItem label="Género" :value="getOptionLabel(GENDER_OPTIONS, user.gender)" />
        <ProfileInfoItem label="País" :value="getOptionLabel(countryOptions, user.country)" />
      </template>
      <template #edit>
        <EditSectionActions
          title="Editar Información Personal"
          :is-saving="isSaving"
          @cancel="isEditingPersonal = false"
          @save="savePersonalInfo"
        />
        <div class="profile-modal__form">
          <Input
            v-model="personalForm.displayName"
            name="displayName"
            label="Nombre para mostrar"
            placeholder="Como quieres que te llamemos"
          />
          <Input
            v-model="personalForm.email"
            name="email"
            type="email"
            label="Correo electrónico"
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
            :options="GENDER_OPTIONS"
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

    <EditableInfoCard
      title="Perfil Financiero"
      icon="account_balance"
      icon-container-class="bg-success-100 text-success-600"
      :is-editing="isEditingFinancial"
      :show-edit-button="!isEditingFinancial"
      @edit="isEditingFinancial = true"
    >
      <template #view>
        <ProfileInfoItem label="Moneda" :value="finances.currency" fallback="No configurada" />
        <ProfileInfoItem label="Perfil">
          <Badge variant="warning" size="sm">
            {{ getOptionLabel(FINANCIAL_PROFILE_OPTIONS, finances.profile) }}
          </Badge>
        </ProfileInfoItem>
        <ProfileInfoItem label="Tipo de Uso">
          <Badge variant="secondary" size="sm" class="profile-modal__usage-badge">
            {{ getOptionLabel(usageOptions, finances.usage) }}
          </Badge>
        </ProfileInfoItem>
      </template>
      <template #edit>
        <EditSectionActions
          title="Editar Perfil Financiero"
          :is-saving="isSaving"
          @cancel="isEditingFinancial = false"
          @save="saveFinancialInfo"
        />
        <div class="profile-modal__form">
          <Select
            v-model="financialForm.profile"
            name="profile"
            label="Perfil financiero"
            :options="FINANCIAL_PROFILE_OPTIONS"
          />
          <Select
            v-model="financialForm.usage"
            name="usage"
            label="Tipo de uso"
            :options="usageOptions"
          />
        </div>
      </template>
    </EditableInfoCard>
  </ModalWizard>
</template>

<style scoped lang="postcss">
  .profile-modal__header {
    @apply flex items-center justify-between;
  }

  .profile-modal__user {
    @apply flex items-center gap-3;
  }

  .profile-modal__avatar {
    @apply flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-500;
  }

  .profile-modal__avatar-img {
    @apply h-full w-full rounded-full object-cover;
  }

  .profile-modal__avatar-initials {
    @apply text-sm font-semibold text-white;
  }

  .profile-modal__user-name {
    @apply text-sm font-semibold text-neutral-900;
    @apply dark:text-neutral-100;
  }

  .profile-modal__user-email {
    @apply text-xs text-neutral-500;
    @apply dark:text-neutral-400;
  }

  .profile-modal__close {
    @apply flex items-center justify-center rounded-lg p-1.5 text-neutral-400 transition-colors;
    @apply hover:bg-neutral-100 hover:text-neutral-600;
    @apply dark:hover:bg-neutral-700 dark:hover:text-neutral-200;
  }

  .profile-modal__form {
    @apply grid grid-cols-1 gap-4;
  }

  .profile-modal__usage-badge {
    @apply uppercase;
  }
</style>
