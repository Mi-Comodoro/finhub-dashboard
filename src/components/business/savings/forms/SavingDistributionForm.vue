<script setup lang="ts">
  import { AlertBanner } from '@/components/atoms'
  import { Form } from '@/components/organisms'
  import { useSavingDistributionApplication } from '@/composables/application/useSavingDistributionApplication'
  import { subtractPercentage } from '@/utils/numbers'

  import { savingDistributionFieldsSchema } from './schema/saving-distribution.fields.schema'

  const {
    initialize,
    getSavingsAmount,
    getGoalOptions,
    getTotalAllocatedPercentage,
    submitAllocation
  } = useSavingDistributionApplication()

  const budgetId = ref<string | null>(null)
  onMounted(async () => {
    const result = await initialize()
    budgetId.value = result.budgetId
  })

  const savingsAmount = getSavingsAmount()
  const goals = getGoalOptions()
  const savingAllocationTotal = getTotalAllocatedPercentage()

  const emit = defineEmits(['onClose', 'onError', 'onSuccess'])
  const formSchema = computed(() => savingDistributionFieldsSchema(goals.value))
  const percentage = ref<number>(0)

  const formKey = ref(0)
  const formData = ref<{ percentage: number; goalId: string }>({ percentage: 0, goalId: '' })

  const newAmount = computed(() =>
    subtractPercentage(savingsAmount.value, savingAllocationTotal.value)
  )
  watch(formData, value => {
    if (value?.percentage && value?.percentage > 0) {
      percentage.value = value?.percentage
    }
  })
  const handleSubmit = async () => {
    if (!budgetId.value) return

    const { success, error } = await submitAllocation(formData.value, budgetId.value)

    formData.value = { percentage: 0, goalId: '' }
    formKey.value++

    if (success) {
      emit('onSuccess')
    } else {
      emit('onError', error)
    }
  }

  const savingDiscount = computed(() => subtractPercentage(newAmount.value, percentage.value))
</script>

<template>
  <div class="saving-distribution-form">
    <CardInfo
      title="Agregar Distribucion de Ahorros"
      title-size="2xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Crea el hábito que transformará tu tranquilidad financiera."
      sub-title-size="sm"
      sub-title-color="muted"
      icon="donut_large"
      icon-variant="primary"
      icon-size="md"
    />
    <Text size="xl" weight="bold" class="saving-distribution-form__amount">
      Monto disponible
      <strong class="saving-distribution-form__amount-value">
        {{ formatCurrency(savingDiscount, 'COP') }}
      </strong>
    </Text>

    <AlertBanner icon="info" variant="warning">
      <Text size="sm" color="warning">
        <strong>Págate a ti mismo primero</strong>
        es una estrategia de finanzas personales donde priorizas el ahorro e inversión antes de
        pagar facturas o gastos discrecionales. Al recibir tus ingresos, separa automáticamente
        entre el 10% y 20% para tu
        <strong>Yo</strong>
        del futuro (ahorro, emergencia o inversión, retiro, entre otros.), convirtiendo el ahorro en
        un gasto fijo obligatorio.
      </Text>
    </AlertBanner>

    <Form :key="formKey" v-model="formData" :schema="formSchema">
      <template #actions>
        <div class="saving-distribution-form__actions">
          <Button type="button" variant="ghost" @click.stop="emit('onClose')">Cancelar</Button>
          <Button type="submit" variant="primary" @click="handleSubmit">Guardar</Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="postcss">
.saving-distribution-form {
  @apply flex h-full w-full flex-col gap-6;
}

.saving-distribution-form__amount {
  /* No styles needed - using utility classes only for this text */
}

.saving-distribution-form__amount-value {
  @apply text-primary-900;
}

.saving-distribution-form__actions {
  @apply flex justify-end gap-2;
}
</style>
