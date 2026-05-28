<script setup lang="ts">
  import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
  import { usePlannedSavingApplication } from '@/composables/application/usePlannedSavingApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useBudgetInsightsPresenter } from '@/composables/presenters/useBudgetInsightsPresenter'
  import DateUtils from '@/utils/date'

  const props = withDefaults(defineProps<{ budgetId?: string }>(), {
    budgetId: ''
  })

  const { markAsReceived, error, summary, processingIncomeId } = usePlannedIncomeApplication()
  const { fetchByBudget: fetchTransactions, transactions } = useTransactionApplication()
  const { fetchByBudget: fetchPlannedSavings } = usePlannedSavingApplication()
  const { currency, receivedIncome } = useBudgetInsightsPresenter()
  const { success: successToast } = useFeedback()
  const { handleError } = useApiHandler()

  // Ingresos planificados con monto > 0
  const visibleIncomes = computed(() => (summary.value ?? []).filter(income => income.amount > 0))

  // Ingresos espontáneos: transacciones de tipo income sin plannedIncomeId
  const spontaneousIncomes = computed(() =>
    (transactions.value ?? []).filter(t => t.type === 'income' && !t.plannedIncomeId)
  )

  const markPlannedIncomeAsReceived = async (incomeId: string) => {
    const { success } = await markAsReceived(incomeId)

    if (success) {
      successToast('Ingreso recibido', 'El ingreso planificado se actualizó correctamente.')
      // Recargar en paralelo para actualizar contadores y transacciones
      await Promise.all([fetchTransactions(props.budgetId), fetchPlannedSavings(props.budgetId)])
      return
    }
    if (error.value && error.value.status) {
      handleError({
        status: error.value.status,
        title: error.value.title,
        message: error.value.message
      })
    }
  }
</script>
<template>
  <div class="budget-income">
    <Card class="budget-income__card">
      <CardInfo
        title="Ingresos del Mes"
        sub-title="Marca tus ingresos como recibidos"
        weight="extrabold"
        title-size="sm"
        sub-title-size="xs"
        sub-title-color="muted"
        icon="payments"
        icon-variant="primary"
        level="h3"
      />

      <div v-for="(item, index) in visibleIncomes" :key="index" class="budget-income__item-wrapper">
        <Card class="budget-income__item-card">
          <div class="budget-income__item-info">
            <Label color="muted">{{ translate[item.source] }}</Label>
            <div>
              <Text size="xs" class="budget-income__item-date">
                {{ `Vence: ${DateUtils.formatDate(item.date)}` }}
              </Text>
            </div>
          </div>
          <div class="budget-income__item-actions">
            <Heading weight="extrabold" size="xs">
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
              Recibir
            </Button>
          </div>
        </Card>
      </div>
      <!-- Ingresos espontáneos -->
      <template v-if="spontaneousIncomes.length > 0">
        <div class="budget-income__section-label">
          <Text size="xs" color="muted">Ingresos Adicionales</Text>
        </div>
        <div v-for="item in spontaneousIncomes" :key="item.id" class="budget-income__item-wrapper">
          <Card class="budget-income__item-card">
            <div class="budget-income__item-info">
              <Label color="muted">{{ item.category?.name || translate[item.type] }}</Label>
              <Text size="xs" class="budget-income__item-date">
                {{ `Fecha: ${DateUtils.formatDate(item.transactionDate)}` }}
              </Text>
            </div>
            <div class="budget-income__item-actions">
              <Heading weight="extrabold" size="xs">
                {{ formatCurrency(item.amount, currency) }}
              </Heading>
              <Badge variant="success">Recibido</Badge>
            </div>
          </Card>
        </div>
      </template>

      <div class="budget-income__total">
        <Text size="xs">Total Recibido:</Text>
        <Heading weight="extrabold" size="lg">
          {{ formatCurrency(receivedIncome, currency) }}
        </Heading>
      </div>
    </Card>
  </div>
</template>

<style scoped lang="postcss">
  .budget-income__card {
    @apply space-y-1.5;
  }

  .budget-income__item-wrapper {
    @apply flex w-full;
  }

  .budget-income__item-card {
    @apply flex w-full gap-2 px-3 py-2;
  }

  .budget-income__item-info {
    @apply flex w-full flex-col space-y-0.5;
  }

  .budget-income__item-date {
    @apply flex w-full;
  }

  .budget-income__item-actions {
    @apply flex w-full flex-col items-end justify-between gap-1;
  }

  .budget-income__section-label {
    @apply border-t border-neutral-100 pt-2;
  }

  .budget-income__total {
    @apply flex items-center justify-between;
  }
</style>
