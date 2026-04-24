<!--
  Basic Information Form
  Organism component for collecting basic user information during onboarding
-->

<script setup lang="ts">
  /**
   * BasicInformationForm Component
   * Collects user basic information during onboarding
   */

  import { Label } from '@/components/atoms'
  import { Select } from '@/components/molecules'
  import { DIAL_CODE_OPTIONS, GENDER_OPTIONS, ON_BOARDING_CONFIG } from '~/common/constants'
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
      gender: 'prefer_not_to_say' as 'male' | 'female' | 'prefer_not_to_say'
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
  const formModel = ref<BasicInformationData & { dialCode: string; phoneNumber: string }>({
    ...props.modelValue,
    displayName: prefillDisplayName,
    email: prefillEmail,
    gender: userStore.userInfo.gender ?? 'prefer_not_to_say',
    dialCode: '+57',
    phoneNumber: ''
  })

  // Computed phone combining dial code and number
  const fullPhone = computed(() => `${formModel.value.dialCode}${formModel.value.phoneNumber}`)

  // Validation state
  const errors = ref<Record<string, string>>({})
  const isValid = ref(false)

  // Validation rules (only for editable fields)
  const validationRules = {
    displayName: (value: string) => {
      if (!value.trim()) return 'El nombre es requerido'
      if (value.trim().length < 2) return 'Mínimo 2 caracteres'
      if (value.length > 50) return 'Máximo 50 caracteres'
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value))
        return 'Solo se permiten letras y espacios'
      return null
    },
    phoneNumber: (value: string) => {
      if (!value.trim()) return 'El número de teléfono es requerido'
      if (!/^\d+$/.test(value)) return 'Solo se permiten números'
      if (value.length < 7 || value.length > 15)
        return 'El teléfono debe tener entre 7 y 15 dígitos'
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
      formModel.value.phoneNumber.trim().length >= 7

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
      emit('update:modelValue', {
        displayName: newValue.displayName,
        email: newValue.email,
        phone: fullPhone.value,
        gender: newValue.gender
      })
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
  <form class="basic-information-form space-y-4" @submit.prevent>
    <AlertBanner icon="info" variant="warning" :title="ON_BOARDING_CONFIG.personalInfo.banner" />

    <div class="flex-col gap-2">
      <!-- Display Name -->
      <div class="form-field">
        <Input
          id="displayName"
          v-model="formModel.displayName"
          name="displayName"
          type="text"
          placeholder="Ej. Juan Pérez"
          label="¿Como quieres que te llamemos?"
          :error="errors.displayName"
          required
          @blur="validateField('displayName')"
          @input="validateField('displayName')"
        />
      </div>

      <!-- Phone -->
      <div class="form-field">
        <Label variant="form" size="sm" weight="bold" color="black" require>Teléfono</Label>
        <div class="flex gap-2">
          <Select
            v-model="formModel.dialCode"
            name="dialCode"
            :options="DIAL_CODE_OPTIONS"
            placeholder="+57"
            class="w-32 flex-shrink-0"
          />
          <Input
            id="phoneNumber"
            v-model="formModel.phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="300 123 4567"
            :error="errors.phoneNumber"
            required
            @blur="validateField('phoneNumber')"
            @input="validateField('phoneNumber')"
          />
        </div>
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
    @apply mx-auto box-content h-96 min-h-96 w-full max-w-2xl space-y-4 overflow-y-auto px-1;
  }
  .basic-information-form__fields {
    @apply space-y-4;
  }
  .form-field {
    @apply mb-4;
  }
  .form-field__helper {
    @apply mt-1 text-xs text-neutral-400;
  }
</style>
