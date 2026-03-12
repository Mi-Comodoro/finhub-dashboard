<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import { Label } from '@/components/atoms'
  import { DatePickerInput, Select } from '@/components/molecules'
  import type { DateRange } from '@/types/ui/date-picker.types'

  import type {
    FinancialGoalsData,
    FinancialGoalsFormEmits,
    FinancialGoalsFormProps
  } from './types/financial-goals-form.types'

  const normalizeUsage = (usage?: string): 'personal' | 'shared' => {
    const normalized = (usage || '').toLowerCase()

    if (normalized === 'shared') return 'shared'

    return 'personal'
  }

  const props = withDefaults(defineProps<FinancialGoalsFormProps>(), {
    modelValue: () => ({
      currency: 'COP',
      profile: undefined,
      usage: undefined
    })
  })

  const emit = defineEmits<FinancialGoalsFormEmits>()

  // Form model
  const initialModel = props.modelValue as FinancialGoalsData & {
    paymentDates?: Date | DateRange | null
    monthPayment?: Date | undefined | null
    biweeklyPayments?: BiweeklyPayments | undefined | null
  }
  const formModel = ref<
    FinancialGoalsData & {
      paymentDates: Date | DateRange | undefined
      monthPayment: Date | null
      biweeklyPayments: BiweeklyPayments
    }
  >({
    ...initialModel,
    usage: normalizeUsage(initialModel?.usage),
    monthPayment: initialModel?.monthPayment ?? new Date(),
    biweeklyPayments: initialModel?.biweeklyPayments ?? [null, null],
    paymentDates: initialModel?.paymentDates ?? undefined
  })

  // Computed para mostrar campos de fechas de pago
  const showPaymentDates = computed(() => {
    return (
      formModel.value.budgetFrequency === 'MONTHLY' ||
      formModel.value.budgetFrequency === 'BIWEEKLY'
    )
  })
  type BiweeklyPayments = [Date | null, Date | null]
  watch(
    () => props.modelValue,
    newValue => {
      if (!newValue) return
      const typedValue = newValue as FinancialGoalsData & {
        paymentDates?: Date | undefined
        monthPayment?: Date | undefined
        biweeklyPayments?: BiweeklyPayments | undefined
      }
      formModel.value = {
        ...typedValue,
        usage: normalizeUsage(typedValue.usage),
        monthPayment: typedValue?.monthPayment ?? formModel.value.monthPayment,
        biweeklyPayments: [
          typedValue?.biweeklyPayments?.[0] ?? formModel.value.biweeklyPayments[0],
          typedValue?.biweeklyPayments?.[1] ?? formModel.value.biweeklyPayments[1]
        ],
        paymentDates: typedValue?.paymentDates ?? formModel.value.paymentDates
      }
    },
    { deep: true }
  )

  // Computed properties

  // Emit model changes
  watch(
    formModel,
    newValue => {
      emit('update:modelValue', {
        ...newValue,
        usage: normalizeUsage(newValue.usage)
      })
    },
    { deep: true }
  )

  // Emit initial default values when component mounts
  // This ensures the wizard knows about the default selections
  onMounted(() => {
    emit('update:modelValue', {
      ...formModel.value,
      usage: normalizeUsage(formModel.value.usage)
    })
  })
  const handleChangeBudgetFrequency = () => {
    formModel.value.budgetFrequency = '' as 'MONTHLY' | 'BIWEEKLY'
  }

  const frequencyOptions = computed(() =>
    !formModel.value.budgetFrequency
      ? [
          {
            label: 'Mensual',
            value: 'MONTHLY',
            title: 'Mensual',
            description: 'Una vez al mes',
            badge: 'Recomendado',
            icon: 'calendar_month'
          },
          {
            label: 'Quincenal',
            value: 'BIWEEKLY',
            title: 'Quincenal',
            description: '2 veces al mes',
            icon: 'payments'
          }
        ]
      : formModel.value.budgetFrequency === 'MONTHLY'
        ? [
            {
              label: 'Mensual',
              value: 'MONTHLY',
              title: 'Mensual',
              description: 'Una vez al mes',
              badge: 'Recomendado',
              icon: 'calendar_month'
            }
          ]
        : [
            {
              label: 'Quincenal',
              value: 'BIWEEKLY',
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
        <Label variant="form" size="sm" class-name="form-field__label">Selecciona tu moneda</Label>
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
      <AlertBanner
        v-if="formModel.budgetFrequency === 'BIWEEKLY'"
        variant="info"
        size="sm"
        class="mb-4"
      >
        Al seleccionar una frecuencia quincenal, organizaremos tu presupuesto para cubrir tus gastos
        fijos divididos entre ambos pagos.
      </AlertBanner>
      <div
        v-if="formModel.budgetFrequency"
        class="mb-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <IconChip icon="security" variant="primary" />

            <div>
              <Heading level="h3" size="base" weight="semibold">Estrategia Seleccionada</Heading>
              <Label
                variant="form"
                size="sm"
                color="muted"
                class-name="account-info-section__field-label"
              >
                {{
                  formModel.budgetFrequency === 'MONTHLY'
                    ? 'Mensual'
                    : formModel.budgetFrequency === 'BIWEEKLY'
                      ? 'Quincenal'
                      : ''
                }}
              </Label>
            </div>
          </div>
        </div>
        <Button size="sm" variant="primary" @click="handleChangeBudgetFrequency">Cambiar</Button>
      </div>

      <!-- Budget Frequency -->
      <div v-if="!formModel.budgetFrequency" class="form-field">
        <Label variant="form" size="sm" class-name="form-field__label">
          Con que frecuencia quieres configurar tu presupuesto?
        </Label>

        <RadioButton
          v-model="formModel.budgetFrequency"
          name="budgetFrequency"
          variant="card"
          direction="column"
          class="w-full"
          :options="frequencyOptions"
        />
      </div>
      <!-- Fechas de pago -->
      <div v-if="showPaymentDates" class="form-field">
        <div v-if="formModel.budgetFrequency === 'MONTHLY'" class="min-w-full">
          <Label variant="form" size="sm" class-name="form-field__label">Fecha de pago</Label>
          <DatePickerInput
            v-model="formModel.monthPayment"
            mode="single"
            :placeholder="'Selecciona tu fecha de pago'"
          />
        </div>
        <div v-else-if="formModel.budgetFrequency === 'BIWEEKLY'" class="flex min-w-full gap-4">
          <div class="flex-1 flex-col">
            <Label variant="form" size="sm" class-name="form-field__label">
              Primera Fecha de pago
            </Label>
            <DatePickerInput
              v-model="formModel.biweeklyPayments[0]"
              mode="single"
              :placeholder="'Selecciona tu fecha de pago'"
            />
          </div>
          <div class="flex-1 flex-col">
            <Label variant="form" size="sm" class-name="form-field__label">
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
    </div>
  </form>
</template>

<style scoped lang="postcss">
  .finances-config-form {
    @apply box-content min-h-[380px] w-full flex-1 flex-wrap justify-center overflow-y-auto;
  }
  .form-field {
    @apply w-full space-y-4;
  }
  .form-field__label {
    @apply mb-2 block text-sm font-medium text-gray-400;
  }
  .form-field__helper {
    @apply mt-1 text-xs text-gray-400;
  }
</style>
