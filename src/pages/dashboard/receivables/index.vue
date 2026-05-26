<script setup lang="ts">
  import VChart from 'vue-echarts'

  import AccountReceivableCollectionForm from '@/components/business/receivables/forms/AccountReceivableCollectionForm.vue'
  import AccountReceivableForm from '@/components/business/receivables/forms/AccountReceivableForm.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useAccountsReceivableApplication } from '@/composables/application/useAccountsReceivableApplication'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useFinancesStore } from '@/stores/finances.store'
  import type { AccountReceivable } from '@/types/accounts-receivable.types'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'

  definePageMeta({
    layout: 'dashboard',
    title: 'Cuentas por Cobrar',
    breadcrumb: 'Cuentas por Cobrar'
  })

  const { accounts, summary, isLoading, currency, agingData, flowData, loadAll, deleteAccount } =
    useAccountsReceivableApplication()

  const { success: successToast, error: errorToast } = useFeedback()
  const { fetchCurrentBudget } = useBudgetActions()
  const financesStore = useFinancesStore()

  const showForm = ref(false)
  const showCollectionForm = ref(false)
  const editingAccount = ref<{ id: string; data: Record<string, unknown> } | null>(null)
  const selectedAccount = ref<AccountReceivable | null>(null)
  const itemToDelete = ref<string | null>(null)
  const showDeleteModal = ref(false)

  const openCreate = () => {
    editingAccount.value = null
    showForm.value = true
  }

  const openEdit = (account: AccountReceivable) => {
    editingAccount.value = {
      id: account.id,
      data: {
        name: account.name,
        debtor: account.debtor,
        originalAmount: account.originalAmount,
        dueDate: account.dueDate,
        notes: account.notes
      }
    }
    showForm.value = true
  }

  const closeForm = () => {
    showForm.value = false
    editingAccount.value = null
  }

  const openCollection = (account: AccountReceivable) => {
    selectedAccount.value = account
    showCollectionForm.value = true
  }

  const closeCollectionForm = () => {
    showCollectionForm.value = false
    selectedAccount.value = null
  }

  const handleDelete = (id: string) => {
    itemToDelete.value = id
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!itemToDelete.value) return
    const { success } = await deleteAccount(itemToDelete.value)
    showDeleteModal.value = false
    itemToDelete.value = null
    if (success) {
      successToast('Cobro eliminado', 'El cobro fue eliminado correctamente.')
    } else {
      errorToast('Error', 'No se pudo eliminar el cobro.')
    }
  }

  const statusLabel = (status: AccountReceivable['status']) => {
    const labels: Record<AccountReceivable['status'], string> = {
      pending: 'Pendiente',
      partial: 'Parcial',
      collected: 'Cobrado',
      overdue: 'Vencido'
    }
    return labels[status]
  }

  const statusVariant = (status: AccountReceivable['status']) => {
    const variants: Record<AccountReceivable['status'], string> = {
      pending: 'default',
      partial: 'warning',
      collected: 'success',
      overdue: 'danger'
    }
    return variants[status] as BadgeVariant
  }

  const agingChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: { value: number }[]) =>
        formatCurrency(params[0]?.value ?? 0, currency.value)
    },
    grid: { left: '3%', right: '6%', top: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatCompactCurrency(v, currency.value)
      }
    },
    yAxis: {
      type: 'category',
      data: agingData.value.map(b => b.label)
    },
    series: [
      {
        type: 'bar',
        data: agingData.value.map(b => ({
          value: b.value,
          itemStyle: { color: b.color, borderRadius: [0, 4, 4, 0] }
        }))
      }
    ]
  }))

  const flowChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: { value: number }[]) =>
        formatCurrency(params[0]?.value ?? 0, currency.value)
    },
    grid: { left: '3%', right: '4%', top: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: flowData.value.map(m => m.label),
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatCompactCurrency(v, currency.value)
      }
    },
    series: [
      {
        type: 'line',
        data: flowData.value.map(m => m.value),
        smooth: true,
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.1)' }
      }
    ]
  }))

  onMounted(async () => {
    await Promise.all([loadAll(), fetchCurrentBudget(financesStore.profile?.id ?? '')])
  })
</script>

