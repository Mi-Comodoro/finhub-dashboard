<script setup lang="ts">
  import { AlertBanner } from '@/components/atoms'
  import { Form } from '@/components/organisms'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'

  import { savingDistributionFieldsSchema } from './schema/saving-distribution.fields.schema'
  const plannedIncomeStore = usePlannedIncomeStore()
  const savingsAmount = computed(() => plannedIncomeStore.buckets.savingsAmount)

  const emit = defineEmits(['onClose'])
  const formSchema = computed(() => savingDistributionFieldsSchema())
  const percentage = ref<number>(0)
  const form = data => {
    if (data.percentage >= 0) {
      percentage.value = data.percentage
    }
  }
  const savingDiscount = computed(() => savingsAmount.value * (1 - percentage.value / 100))
</script>

<template>
  <div class="flex h-full w-full flex-col gap-6">
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
    <Text size="xl" weight="bold" class="">
      Monto disponible
      <strong class="text-primary-900">{{ formatCurrency(savingDiscount, 'COP') }}</strong>
    </Text>

    <AlertBanner icon="info" title="">
      <Text size="sm" color="primary" class="">
        <strong>Págate a ti mismo primero</strong>
        es una estrategia de finanzas personales donde priorizas el ahorro e inversión antes de
        pagar facturas o gastos discrecionales. Al recibir tus ingresos, separa automáticamente
        entre el 10% y 20% para tu
        <strong>Yo</strong>
        del futuro (ahorro, emergencia o inversión, retiro, entre otros.), convirtiendo el ahorro en
        un gasto fijo obligatorio.
      </Text>
    </AlertBanner>

    <Form :schema="formSchema" @update:model-value="form">
      <template #actions>
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" @click.stop="emit('onClose')">Cancelar</Button>
          <Button type="submit" variant="primary">Guardar</Button>
        </div>
      </template>
    </Form>
  </div>
</template>
