<script setup lang="ts">
  import { IncomeForm, IncomeHistory } from '@/components/business'
  import { ModalWizard } from '@/components/organisms'
  import { useFinancesApplication } from '@/composables/application/useFinancesApplication'
  import { useIncomeApplication } from '@/composables/application/useIncomeApplication'
  import { useFeedback } from '@/composables/useFeedback'
  import { formatCurrency } from '@/utils/currency'

  definePageMeta({
    layout: 'dashboard',
    title: 'Ingresos',
    breadcrumb: 'Ingresos'
  })

  const route = useRoute()

  const {
    expectedIncomes,
    isLoading,
    error,
    fetchPlannedIncomes,
    deleteIncome,
    markAsReceived
  } = useIncomeApplication()

  const { currency } = useFinancesApplication()
  const { success: successToast } = useFeedback()
  const budgetId = computed(() => (route.query.budgetId as string) || '')

  // Modal state
  const showForm = ref(false)
  const editingIncome = ref<{ id: string; data: Record<string, unknown> } | null>(null)

  const openForm = () => {
    editingIncome.value = null
    showForm.value = true
  }

  const closeForm = () => {
    showForm.value = false
    editingIncome.value = null
  }

  const handleEditIncome = (row: Record<string, unknown>) => {
    editingIncome.value = {
      id: row.id,
      data: {
        source: row.source,
        amount: row.amount,
        date: row.date
      }
    }
    showForm.value = true
  }

  const handleDeleteIncome = async (row: { id: string; source: string }) => {
    const confirmed = confirm(`¿Estás seguro de eliminar el ingreso "${row.source}"?`)
    if (!confirmed) return

    const { success } = await deleteIncome(row.id)
    if (success) {
      successToast('Ingreso eliminado', 'El ingreso planificado fue eliminado correctamente.')
    }
  }

  const handleMarkAsReceived = async (row: { id: string; source: string }) => {
    const { success } = await markAsReceived(row.id)
    if (success) {
      successToast(
        'Ingreso registrado',
        `El ingreso "${row.source}" fue marcado como recibido y se registró la transacción.`
      )
    }
  }

  // Load data on mount
  onMounted(async () => {
    await fetchPlannedIncomes()
  })
</script>

<template>
  <div class="income-page">
    <!-- Header -->
    <div class="income-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold" class="income-page__title"
          >Ingresos Planificados</Heading
        >
        <Text size="sm" color="muted">Gestiona y registra tus ingresos esperados</Text>
      </div>
      <Button variant="primary" size="sm" icon="add" @click="openForm"
        >Agregar Ingreso</Button
      >
    </div>

    <!-- Metrics Summary -->
    <div v-if="expectedIncomes.length > 0" class="income-page__metrics">
      <Card class="income-page__metric-card">
        <div class="income-page__metric">
          <Icon name="payments" size="md" class="income-page__metric-icon" />
          <div>
            <Text size="xs" color="muted">Total Esperado</Text>
            <Heading level="h3" size="xl" weight="bold">
              {{ formatCurrency(expectedIncomes.reduce((sum, i) => sum + i.amount, 0), currency) }}
              <span class="income-page__metric-currency">{{ currency }}</span>
            </Heading>
          </div>
        </div>
      </Card>
      <Card class="income-page__metric-card">
        <div class="income-page__metric">
          <Icon name="pending" size="md" class="income-page__metric-icon--warning" />
          <div>
            <Text size="xs" color="muted">Pendientes</Text>
            <Heading level="h3" size="xl" weight="bold">
              {{ expectedIncomes.filter(i => i.status === 'PENDING').length }}
            </Heading>
          </div>
        </div>
      </Card>
      <Card class="income-page__metric-card">
        <div class="income-page__metric">
          <Icon name="check_circle" size="md" class="income-page__metric-icon--success" />
          <div>
            <Text size="xs" color="muted">Recibidos</Text>
            <Heading level="h3" size="xl" weight="bold">
              {{ expectedIncomes.filter(i => i.status === 'RECEIVED').length }}
            </Heading>
          </div>
        </div>
      </Card>
    </div>

    <!-- Error State -->
    <Card v-if="error" class="income-page__error">
      <Text color="danger" size="sm">{{ error }}</Text>
    </Card>

    <!-- Loading State -->
    <Card v-if="isLoading && expectedIncomes.length === 0" class="income-page__loading">
      <Text size="sm" color="muted">Cargando ingresos...</Text>
    </Card>

    <!-- Income History Table -->
    <Card v-else class="income-page__table">
      <IncomeHistory
        :incomes="expectedIncomes"
        :currency="currency"
        @edit="handleEditIncome"
        @delete="handleDeleteIncome"
        @mark-received="handleMarkAsReceived"
      />
    </Card>

    <!-- Form Modal -->
    <ModalWizard v-model:show="showForm">
      <IncomeForm
        :budget-id="budgetId"
        :income-id="editingIncome?.id"
        :initial-data="editingIncome?.data"
        @on-close="closeForm"
      />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .income-page {
    @apply space-y-4;
  }

  .income-page__header {
    @apply flex items-center justify-between;
  }

  .income-page__title {
    @apply mb-1;
  }

  .income-page__metrics {
    @apply grid grid-cols-1 gap-4 md:grid-cols-3;
  }

  .income-page__metric-card {
    @apply !p-4;
  }

  .income-page__metric {
    @apply flex items-center gap-3;
  }

  .income-page__metric-icon {
    @apply text-primary-600;
  }

  .income-page__metric-icon--warning {
    @apply text-warning-600;
  }

  .income-page__metric-icon--success {
    @apply text-success-600;
  }

  .income-page__metric-currency {
    @apply text-base font-normal uppercase text-neutral-500;
  }

  .income-page__error {
    @apply !border-danger-200 !bg-danger-50 !p-4;
  }

  .income-page__loading {
    @apply !p-8 text-center;
  }

  .income-page__table {
    @apply !p-0;
  }
</style>
