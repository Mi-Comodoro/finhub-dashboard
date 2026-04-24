<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'
  import { Input, NumberInput, Select } from '@/components/molecules'
  import { FINANCIAL_PROFILE_OPTIONS } from '~/common/constants'

  import type {
    FinancesData,
    FinancesDataFormEmits,
    FinancesDataFormProps
  } from './types/financial-goals-form.types'

  const props = withDefaults(defineProps<FinancesDataFormProps>(), {
    modelValue: () => ({
      currency: 'COP',
      profile: 'employee',
      accountName: '',
      interestRate: 0
    })
  })
  const isValid = ref(false)
  const errors = ref<Record<string, string>>({})
  const emit = defineEmits<FinancesDataFormEmits>()
  const updateFormValidity = () => {
    const hasErrors = Object.values(errors.value).some(e => !!e)
    const hasRequiredFields =
      formModel.value.currency.trim() &&
      formModel.value.profile &&
      formModel.value.accountName?.trim() &&
      formModel.value.accountName.trim().length >= 3 &&
      formModel.value.interestRate !== undefined &&
      formModel.value.interestRate >= 0 &&
      formModel.value.interestRate <= 100

    isValid.value = !hasErrors && !!hasRequiredFields
    emit('valid', isValid.value)
  }

  // Form model
  const formModel = ref<FinancesData>({
    ...props.modelValue,
    accountName: '',
    interestRate: 0
  })

  // Emit model changes
  watch(
    formModel,
    newValue => {
      updateFormValidity()
      emit('update:modelValue', {
        ...newValue
      })
    },
    { deep: true }
  )

  // Emit initial default values when component mounts
  // This ensures the wizard knows about the default selections
  onMounted(() => {
    emit('update:modelValue', {
      ...formModel.value
    })
  })
</script>
<template>
  <form class="finances-config-form" @submit.prevent>
    <div class="space-y-4">
      <!-- Fila 1 -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div class="form-field">
          <Label size="sm" weight="bold" variant="form" require>Moneda</Label>
          <Select
            v-model="formModel.currency"
            name="currency"
            :options="[
              { label: 'COP', value: 'COP' },
              { label: 'USD', value: 'USD' }
            ]"
            placeholder="Seleccionar"
          />
        </div>

        <div class="form-field">
          <Label size="sm" weight="bold" variant="form" require>Perfil</Label>
          <Select
            v-model="formModel.profile"
            name="profile"
            :options="FINANCIAL_PROFILE_OPTIONS"
            placeholder="Seleccionar"
          />
        </div>
      </div>

      <!-- Fila 2 -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          v-model="formModel.accountName"
          name="accountName"
          placeholder="Cuenta principal"
          label="Cuenta"
          required
        />

        <NumberInput
          v-model="formModel.interestRate"
          name="interestRate"
          placeholder="0.00"
          label="Interés (%)"
          required
        />
      </div>

      <!-- Helper pequeño -->
      <p class="form-helper">Usa un nombre simple para identificar tu cuenta principal.</p>
    </div>
  </form>
</template>

<style scoped lang="postcss">
  .finances-config-form {
    @apply mx-auto w-full max-w-2xl space-y-6;
  }

  .form-field {
    @apply space-y-2;
  }

  .form-helper {
    @apply text-sm leading-relaxed text-neutral-500;
  }
</style>
