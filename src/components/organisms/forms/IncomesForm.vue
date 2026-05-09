<script lang="ts" setup>
  import { ref, toRaw, watch } from 'vue'

  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import RadioButton from '@/components/atoms/radio/RadioButton.vue'
  import Label from '@/components/atoms/typography/Label.vue'
  import DatePickerInput from '@/components/molecules/date-picker/DatePickerInput.vue'
  import MoneyInput from '@/components/molecules/input/MoneyInput.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { useFinancesStore } from '@/stores/finances.store'
  import { ON_BOARDING_CONFIG, SOURCE_INCOMES_OPTIONS } from '~/common/constants'
  import type { BudgetFrequency } from '~/types/domain'

  const { incomes } = ON_BOARDING_CONFIG

  const financeStore = useFinancesStore()
  const emit = defineEmits(['submit', 'update:modelValue', 'valid'])

  type Income = {
    amount: number
    source: string
    isAdditional: boolean
    frequency: BudgetFrequency
    paymentsDates: Date | [Date | null, Date | null] | null
  }

  const formModel = ref<{
    incomes: [Income, Income]
    isAnotherIncomesSource: boolean
  }>({
    incomes: [
      {
        amount: 0,
        source: '',
        isAdditional: false,
        frequency: 'monthly',
        paymentsDates: null
      },
      {
        amount: 0,
        source: '',
        isAdditional: false,
        frequency: 'monthly',
        paymentsDates: null
      }
    ],
    isAnotherIncomesSource: false
  })

  const isValid = ref(false)

  /* ---------------------------------------------
   * VALIDACIÓN
   * --------------------------------------------- */
  const validate = () => {
    const income0 = formModel.value.incomes[0]
    const income1 = formModel.value.incomes[1]

    // Validar ingreso principal completo
    const hasAmount0 = income0.amount > 0
    const hasSource0 = income0.source.trim() !== ''
    const hasPaymentDates0 =
      income0.frequency === 'monthly'
        ? income0.paymentsDates !== null && income0.paymentsDates instanceof Date
        : income0.frequency === 'biweekly'
          ? Array.isArray(income0.paymentsDates) &&
            income0.paymentsDates.length === 2 &&
            income0.paymentsDates[0] !== null &&
            income0.paymentsDates[1] !== null
          : false

    const income0Valid = hasAmount0 && hasSource0 && hasPaymentDates0

    // Validar ingreso adicional si está habilitado
    const income1Valid = formModel.value.isAnotherIncomesSource
      ? (() => {
          const hasAmount1 = income1.amount > 0
          const hasSource1 = income1.source.trim() !== ''
          const hasPaymentDates1 =
            income1.frequency === 'monthly'
              ? income1.paymentsDates !== null && income1.paymentsDates instanceof Date
              : income1.frequency === 'biweekly'
                ? Array.isArray(income1.paymentsDates) &&
                  income1.paymentsDates.length === 2 &&
                  income1.paymentsDates[0] !== null &&
                  income1.paymentsDates[1] !== null
                : false

          return hasAmount1 && hasSource1 && hasPaymentDates1
        })()
      : true

    const valid = income0Valid && income1Valid

    isValid.value = valid
    emit('valid', valid)
  }

  /* ---------------------------------------------
   * EMIT CONSISTENTE (sin transformar estructura)
   * --------------------------------------------- */
  watch(
    formModel,
    value => {
      validate()

      emit('update:modelValue', structuredClone(toRaw(value)))
    },
    { deep: true }
  )

  /* ---------------------------------------------
   * VALIDACIÓN REACTIVA A FREQUENCY (ambos ingresos)
   * --------------------------------------------- */
  watch(
    () => formModel.value.incomes[0].frequency,
    () => validate()
  )

  watch(
    () => formModel.value.incomes[1].frequency,
    () => validate()
  )

  /* ---------------------------------------------
   * HELPERS DATE - INGRESO PRINCIPAL (index 0)
   * --------------------------------------------- */
  function getMonthlyDate0(): Date | null {
    const val = formModel.value.incomes[0].paymentsDates
    return val instanceof Date ? val : null
  }

  function setMonthlyDate0(date: Date | null) {
    formModel.value.incomes[0].paymentsDates = date
  }

  function setFirstDate0(date: Date | null) {
    const current = formModel.value.incomes[0].paymentsDates as [Date | null, Date | null] | null
    formModel.value.incomes[0].paymentsDates = [date ?? null, current?.[1] ?? null]
  }

  function setSecondDate0(date: Date | null) {
    const current = formModel.value.incomes[0].paymentsDates as [Date | null, Date | null] | null
    formModel.value.incomes[0].paymentsDates = [current?.[0] ?? null, date ?? null]
  }

  /* ---------------------------------------------
   * HELPERS DATE - INGRESO ADICIONAL (index 1)
   * --------------------------------------------- */
  function getMonthlyDate1(): Date | null {
    const val = formModel.value.incomes[1].paymentsDates
    return val instanceof Date ? val : null
  }

  function setMonthlyDate1(date: Date | null) {
    formModel.value.incomes[1].paymentsDates = date
  }

  function setFirstDate1(date: Date | null) {
    const current = formModel.value.incomes[1].paymentsDates as [Date | null, Date | null] | null
    formModel.value.incomes[1].paymentsDates = [date ?? null, current?.[1] ?? null]
  }

  function setSecondDate1(date: Date | null) {
    const current = formModel.value.incomes[1].paymentsDates as [Date | null, Date | null] | null
    formModel.value.incomes[1].paymentsDates = [current?.[0] ?? null, date ?? null]
  }

  function handleSubmit() {
    if (!isValid.value) return
    emit('submit', structuredClone(toRaw(formModel.value)))
  }
