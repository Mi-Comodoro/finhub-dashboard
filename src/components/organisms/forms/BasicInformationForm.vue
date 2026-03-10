<!--
  Basic Information Form
  Organism component for collecting basic user information during onboarding
-->

<script setup lang="ts">
  /**
   * BasicInformationForm Component
   * Collects user basic information during onboarding
   */

  import { Select } from '@/components/molecules'
  import { useUserStore } from '~/stores/user.store'

  interface BasicInformationData {
    displayName: string
    email: string
    phone: string
    gender: 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY' | ''
  }

  interface Props {
    modelValue?: BasicInformationData
  }

  interface Emits {
    'update:modelValue': [value: BasicInformationData]
    valid: [isValid: boolean]
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({
      displayName: '',
      email: '',
      phone: '',
      gender: ''
    })
  })

  const emit = defineEmits<Emits>()

  const userStore = useUserStore()

  // Pre-fill from store, falling back to prop
  const prefillDisplayName =
    userStore.userInfo.name ?? userStore.displayName ?? props.modelValue?.displayName ?? ''
  const prefillEmail = userStore.userInfo.email
    ? userStore.userInfo.email
    : (props.modelValue?.email ?? '')

  // Form model
  const formModel = ref<BasicInformationData>({
    ...props.modelValue,
    displayName: prefillDisplayName,
    email: prefillEmail
  })

  // Validation state
  const errors = ref<Record<string, string>>({})
  const isValid = ref(false)

  // Gender options
  const genderOptions = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decirlo' }
  ]

  // Validation rules (only for editable fields)
  const validationRules = {
    phone: (value: string) => {
      if (!value.trim()) return 'El teléfono es requerido'
      return null
    },
    gender: (value: string) => {
      if (!value) return 'El género es requerido'
      return null
    }
  }

  const validateField = (field: keyof typeof validationRules) => {
    const rule = validationRules[field]
    const error = rule(formModel.value[field] as string)
    errors.value[field] = error ?? ''
    updateFormValidity()
  }

  const updateFormValidity = () => {
    const hasErrors = Object.values(errors.value).some(e => !!e)
    const hasRequiredFields =
      formModel.value.displayName.trim() &&
      formModel.value.email.trim() &&
      formModel.value.phone.trim() &&
      formModel.value.gender

    isValid.value = !hasErrors && !!hasRequiredFields
    emit('valid', isValid.value)
  }

  // Emit model changes to parent without re-validating eagerly
  watch(
    formModel,
    newValue => {
      emit('update:modelValue', { ...newValue })
    },
    { deep: true }
  )
</script>
<template>
  <form class="basic-information-form space-y-6" @submit.prevent>
    <div class="space-y-4">
      <!-- Display Name (read-only, pre-filled from store) -->
      <div class="form-field">
        <Input
          id="displayName"
          v-model="formModel.displayName"
          name="displayName"
          type="text"
          placeholder="Ej. Juan Pérez"
          label="Nombre para Mostrar"
        />
        <Text as="p" size="xs" color="muted" class="mt-1">Nombre registrado en tu cuenta</Text>
      </div>

      <!-- Email (read-only, pre-filled from store) -->
      <div class="form-field">
        <Input
          id="email"
          v-model="formModel.email"
          name="email"
          type="email"
          placeholder="juan@example.com"
          label="Email"
          :readonly="formModel.email.trim() !== ''"
        />
        <Text as="p" size="xs" color="muted" class="mt-1">Tu correo electrónico registrado</Text>
      </div>

      <!-- Phone -->
      <div class="form-field">
        <Input
          id="phone"
          v-model="formModel.phone"
          name="phone"
          type="tel"
          placeholder="+57 300 123 4567"
          :error="errors.phone"
          label="Teléfono"
          required
          @blur="validateField('phone')"
        />
        <Text as="p" size="xs" color="muted" class="mt-1">
          Para notificaciones de seguridad y recordatorios
        </Text>
      </div>

      <!-- Gender -->
      <div v-if="!userStore.userInfo.gender" class="form-field">
        <Select
          v-model="formModel.gender"
          name="gender"
          label="Género"
          :options="genderOptions"
          :error="!!errors.gender"
          :error-message="errors.gender"
          required
          @update:model-value="validateField('gender')"
        />
        <Text as="p" size="xs" color="muted" class="mt-1">
          Nos ayuda a personalizar tu experiencia
        </Text>
      </div>
    </div>
  </form>
</template>
<style scoped>
  /* Helper text now uses Text atom and Tailwind classes directly. */
</style>
