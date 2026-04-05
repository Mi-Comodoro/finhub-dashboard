<script setup lang="ts">
  import { useFinancesStore } from '@/stores/finances.store'
  import { useTransactionStore } from '@/stores/transaction.store'
  import DateUtils from '~/utils/date'
  const { markAsReceived, error, summary, processingIncomeId } = usePlannedIncome()
  const { success: successToast } = useFeedback()
  const { handleError } = useApiHandler()

  const financesStore = useFinancesStore()
  const transactionStore = useTransactionStore()
  const receivedIncome = computed(() => transactionStore.totalIncomeReceived)
  const currency = computed(() => financesStore.defaultCurrency)
  const markPlannedIncomeAsReceived = async (incomeId: string) => {
    const { success } = await markAsReceived(incomeId)

    if (success) {
      successToast('Ingreso recibido', 'El ingreso planificado se actualizó correctamente.')
      return
    }
    handleError(error)
  }
</script>
<template>
  <div>
    <Card class="space-y-2">
      <CardInfo
        title="Ingresos del Mes"
        sub-title="Marca tus ingresos como recibidos"
        weight="extrabold"
        title-size="lg"
        sub-title-size="xs"
        sub-title-color="muted"
        icon="payments"
        icon-variant="primary"
        level="h3"
      />

      <div v-for="(item, index) in summary" :key="index" class="flex w-full">
        <Card class="flex w-full gap-4">
          <div class="flex w-full flex-col space-y-2">
            <Label color="muted">{{ translate[item.source] }}</Label>
            <div>
              <Text size="xs" class="flex w-full">
                {{ `Vence: ${DateUtils.formatDate(item.date)}` }}
              </Text>
            </div>
          </div>
          <div class="flex w-full flex-col items-end justify-between gap-2">
            <Heading weight="extrabold" size="sm">
              {{ formatCurrency(item.amount, currency) }}
            </Heading>
            <div v-if="item.status === 'RECEIVED'">
              <Badge>{{ translate[item.status.toLowerCase()] }}</Badge>
            </div>
            <Button
              v-else
              size="sm"
              :loading="processingIncomeId === item.id"
              @click="markPlannedIncomeAsReceived(item.id)"
            >
              Marcar recibido
            </Button>
          </div>
        </Card>
      </div>
      <div class="flex items-center justify-between">
        <Text size="sm">Total Recibido:</Text>
        <Heading weight="extrabold" size="xl">
          {{ formatCurrency(receivedIncome, currency) }}
        </Heading>
      </div>
    </Card>
  </div>
</template>