<template>
  <div class="receivables-page">
    <!-- Header -->
    <div class="receivables-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Cuentas por Cobrar</Heading>
        <Text size="sm" color="muted">Gestiona el dinero que te deben</Text>
      </div>
      <Button variant="primary" size="sm" icon="add" @click="openCreate">Agregar cobro</Button>
    </div>

    <!-- KPI Cards -->
    <div class="receivables-page__kpis">
      <Card class="receivables-page__kpi-card">
        <div class="receivables-page__kpi">
          <span class="material-symbols-outlined receivables-page__kpi-icon">account_balance</span>
          <div>
            <Text size="xs" color="muted">Total por cobrar</Text>
            <Heading level="h3" size="xl" weight="bold">
              {{ formatCurrency(summary?.totalReceivable ?? 0, currency) }}
            </Heading>
          </div>
        </div>
      </Card>

      <Card class="receivables-page__kpi-card">
        <div class="receivables-page__kpi">
          <span class="material-symbols-outlined receivables-page__kpi-icon--warning">
            calendar_month
          </span>
          <div>
            <Text size="xs" color="muted">Esperado este mes</Text>
            <Heading level="h3" size="xl" weight="bold">
              {{ formatCurrency(summary?.expectedThisMonth ?? 0, currency) }}
            </Heading>
          </div>
        </div>
      </Card>

      <Card class="receivables-page__kpi-card">
        <div class="receivables-page__kpi">
          <span
            class="material-symbols-outlined"
            :class="
              (summary?.overdueCount ?? 0) > 0
                ? 'receivables-page__kpi-icon--danger'
                : 'receivables-page__kpi-icon'
            "
          >
            warning
          </span>
          <div>
            <Text size="xs" color="muted">Vencidos</Text>
            <Heading
              level="h3"
              size="xl"
              weight="bold"
              :class="(summary?.overdueCount ?? 0) > 0 ? 'receivables-page__kpi-overdue' : ''"
            >
              {{ summary?.overdueCount ?? 0 }}
            </Heading>
          </div>
        </div>
      </Card>
    </div>

    <!-- Charts -->
    <div class="receivables-page__charts">
      <Card class="receivables-page__chart-card">
        <Heading level="h3" size="lg" weight="semibold">Antigüedad de cobros</Heading>
        <Text size="xs" color="muted">Distribución por antigüedad de vencimiento</Text>
        <ClientOnly>
          <VChart :option="agingChartOption" autoresize class="receivables-page__chart" />
        </ClientOnly>
      </Card>

      <Card class="receivables-page__chart-card">
        <Heading level="h3" size="lg" weight="semibold">Flujo esperado</Heading>
        <Text size="xs" color="muted">Cobros proyectados próximos 3 meses</Text>
        <ClientOnly>
          <VChart :option="flowChartOption" autoresize class="receivables-page__chart" />
        </ClientOnly>
      </Card>
    </div>

    <!-- Loading -->
    <Card v-if="isLoading && accounts.length === 0" class="receivables-page__loading">
      <Text size="sm" color="muted">Cargando cobros...</Text>
    </Card>

    <!-- Account list -->
    <div v-else class="receivables-page__list">
      <div v-for="account in accounts" :key="account.id" class="receivables-page__account-card">
        <div class="receivables-page__account-header">
          <div class="receivables-page__account-info">
            <Heading level="h3" size="base" weight="semibold">{{ account.name }}</Heading>
            <Text v-if="account.debtor" size="xs" color="muted">{{ account.debtor }}</Text>
            <Text v-if="account.notes" size="xs" color="muted">{{ account.notes }}</Text>
          </div>
          <Badge :variant="statusVariant(account.status)">
            {{ statusLabel(account.status) }}
          </Badge>
        </div>

        <div class="receivables-page__account-amounts">
          <div>
            <Text size="xs" color="muted">Monto original</Text>
            <Text size="xs" color="muted">
              {{ formatCurrency(account.originalAmount, currency) }}
            </Text>
          </div>
          <div class="receivables-page__account-due">
            <Text size="xs" color="muted">Saldo pendiente</Text>
            <Heading level="h3" size="xl" weight="bold">
              {{ formatCurrency(account.currentBalance, currency) }}
            </Heading>
          </div>
        </div>

        <div class="receivables-page__account-progress">
          <div class="receivables-page__account-progress-info">
            <Text size="xs" color="muted">
              Cobrado:
              {{ formatCurrency(account.originalAmount - account.currentBalance, currency) }} /
              {{ formatCurrency(account.originalAmount, currency) }}
            </Text>
          </div>
          <div class="receivables-page__progress-bar">
            <div
              class="receivables-page__progress-fill"
              :style="{
                width: `${Math.min(100, Math.max(0, ((account.originalAmount - account.currentBalance) / account.originalAmount) * 100))}%`
              }"
            />
          </div>
        </div>

        <div v-if="account.dueDate" class="receivables-page__account-due-row">
          <Text size="xs" color="muted">
            Esperado: {{ DateUtils.formatDate(account.dueDate, 'short') }}
          </Text>
        </div>

        <div v-if="account.status === 'overdue'" class="receivables-page__overdue-alert">
          <span class="material-symbols-outlined receivables-page__overdue-icon">warning</span>
          <Text size="xs" class="text-danger-500">Este cobro está vencido</Text>
        </div>

        <div class="receivables-page__account-actions">
          <Button
            v-if="account.status !== 'collected'"
            size="sm"
            variant="primary"
            @click="openCollection(account)"
          >
            Recibir cobro
          </Button>
          <Button size="sm" variant="ghost" @click="openEdit(account)">Editar</Button>
          <Button size="sm" variant="danger" @click="handleDelete(account.id)">Eliminar</Button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!isLoading && accounts.length === 0" class="receivables-page__empty">
        <EmptyStateIllustration
          type="no-transactions"
          class="receivables-page__empty-illustration"
        />
        <Heading level="h3" size="lg" weight="semibold">Sin cobros registrados</Heading>
        <Text size="sm" color="muted">Registra el dinero que te deben para hacer seguimiento.</Text>
      </div>
    </div>

    <!-- Create / Edit form modal -->
    <ModalWizard v-model:show="showForm">
      <AccountReceivableForm
        :account-id="editingAccount?.id"
        :initial-data="editingAccount?.data"
        @on-close="closeForm"
      />
    </ModalWizard>

    <!-- Collection form modal -->
    <ModalWizard v-model:show="showCollectionForm">
      <AccountReceivableCollectionForm
        v-if="selectedAccount"
        :account="selectedAccount"
        @on-close="closeCollectionForm"
      />
    </ModalWizard>

    <!-- Delete confirmation modal -->
    <ModalWizard v-model:show="showDeleteModal">
      <div class="receivables-page__delete-modal">
        <CardInfo
          title="Eliminar cobro"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title="¿Estás seguro de que deseas eliminar este cobro? Esta acción no se puede deshacer."
          sub-title-size="xs"
          sub-title-color="muted"
          icon="payments"
          icon-variant="primary"
          icon-size="md"
        />
        <div class="receivables-page__delete-actions">
          <Button variant="ghost" size="sm" @click="showDeleteModal = false">Cancelar</Button>
          <Button variant="danger" size="sm" @click="confirmDelete">Eliminar</Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .receivables-page {
    @apply space-y-4 px-4 py-2;
  }

  .receivables-page__header {
    @apply flex items-center justify-between;
  }

  .receivables-page__kpis {
    @apply grid grid-cols-1 gap-4 md:grid-cols-3;
  }

  .receivables-page__kpi-card {
    @apply !p-4;
  }

  .receivables-page__kpi {
    @apply flex items-center gap-3;
  }

  .receivables-page__kpi-icon {
    @apply text-2xl text-primary-600;
  }

  .receivables-page__kpi-icon--warning {
    @apply text-2xl text-warning-600;
  }

  .receivables-page__kpi-icon--danger {
    @apply text-2xl text-danger-600;
  }

  .receivables-page__charts {
    @apply grid grid-cols-1 gap-4 lg:grid-cols-2;
  }

  .receivables-page__chart-card {
    @apply flex flex-col gap-2 !p-4;
  }

  .receivables-page__chart {
    height: 240px;
    @apply mt-2 w-full;
  }

  .receivables-page__loading {
    @apply !p-8 text-center;
  }

  .receivables-page__list {
    @apply space-y-3;
  }

  .receivables-page__account-card {
    @apply rounded-lg border border-neutral-200 bg-white p-4 shadow-sm;
  }

  .receivables-page__account-header {
    @apply mb-3 flex items-start justify-between gap-2;
  }

  .receivables-page__account-info {
    @apply flex flex-col gap-0.5;
  }

  .receivables-page__account-amounts {
    @apply mb-2 grid grid-cols-2 items-end gap-4;
  }

  .receivables-page__account-due {
    @apply text-right;
  }

  .receivables-page__account-progress {
    @apply mb-3 flex flex-col gap-1;
  }

  .receivables-page__account-progress-info {
    @apply flex justify-between;
  }

  .receivables-page__progress-bar {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .receivables-page__progress-fill {
    @apply h-full rounded-full bg-primary-500 transition-all;
  }

  .receivables-page__account-due-row {
    @apply mb-3;
  }

  .receivables-page__overdue-alert {
    @apply mb-3 flex items-center gap-1.5 rounded-md bg-danger-50 px-3 py-1.5;
  }

  .receivables-page__overdue-icon {
    @apply text-sm text-danger-600;
  }

  .receivables-page__account-actions {
    @apply flex flex-wrap gap-2;
  }

  .receivables-page__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .receivables-page__empty-illustration {
    @apply h-32 w-32;
  }

  .receivables-page__delete-modal {
    @apply flex flex-col gap-6;
  }

  .receivables-page__delete-actions {
    @apply flex justify-end gap-2;
  }

  .receivables-page__kpi-overdue {
    @apply text-danger-600;
  }
</style>
