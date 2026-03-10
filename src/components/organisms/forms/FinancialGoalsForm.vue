<script setup lang="ts">
  import { Label } from '@/components/atoms'
  import { Select } from '@/components/molecules'

  type FinancialUsage = 'personal' | 'shared' | 'PERSONAL' | 'SHARED'

  const normalizeUsage = (usage?: string): 'personal' | 'shared' => {
    const normalized = (usage || '').toLowerCase()

    if (normalized === 'shared') return 'shared'

    return 'personal'
  }

  interface FinancialGoalsData {
    currency: 'COP' | 'USD'
    profile: 'EMPLOYEE' | 'FREELANCER' | 'BUSINESS_OWNER'
    usage: FinancialUsage
    budgetFrequency: 'MONTHLY' | 'BIWEEKLY'
  }

  interface Props {
    modelValue?: FinancialGoalsData
  }

  interface Emits {
    'update:modelValue': [value: FinancialGoalsData]
    valid: [isValid: boolean]
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({
      currency: 'COP',
      profile: 'EMPLOYEE',
      usage: 'PERSONAL',
      budgetFrequency: 'MONTHLY'
    })
  })

  const emit = defineEmits<Emits>()

  // Form model
  const formModel = ref<FinancialGoalsData>({
    ...props.modelValue,
    usage: normalizeUsage(props.modelValue?.usage)
  })

  watch(
    () => props.modelValue,
    newValue => {
      if (!newValue) return

      formModel.value = {
        ...newValue,
        usage: normalizeUsage(newValue.usage)
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
</script>
<template>
  <form class="finances-config-form space-y-6" @submit.prevent>
    <div class="space-y-4">
      <!-- Currency -->
      <div class="form-field">
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
      <div class="form-field">
        <Label variant="form" size="sm" class-name="form-field__label">
          Frecuencia de Presupuesto
        </Label>

        <RadioButton
          v-model="formModel.budgetFrequency"
          name="budgetFrequency"
          variant="card"
          direction="row"
          :options="[
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
          ]"
        />
      </div>

      <!-- Account Type Example (Column Layout) -->
      <div class="form-field">
        <Label variant="form" size="sm" class-name="form-field__label">Tipo de Presupuesto</Label>

        <RadioButton
          v-model="formModel.usage"
          name="budgetType"
          variant="card"
          direction="row"
          :options="[
            {
              label: 'Personal',
              value: 'personal',
              title: 'Personal',
              description: 'Solo para mi',
              badge: 'Recomendado',
              icon: 'person'
            },
            {
              label: 'Compartido',
              value: 'shared',
              title: 'Compartido',
              description: 'Pareja o familia',
              icon: 'group'
            }
          ]"
        />
      </div>
    </div>
  </form>
</template>
<style scoped>
  .form-field__label {
    @apply mb-2 block text-sm font-medium text-gray-400;
  }

  .form-field__helper {
    @apply mt-1 text-xs text-gray-400;
  }
</style>