</script>

<template>
  <div class="form-wrapper">
    <form class="form-income" @submit.prevent="handleSubmit">
      <AlertBanner :title="incomes.banner" variant="warning" icon="info" />

      <!-- ============================================
           INGRESO PRINCIPAL
           ============================================ -->
      <div class="form-income__section">
        <h3 class="form-income__section-title">Ingreso principal</h3>

        <!-- FRECUENCIA INGRESO PRINCIPAL -->
        <div class="form-income__frequency">
          <Label variant="form" size="sm" weight="bold" color="black" require>
            ¿Con qué frecuencia recibes este ingreso?
          </Label>

          <RadioButton
            v-model="formModel.incomes[0].frequency"
            name="frequency0"
            variant="card"
            direction="row"
            class="w-full"
            :options="[
              {
                label: 'Mensual',
                value: 'monthly',
                icon: 'calendar_month'
              },
              {
                label: 'Quincenal',
                value: 'biweekly',
                icon: 'date_range'
              }
            ]"
          />
        </div>

        <!-- FECHAS INGRESO PRINCIPAL -->
        <div v-if="formModel.incomes[0].frequency" class="form-income__dates">
          <Label variant="form" size="sm" weight="bold" color="black" require>
            {{
              formModel.incomes[0].frequency === 'monthly'
                ? 'Fecha de pago mensual'
                : 'Fechas de pago quincenales'
            }}
          </Label>

          <div v-if="formModel.incomes[0].frequency === 'monthly'">
            <DatePickerInput
              :model-value="getMonthlyDate0()"
              mode="single"
              placeholder="Selecciona tu fecha de pago mensual"
              @update:model-value="setMonthlyDate0"
            />
          </div>

          <div v-else class="flex gap-4">
            <DatePickerInput
              :model-value="
                (formModel.incomes[0].paymentsDates as [Date | null, Date | null] | null)?.[0] ??
                null
              "
              mode="single"
              placeholder="Primera quincena"
              @update:model-value="setFirstDate0"
            />

            <DatePickerInput
              :model-value="
                (formModel.incomes[0].paymentsDates as [Date | null, Date | null] | null)?.[1] ??
                null
              "
              mode="single"
              placeholder="Segunda quincena"
              @update:model-value="setSecondDate0"
            />
          </div>
        </div>

        <!-- MONTO Y FUENTE INGRESO PRINCIPAL -->
        <div class="form-income__grid">
          <MoneyInput
            id="income0"
            v-model="formModel.incomes[0].amount"
            :currency="financeStore.defaultCurrency || 'COP'"
            pattern="/^\d+(\.\d{1,2})?$/"
            name="income0"
            placeholder="Ej. 3000000"
            label="¿Cuánto dinero recibes?"
            required
          />

          <Select
            v-model="formModel.incomes[0].source"
            name="source0"
            label="Origen de tu ingreso"
            :options="SOURCE_INCOMES_OPTIONS"
            required
          />
        </div>
      </div>

      <!-- ============================================
           PREGUNTA INGRESO ADICIONAL
           ============================================ -->
      <div class="form-income__another-source">
        <RadioButton
          v-model="formModel.isAnotherIncomesSource"
          name="isAnotherIncomesSource"
          label="¿Tienes ingresos adicionales?"
          direction="row"
          required
          :options="[
            { label: 'Si', value: true },
            { label: 'No', value: false }
          ]"
        />
      </div>

      <!-- ============================================
           INGRESO ADICIONAL (condicional)
           ============================================ -->
      <div v-if="formModel.isAnotherIncomesSource" class="form-income__section">
        <h3 class="form-income__section-title">Ingreso adicional</h3>

        <!-- FRECUENCIA INGRESO ADICIONAL -->
        <div class="form-income__frequency">
          <Label variant="form" size="sm" weight="bold" color="black" require>
            ¿Con qué frecuencia recibes este ingreso?
          </Label>

          <RadioButton
            v-model="formModel.incomes[1].frequency"
            name="frequency1"
            variant="card"
            direction="row"
            class="w-full"
            :options="[
              {
                label: 'Mensual',
                value: 'monthly',
                icon: 'calendar_month'
              },
              {
                label: 'Quincenal',
                value: 'biweekly',
                icon: 'date_range'
              }
            ]"
          />
        </div>

        <!-- FECHAS INGRESO ADICIONAL -->
        <div v-if="formModel.incomes[1].frequency" class="form-income__dates">
          <Label variant="form" size="sm" weight="bold" color="black" require>
            {{
              formModel.incomes[1].frequency === 'monthly'
                ? 'Fecha de pago mensual'
                : 'Fechas de pago quincenales'
            }}
          </Label>

          <div v-if="formModel.incomes[1].frequency === 'monthly'">
            <DatePickerInput
              :model-value="getMonthlyDate1()"
              mode="single"
              placeholder="Selecciona tu fecha de pago mensual"
              @update:model-value="setMonthlyDate1"
            />
          </div>

          <div v-else class="flex gap-4">
            <DatePickerInput
              :model-value="
                (formModel.incomes[1].paymentsDates as [Date | null, Date | null] | null)?.[0] ??
                null
              "
              mode="single"
              placeholder="Primera quincena"
              @update:model-value="setFirstDate1"
            />

            <DatePickerInput
              :model-value="
                (formModel.incomes[1].paymentsDates as [Date | null, Date | null] | null)?.[1] ??
                null
              "
              mode="single"
              placeholder="Segunda quincena"
              @update:model-value="setSecondDate1"
            />
          </div>
        </div>

        <!-- MONTO Y FUENTE INGRESO ADICIONAL -->
        <div class="form-income__grid">
          <MoneyInput
            id="income1"
            v-model="formModel.incomes[1].amount"
            name="income1"
            placeholder="Ej. 3000000"
            label="¿Cuánto dinero recibes?"
            :currency="financeStore.defaultCurrency || 'COP'"
            pattern="/^\d+(\.\d{1,2})?$/"
            required
          />

          <Select
            v-model="formModel.incomes[1].source"
            name="source1"
            label="Origen de tu ingreso"
            :options="SOURCE_INCOMES_OPTIONS"
            required
          />
        </div>

        <AlertBanner
          title="Si tienes más ingresos, no te preocupes puedes agregarlos más adelante"
          variant="warning"
        />
      </div>
    </form>
  </div>
</template>

<style lang="postcss" scoped>
  .form-wrapper {
    @apply flex h-full w-full flex-col items-center justify-center;
  }
  .form-income {
    @apply mx-auto box-content h-96 min-h-96 w-full max-w-2xl space-y-4 overflow-y-auto px-1;
  }
  .form-income__section {
    @apply space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4;
  }
  .form-income__section-title {
    @apply text-base font-semibold text-neutral-900;
  }
  .form-income__frequency {
    @apply space-y-2;
  }
  .form-income__dates {
    @apply space-y-2;
  }
  .form-income__grid {
    @apply grid w-full grid-cols-2 gap-4;
  }
  .form-income__another-source {
    @apply mt-4 flex items-center gap-4;
  }
</style>
