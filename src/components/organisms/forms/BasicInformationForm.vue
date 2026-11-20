<script setup lang="ts">
  import Label from '@/components/atoms/typography/Label.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { useUserApi } from '@/composables/api/useUserApi'
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
      handle: '',
      email: '',
      phone: '',
      gender: 'prefer_not_to_say' as 'male' | 'female' | 'prefer_not_to_say'
    })
  })

  const emit = defineEmits<BasicInformationFormEmits>()

  const userStore = useUserStore()
  const { checkPhoneAvailability } = useUserApi()

  const prefillDisplayName =
    userStore.userInfo.name ?? userStore.displayName ?? props.modelValue?.displayName ?? ''
  const prefillEmail = userStore.userInfo.email
    ? userStore.userInfo.email
    : (props.modelValue?.email ?? '')

  const formModel = ref<BasicInformationData & { dialCode: string; phoneNumber: string }>({
    ...props.modelValue,
    displayName: prefillDisplayName,
    handle: props.modelValue?.handle ?? '',
    email: prefillEmail,
    gender: userStore.userInfo.gender ?? 'prefer_not_to_say',
    dialCode: '+57',
    phoneNumber: ''
  })

  const fullPhone = computed(() => `${formModel.value.dialCode}${formModel.value.phoneNumber}`)

  const errors = ref<Record<string, string>>({})
  const isValid = ref(false)
  const isCheckingPhone = ref(false)
  const phoneAvailable = ref<boolean | null>(null)
  let phoneCheckTimer: ReturnType<typeof setTimeout> | null = null
  const handleTouched = ref(false)

  /* --------------------------------------------------
   * Handle: auto-suggest desde el displayName
   * -------------------------------------------------- */
  function suggestHandle(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/^[^a-z]+/, '')
      .slice(0, 20)
  }

  function onHandleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value
    const cleaned = raw
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20)
    formModel.value.handle = cleaned
    ;(e.target as HTMLInputElement).value = cleaned
    handleTouched.value = true
    validateField('handle')
  }

  watch(
    () => formModel.value.displayName,
    newName => {
      if (!handleTouched.value) {
        const suggestion = suggestHandle(newName)
        if (suggestion.length >= 1) {
          formModel.value.handle = suggestion
        }
      }
    }
  )

  /* --------------------------------------------------
   * Validación
   * -------------------------------------------------- */
  const validationRules = {
    displayName: (value: string) => {
      if (!value.trim()) return 'El nombre es requerido'
      if (value.trim().length < 2) return 'Mínimo 2 caracteres'
      if (value.length > 50) return 'Máximo 50 caracteres'
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras y espacios'
      return null
    },
    handle: (value: string) => {
      if (!value.trim()) return 'El nombre de usuario es requerido'
      if (value.length < 3) return 'Mínimo 3 caracteres'
      if (value.length > 20) return 'Máximo 20 caracteres'
      if (!/^[a-z]/.test(value)) return 'Debe comenzar con una letra'
      if (!/^[a-z][a-z0-9_]*$/.test(value)) return 'Solo letras minúsculas, números y guiones bajos'
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
    const handleValid = !validationRules.handle(formModel.value.handle)
    const hasRequiredFields =
      formModel.value.displayName.trim() &&
      formModel.value.email.trim() &&
      formModel.value.phoneNumber.trim().length >= 7 &&
      handleValid

    isValid.value =
      !hasErrors && !!hasRequiredFields && phoneAvailable.value === true && !isCheckingPhone.value
    emit('valid', isValid.value)
  }

  const runPhoneCheck = async () => {
    try {
      const result = await checkPhoneAvailability(fullPhone.value)
      phoneAvailable.value = result?.available ?? null
      if (phoneAvailable.value === false) {
        errors.value.phoneNumber = 'Este número ya está registrado'
      }
    } catch {
      phoneAvailable.value = null
    } finally {
      isCheckingPhone.value = false
      updateFormValidity()
    }
  }

  watch(
    () => [formModel.value.phoneNumber, formModel.value.dialCode] as const,
    () => {
      if (phoneCheckTimer) clearTimeout(phoneCheckTimer)

      const formatError = validationRules.phoneNumber(formModel.value.phoneNumber)
      if (formatError) {
        phoneAvailable.value = null
        isCheckingPhone.value = false
        updateFormValidity()
        return
      }

      isCheckingPhone.value = true
      phoneAvailable.value = null
      errors.value.phoneNumber = ''
      updateFormValidity()
      phoneCheckTimer = setTimeout(runPhoneCheck, 600)
    }
  )

  const validateAllFields = () => {
    Object.keys(validationRules).forEach(field => {
      validateField(field as keyof typeof validationRules)
    })
    updateFormValidity()
  }

  defineExpose({ validateAllFields })

  watch(
    formModel,
    newValue => {
      userStore.displayName = newValue.displayName
      emit('update:modelValue', {
        displayName: newValue.displayName,
        handle: newValue.handle,
        email: newValue.email,
        phone: fullPhone.value,
        gender: newValue.gender
      })
      updateFormValidity()
    },
    { deep: true }
  )

  onMounted(() => {
    updateFormValidity()
  })
</script>

<template>
  <form class="basic-information-form" @submit.prevent>
    <AlertBanner icon="info" variant="warning" :title="ON_BOARDING_CONFIG.personalInfo.banner" />

    <div class="basic-information-form__fields">
      <!-- Nombre -->
      <div class="form-field">
        <Input
          id="displayName"
          v-model="formModel.displayName"
          name="displayName"
          type="text"
          placeholder="Ej. Juan Pérez"
          label="¿Cómo quieres que te llamemos?"
          :error="errors.displayName"
          required
          @blur="validateField('displayName')"
          @input="validateField('displayName')"
        />
      </div>

      <!-- Handle (@usuario) -->
      <div class="form-field">
        <Label variant="form" size="sm" weight="bold" color="black" require>
          Nombre de usuario
        </Label>
        <div class="handle-input" :class="{ 'handle-input--error': !!errors.handle }">
          <span class="handle-input__at">@</span>
          <input
            v-model="formModel.handle"
            type="text"
            name="handle"
            placeholder="tunombre"
            autocomplete="username"
            maxlength="20"
            class="handle-input__field"
            @input="onHandleInput"
            @blur="
              validateField('handle')
              handleTouched = true
            "
          />
        </div>
        <p v-if="errors.handle" class="handle-input__error-msg">{{ errors.handle }}</p>
        <div v-else class="handle-info">
          <span class="material-symbols-outlined handle-info__icon">group</span>
          <p class="handle-info__text">
            Con tu @usuario tus amigos podrán encontrarte, agregar gastos compartidos y enviarte
            pagos. Solo letras minúsculas, números y guiones bajos ( _ ).
          </p>
        </div>
      </div>

      <!-- Teléfono -->
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
          <div class="phone-input-wrapper">
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
            <span v-if="isCheckingPhone" class="phone-status">
              <span class="phone-status__spinner" />
            </span>
            <span v-else-if="phoneAvailable === true" class="phone-status">
              <span class="material-symbols-outlined phone-status__icon--ok">check_circle</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Género -->
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
    @apply mx-auto w-full max-w-2xl space-y-4 px-1;
  }

  .basic-information-form__fields {
    @apply space-y-4;
  }

  .form-field {
    @apply mb-1;
  }

  /* ── Handle input ── */
  .handle-input {
    @apply mt-1 flex items-stretch overflow-hidden rounded-lg border border-neutral-300;
    @apply transition-colors duration-150;
    @apply focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500;
  }

  .handle-input--error {
    @apply border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500;
  }

  .handle-input__at {
    @apply flex items-center border-r border-neutral-300 bg-neutral-50 px-3;
    @apply select-none font-mono text-sm font-bold text-primary-600;
    @apply dark:border-neutral-600 dark:bg-neutral-700 dark:text-primary-400;
  }

  .handle-input__field {
    @apply flex-1 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none;
    @apply placeholder-neutral-400;
    @apply dark:text-white;
  }

  .handle-input__error-msg {
    @apply mt-1 text-xs text-danger-600;
  }

  .handle-info {
    @apply mt-2 flex items-start gap-1.5;
  }

  .handle-info__icon {
    @apply mt-px flex-shrink-0 text-sm text-neutral-400;
    font-size: 14px;
  }

  .handle-info__text {
    @apply text-xs leading-relaxed text-neutral-500;
  }

  /* ── Phone ── */
  .phone-input-wrapper {
    @apply relative flex-1;
  }

  .phone-status {
    @apply absolute right-3 top-1/2 -translate-y-1/2;
  }

  .phone-status__spinner {
    @apply block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary-500;
  }

  .phone-status__icon--ok {
    @apply text-base text-success-600;
  }
</style>
