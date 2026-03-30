<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'
  import { DatePickerInput, Select } from '@/components/molecules'

  import type {
    FinancesData,
    FinancesDataFormEmits,
    FinancesDataFormProps
  } from './types/financial-goals-form.types'

  const props = withDefaults(defineProps<FinancesDataFormProps>(), {
    modelValue: () => ({
      currency: 'COP',
      profile: undefined
    })
  })
  const isValid = ref(false)
  const errors = ref<Record<string, string>>({})
  const emit = defineEmits<FinancesDataFormEmits>()
  const updateFormValidity = () => {
    const hasErrors = Object.values(errors.value).some(e => !!e)
    const hasRequiredFields =
      formModel.value.currency.trim() && formModel.value.budgetFrequency === 'monthly'
        ? formModel.value.monthPayment
        : formModel.value.biweeklyPayments.length === 2 &&
          formModel.value.biweeklyPayments[0] !== null &&
          formModel.value.biweeklyPayments[1] !== null

    isValid.value = !hasErrors && !!hasRequiredFields
    emit('valid', isValid.value)
  }

  // Form model
  const initialModel = props.modelValue as FinancesData & {
    monthPayment?: Date | undefined | null
    biweeklyPayments?: BiweeklyPayments | undefined | null
  }
  const formModel = ref<
    FinancesData & {
      monthPayment: Date | null
      biweeklyPayments: BiweeklyPayments
    }
  >({
    ...initialModel,
    monthPayment: initialModel?.monthPayment ?? null,
    biweeklyPayments: initialModel?.biweeklyPayments ?? [null, null]
  })

  // Computed para mostrar campos de fechas de pago
  const showPaymentDates = computed(() => {
    return (
      formModel.value.budgetFrequency === 'monthly' ||
      formModel.value.budgetFrequency === 'biweekly'
    )
  })
  type BiweeklyPayments = [Date | null, Date | null]
  watch(
    () => props.modelValue,
    newValue => {
      if (!newValue) return
      const typedValue = newValue as FinancesData & {
        monthPayment?: Date | undefined
        biweeklyPayments?: BiweeklyPayments | undefined
      }
      formModel.value = {
        ...typedValue,

        monthPayment: typedValue?.monthPayment ?? formModel.value.monthPayment,
        biweeklyPayments: [
          typedValue?.biweeklyPayments?.[0] ?? formModel.value.biweeklyPayments[0],
          typedValue?.biweeklyPayments?.[1] ?? formModel.value.biweeklyPayments[1]
        ]
      }
    },
    { deep: true }
  )

  // Computed properties

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
  const handleChangeBudgetFrequency = () => {
    formModel.value.budgetFrequency = '' as 'monthly' | 'biweekly'
    formModel.value.monthPayment = null
    formModel.value.biweeklyPayments = [null, null]
  }

  const frequencyOptions = computed(() =>
    !formModel.value.budgetFrequency
      ? [
          {
            label: 'Mensual',
            value: 'monthly',
            title: 'Mensual',
            description: 'Una vez al mes',
            badge: 'Recomendado',
            icon: 'calendar_month'
          },
          {
            label: 'Quincenal',
            value: 'biweekly',
            title: 'Quincenal',
            description: '2 veces al mes',
            icon: 'payments'
          }
        ]
      : formModel.value.budgetFrequency === 'monthly'
        ? [
            {
              label: 'Mensual',
              value: 'monthly',
              title: 'Mensual',
              description: 'Una vez al mes',
              badge: 'Recomendado',
              icon: 'calendar_month'
            }
          ]
        : [
            {
              label: 'Quincenal',
              value: 'biweekly',
              title: 'Quincenal',
              description: '2 veces al mes',
              icon: 'payments'
            }
          ]
  )
</script>
<template>
  <form class="finances-config-form" @submit.prevent>
    <div class="space-y-4">
      <!-- Currency -->
      <div class="form-field">
        <Label variant="form" size="sm" weight="bold" color="black" require>
          Selecciona tu moneda
        </Label>
        <Select
          id="currency"
          v-model="formModel.currency"
          name="currency"
          :options="[
            { label: 'Pesos Colombianos (COP)', value: 'COP' },
            { label: 'Dólares Americanos (USD)', value: 'USD' }
          ]"
          placeholder="Selecciona tu moneda"
        />
      </div>

      <!-- Budget Frequency -->
      <div v-if="!formModel.budgetFrequency" class="form-field">
        <Label variant="form" size="sm" color="black" require>
          ¿Con qué frecuencia quieres configurar tu presupuesto?
        </Label>

        <RadioButton
          v-model="formModel.budgetFrequency"
          name="budgetFrequency"
          variant="card"
          direction="row"
          class="w-full"
          :options="frequencyOptions"
        />
      </div>
      <!-- Fechas de pago -->
      <div v-if="showPaymentDates" class="form-field">
        <div v-if="formModel.budgetFrequency === 'monthly'" class="min-w-full">
          <Label
            variant="form"
            size="sm"
            color="black"
            weight="bold"
            class-name="form-field__label"
          >
            Fecha de pago
          </Label>
          <DatePickerInput
            v-model="formModel.monthPayment"
            mode="single"
            :placeholder="'Selecciona tu fecha de pago'"
          />
        </div>
        <div v-else-if="formModel.budgetFrequency === 'biweekly'" class="flex min-w-full gap-4">
          <div class="flex-1 flex-col">
            <Label variant="form" size="sm" color="black" class-name="form-field__label">
              Primera Fecha de pago
            </Label>
            <DatePickerInput
              v-model="formModel.biweeklyPayments[0]"
              mode="single"
              :placeholder="'Selecciona tu fecha de pago'"
            />
          </div>
          <div class="flex-1 flex-col">
            <Label variant="form" size="sm" color="black" class-name="form-field__label">
              Segunda Fecha de pago
            </Label>
            <DatePickerInput
              v-model="formModel.biweeklyPayments[1]"
              mode="single"
              :placeholder="'Selecciona tu fecha de pago'"
            />
          </div>
        </div>
      </div>

      <CardSummary
        v-if="formModel.budgetFrequency"
        title="Frecuencia de Presupuesto"
        :sub-title="
          formModel.budgetFrequency === 'monthly'
            ? 'Mensual'
            : formModel.budgetFrequency === 'biweekly'
              ? 'Quincenal'
              : ''
        "
        action="Cambiar"
        @action="handleChangeBudgetFrequency"
      />
    </div>
  </form>
</template>

<style scoped lang="postcss">
  .finances-config-form {
    @apply mx-auto box-content min-h-fit w-full max-w-2xl space-y-6 overflow-y-auto;
  }
  .form-field {
    @apply w-full px-2;
  }

  .form-field__helper {
    @apply mt-1 text-xs text-neutral-400;
  }
</style>
