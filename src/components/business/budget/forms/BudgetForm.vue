<script setup lang="ts">
  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Form from '@/components/organisms/forms/Form.vue'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import type { CustomBucket } from '~/types/domain'

  import { budgetFieldsSchema } from './schema/budget.fields.schema'

  interface Props {
    mode?: 'create' | 'edit'
    budgetId?: string
    initialData?: Partial<{
      name: string
      month: number
      year: number
      strategy: 'BALANCED' | 'CUSTOM'
      needsLimit: number
      wantsLimit: number
      savingsLimit: number
      customBuckets: CustomBucket[]
    }>
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'create',
    budgetId: undefined,
    initialData: undefined
  })
  const emit = defineEmits(['onClose', 'onSuccess'])

  // Opciones de mes y año
  const monthOptions = computed(() => [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ])

  const yearOptions = computed(() => {
    const currentYear = new Date().getFullYear()
    return [
      { label: String(currentYear), value: currentYear },
      { label: String(currentYear + 1), value: currentYear + 1 },
      { label: String(currentYear + 2), value: currentYear + 2 }
    ]
  })

  // Schema dinámico
  const formSchema = computed(() => budgetFieldsSchema(monthOptions.value, yearOptions.value))

  // Datos del formulario
  const formData = ref({
    name: props.initialData?.name ?? '',
    month: props.initialData?.month ?? new Date().getMonth() + 1,
    year: props.initialData?.year ?? new Date().getFullYear(),
    strategy: (props.initialData?.strategy ?? 'BALANCED') as 'BALANCED' | 'CUSTOM',
    needsLimit: props.initialData?.needsLimit ?? 50,
    wantsLimit: props.initialData?.wantsLimit ?? 30,
    savingsLimit: props.initialData?.savingsLimit ?? 20,
    customBuckets: (props.initialData?.customBuckets ?? []) as CustomBucket[]
  })

  const isCustomStrategy = computed(() => formData.value.strategy === 'CUSTOM')
  const distributionSum = computed(() => {
    const customTotal = (formData.value.customBuckets ?? []).reduce(
      (s, b) => s + (b.percentage ?? 0),
      0
    )
    return (
      (formData.value.needsLimit ?? 0) +
      (formData.value.wantsLimit ?? 0) +
      (formData.value.savingsLimit ?? 0) +
      customTotal
    )
  })
  const isSumValid = computed(() => !isCustomStrategy.value || distributionSum.value === 100)

  // Submit handler
  const handleSubmit = async (data: {
    name: string
    month: number
    year: number
    strategy: 'BALANCED' | 'CUSTOM'
    needsLimit?: number
    wantsLimit?: number
    savingsLimit?: number
  }) => {
    const { handleCreate, handleUpdate } = useBudgetActions()

    const payload = {
      name: data.name,
      month: Number(data.month),
      year: Number(data.year),
      strategy: data.strategy,
      needsLimit: data.strategy === 'BALANCED' ? 50 : Number(data.needsLimit || 50),
      wantsLimit: data.strategy === 'BALANCED' ? 30 : Number(data.wantsLimit || 30),
      savingsLimit: data.strategy === 'BALANCED' ? 20 : Number(data.savingsLimit || 20),
      customBuckets: data.strategy === 'CUSTOM' ? (formData.value.customBuckets ?? []) : []
    }

    const { success } =
      props.mode === 'create'
        ? await handleCreate(payload)
        : await handleUpdate(props.budgetId!, payload)

    if (success) {
      emit('onSuccess')
      emit('onClose')
    }
  }
</script>

<template>
  <div class="budget-form">
    <CardInfo
      :title="mode === 'create' ? 'Crear Presupuesto' : 'Editar Presupuesto'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        mode === 'create'
          ? 'Define los límites para cada categoría de gasto.'
          : 'Actualiza los límites de tu presupuesto.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="account_balance_wallet"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="budget-form__content">
      <Form v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <CustomBucketsDistribution
            v-if="isCustomStrategy"
            v-model:needs-limit="formData.needsLimit"
            v-model:wants-limit="formData.wantsLimit"
            v-model:savings-limit="formData.savingsLimit"
            v-model:custom-buckets="formData.customBuckets"
            :budget-id="budgetId"
            :is-edit-mode="mode === 'edit'"
          />
          <AlertBanner v-if="isCustomStrategy && !isSumValid" variant="danger">
            Los porcentajes deben sumar 100%. Actualmente suman {{ distributionSum }}%.
          </AlertBanner>
          <div class="budget-form__actions">
            <Button type="button" variant="ghost" size="sm" @click="emit('onClose')">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              :disabled="isCustomStrategy && !isSumValid"
            >
              {{ mode === 'create' ? 'Crear Presupuesto' : 'Actualizar Presupuesto' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .budget-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .budget-form__content {
    @apply w-full;
  }

  .budget-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
