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
  import { GENDER_OPTIONS } from '~/common/constants'
  import { useUserStore } from '~/stores/user.store'

  import type {
    BasicInformationData,
    BasicInformationFormEmits,
    BasicInformationFormProps
  } from './types/basic-information-form.types'

  const props = withDefaults(defineProps<BasicInformationFormProps>(), {
    modelValue: () => ({
      displayName: '',
      email: '',
      phone: '',
      gender: ''
    })
  })

  const emit = defineEmits<BasicInformationFormEmits>()

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
      formModel.value.phone.trim()

    isValid.value = !hasErrors && !!hasRequiredFields
    emit('valid', isValid.value)
  }

  /**
   * Validate all fields and emit validity state
   */
  const validateAllFields = () => {
    Object.keys(validationRules).forEach(field => {
      validateField(field as keyof typeof validationRules)
    })
    updateFormValidity()
  }

  // Optionally, expose for parent or use internally
  defineExpose({ validateAllFields })
  // Emit model changes to parent without re-validating eagerly
  watch(
    formModel,
    newValue => {
      userStore.displayName = newValue.displayName
      emit('update:modelValue', { ...newValue })
      updateFormValidity()
    },
    { deep: true }
  )
  onMounted(() => {
    // Trigger initial validation so parent receives correct validity state
    updateFormValidity()
  })
</script>
<template>
  <form class="basic-information-form space-y-6" @submit.prevent>
    <div class="flex-col gap-2">
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
          @input="validateField('phone')"
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
          :options="GENDER_OPTIONS"
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

<style scoped lang="postcss">
  .basic-information-form {
    @apply box-content h-96 min-h-96 space-y-6 overflow-y-auto px-1;
  }
  .basic-information-form__fields {
    @apply space-y-4;
  }
  .form-field {
    @apply mb-4;
  }
  .form-field__helper {
    @apply mt-1 text-xs text-gray-400;
  }
</style>
