<script lang="ts" setup>
  import { ON_BOARDING_CONFIG, SOURCE_INCOMES_OPTIONS } from '~/common/constants'
  import type { BudgetFrequency } from '~/types/domain'
  const { incomes } = ON_BOARDING_CONFIG
  defineProps<{
    budgetFrequency: string
  }>()

  const emit = defineEmits(['update:modelValue', 'valid'])
  const formModel = ref<{
    incomes: [
      { amount: number; source: string; isAdditional: boolean },
      { amount: number; source: string; isAdditional: boolean }
    ]
    frequency: BudgetFrequency
    paymentsDates: Date | [Date] | null
    isAnotherIncomesSource: boolean
  }>({
    incomes: [
      { amount: 0, source: '', isAdditional: false },
      { amount: 0, source: '', isAdditional: false }
    ],
    frequency: 'monthly' as BudgetFrequency,
    paymentsDates: null,
    isAnotherIncomesSource: false
  })

  const isValid = ref(false)

  const validate = () => {
    const incomeHasCompleted =
      formModel.value.incomes[0].amount > 0 && formModel.value.incomes[0].source.trim() !== ''
    const anotherIncomes = formModel.value.isAnotherIncomesSource
      ? formModel.value.incomes[1].amount > 0 && formModel.value.incomes[1].source.trim() !== ''
      : true
    const hasCompleted = incomeHasCompleted && anotherIncomes

    isValid.value = hasCompleted
    emit('valid', isValid.value)
  }

  watch(
    () => formModel.value,
    newValue => {
      validate()
      const newValueToEmit = {
        incomes: newValue.isAnotherIncomesSource
          ? [newValue.incomes[0], { ...newValue.incomes[1], isAdditional: true }]
          : [{ ...newValue.incomes[0] }]
      }
      emit('update:modelValue', newValueToEmit)
    },
    { deep: true }
  )
</script>

<template>
  <div class="form-wrapper">
    <form class="form-income">
      <AlertBanner :title="incomes.banner" variant="info" />

      <div v-if="budgetFrequency === 'monthly'" class="form-income__monthly">
        <div class="form-income__grid">
          <Input
            id="income"
            v-model="formModel.incomes[0].amount"
            name="income"
            type="number"
            placeholder="Ej. 3000000"
            label="¿Cuánto dinero recibes normalmente?"
            required
          />

          <Select
            v-model="formModel.incomes[0].source"
            name="budgetFrequency"
            label="Origen de tu ingreso principal"
            :options="SOURCE_INCOMES_OPTIONS"
            required
          />
        </div>
        <div class="form-income__another-source">
          <RadioButton
            v-model="formModel.isAnotherIncomesSource"
            name="isAnotherIncomesSource"
            label="¿Tines Ingresos adicionales?"
            direction="row"
            required
            :options="[
              {
                label: 'Si',
                value: true
              },
              {
                label: 'No',
                value: false
              }
            ]"
          />
        </div>
        <div v-if="formModel.isAnotherIncomesSource" class="form-income__grid">
          <Input
            id="anotherIncome"
            v-model="formModel.incomes[1].amount"
            name="anotherIncome"
            type="number"
            placeholder="Ej. 3000000"
            label="Ingresos adicionales"
            required
          />

          <Select
            v-model="formModel.incomes[1].source"
            name="budgetFrequency"
            label="Origen de tu ingreso Adicional"
            :options="SOURCE_INCOMES_OPTIONS"
            required
          />
        </div>
        <AlertBanner
          v-if="formModel.isAnotherIncomesSource"
          title="Si tienes mas ingresos, no te preocupes puedes agregarlos más adelante"
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
  .form-income__grid {
    @apply grid w-full grid-cols-2 gap-4;
  }

  .form-income__another-source {
    @apply mt-4 flex items-center gap-4;
  }

  .form-income__monthly {
    @apply flex-col items-start gap-4 space-y-4;
  }
</style>
