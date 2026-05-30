<script setup lang="ts">
  import VChart from 'vue-echarts'

  import type { BadgeVariant } from '@/components/atoms/badge/types/badge.types'
  import EmptyState from '@/components/atoms/empty-state/EmptyState.vue'
  import AccountPayableForm from '@/components/business/debts/forms/AccountPayableForm.vue'
  import AccountPayablePaymentForm from '@/components/business/debts/forms/AccountPayablePaymentForm.vue'
  import AccountReceivableCollectionForm from '@/components/business/receivables/forms/AccountReceivableCollectionForm.vue'
  import AccountReceivableForm from '@/components/business/receivables/forms/AccountReceivableForm.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useAccountsPayableApplication } from '@/composables/application/useAccountsPayableApplication'
  import { useAccountsReceivableApplication } from '@/composables/application/useAccountsReceivableApplication'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useTheme } from '@/composables/useTheme'
  import { useFinancesStore } from '@/stores/finances.store'
  import type { AccountReceivable } from '@/types/accounts-receivable.types'
  import { formatCompactCurrency, formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'
  import type { AccountPayable, CreateAccountPayableDto } from '~/types/accounts-payable.types'

  definePageMeta({
    layout: 'dashboard',
    title: 'Cuentas',
    breadcrumb: 'Cuentas'
  })

  type TabKey = 'cobrar' | 'pagar'
  const activeTab = ref<TabKey>('cobrar')

  const { isDark } = useTheme()
  const chartAxisColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'))
  const chartGridColor = computed(() => (isDark.value ? '#334155' : '#e2e8f0'))
  const chartLegendColor = computed(() => (isDark.value ? '#94a3b8' : '#374151'))
  const chartPrimaryColor = computed(() => (isDark.value ? '#2dd4bf' : '#0d9488'))
  const chartPrimaryArea = computed(() =>
    isDark.value ? 'rgba(45, 212, 191, 0.1)' : 'rgba(13, 148, 136, 0.1)'
  )

  // --- Shared ---
  const { fetchCurrentBudget } = useBudgetActions()
  const financesStore = useFinancesStore()
  const { success: successToast, error: errorToast } = useFeedback()

  // ============================================================
  // RECEIVABLES (Cuentas por Cobrar)
  // ============================================================
  const {
    accounts: receivableAccounts,
    summary: receivableSummary,
    isLoading: isLoadingReceivables,
    currency: receivableCurrency,
    agingData,
    flowData,
    loadAll,
    deleteAccount: deleteReceivable
  } = useAccountsReceivableApplication()

  const showReceivableForm = ref(false)
  const showCollectionForm = ref(false)
  const showDeleteReceivableModal = ref(false)
  const editingReceivable = ref<{ id: string; data: Record<string, unknown> } | null>(null)
  const selectedReceivable = ref<AccountReceivable | null>(null)
  const receivableToDelete = ref<string | null>(null)

  const openCreateReceivable = () => {
    editingReceivable.value = null
    showReceivableForm.value = true
  }

  const openEditReceivable = (account: AccountReceivable) => {
    editingReceivable.value = {
      id: account.id,
      data: {
        name: account.name,
        debtor: account.debtor,
        originalAmount: account.originalAmount,
        dueDate: account.dueDate,
        notes: account.notes
      }
    }
    showReceivableForm.value = true
  }

  const closeReceivableForm = () => {
    showReceivableForm.value = false
    editingReceivable.value = null
  }

  const openCollection = (account: AccountReceivable) => {
    selectedReceivable.value = account
    showCollectionForm.value = true
  }

  const closeCollectionForm = () => {
    showCollectionForm.value = false
    selectedReceivable.value = null
  }

  const handleDeleteReceivable = (id: string) => {
    receivableToDelete.value = id
    showDeleteReceivableModal.value = true
  }

  const confirmDeleteReceivable = async () => {
    if (!receivableToDelete.value) return
    const { success } = await deleteReceivable(receivableToDelete.value)
    showDeleteReceivableModal.value = false
    receivableToDelete.value = null
    if (success) {
      successToast('Cobro eliminado', 'El cobro fue eliminado correctamente.')
    } else {
      errorToast('Error', 'No se pudo eliminar el cobro.')
    }
  }

  const receivableStatusLabel = (status: AccountReceivable['status']): string => {
    const labels: Record<AccountReceivable['status'], string> = {
      pending: 'Pendiente',
      partial: 'Parcial',
      collected: 'Cobrado',
      overdue: 'Vencido'
    }
    return labels[status]
  }

  const receivableStatusVariant = (status: AccountReceivable['status']): BadgeVariant => {
    const variants: Record<AccountReceivable['status'], BadgeVariant> = {
      pending: 'default',
      partial: 'warning',
      collected: 'success',
      overdue: 'danger'
    }
    return variants[status]
  }

  const agingChartOption = computed(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: { value: number }[]) =>
        formatCurrency(params[0]?.value ?? 0, receivableCurrency.value)
    },
    grid: { left: '3%', right: '6%', top: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatCompactCurrency(v, receivableCurrency.value),
        color: chartAxisColor.value
      },
      splitLine: { lineStyle: { color: chartGridColor.value, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: agingData.value.map(b => b.label),
      axisLabel: { color: chartAxisColor.value }
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
        formatCurrency(params[0]?.value ?? 0, receivableCurrency.value)
    },
    grid: { left: '3%', right: '4%', top: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: flowData.value.map(m => m.label),
      boundaryGap: false,
      axisLabel: { color: chartAxisColor.value }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatCompactCurrency(v, receivableCurrency.value),
        color: chartAxisColor.value
      },
      splitLine: { lineStyle: { color: chartGridColor.value, type: 'dashed' } }
    },
    series: [
      {
        type: 'line',
        data: flowData.value.map(m => m.value),
        smooth: true,
        lineStyle: { color: chartPrimaryColor.value, width: 2 },
        itemStyle: { color: chartPrimaryColor.value },
        areaStyle: { color: chartPrimaryArea.value }
      }
    ]
  }))

  // ============================================================
  // PAYABLE (Cuentas por Pagar)
  // ============================================================
  const {
    accounts: payableAccounts,
    summary: payableSummary,
    loadingAccounts: isLoadingPayable,
    loadingSummary: isLoadingPayableSummary,
    currency: payableCurrency,
    ratioStatus,
    byTypeChartData,
    createAccount: createPayable,
    updateAccount: updatePayable,
    deleteAccount: deletePayable
  } = useAccountsPayableApplication()

  const showPayableForm = ref(false)
  const isPayableFormLoading = ref(false)
  const selectedPayable = ref<AccountPayable | null>(null)
  const showPaymentModal = ref(false)
  const paymentTarget = ref<AccountPayable | null>(null)
  const payableToDelete = ref<string | null>(null)
  const showDeletePayableModal = ref(false)

  const openCreatePayable = () => {
    selectedPayable.value = null
    showPayableForm.value = true
  }

  const openEditPayable = (account: AccountPayable) => {
    selectedPayable.value = account
    showPayableForm.value = true
  }

  const openPayment = (account: AccountPayable) => {
    paymentTarget.value = account
    showPaymentModal.value = true
  }

  const handlePayableFormSuccess = async (dto: CreateAccountPayableDto) => {
    isPayableFormLoading.value = true
    try {
      if (selectedPayable.value) {
        await updatePayable(selectedPayable.value.id, dto)
      } else {
        await createPayable(dto)
      }
      showPayableForm.value = false
    } finally {
      isPayableFormLoading.value = false
    }
  }

  const handleDeletePayable = (id: string) => {
    payableToDelete.value = id
    showDeletePayableModal.value = true
  }

  const confirmDeletePayable = async () => {
    if (!payableToDelete.value) return
    await deletePayable(payableToDelete.value)
    showDeletePayableModal.value = false
    payableToDelete.value = null
  }

  const TYPE_LABELS: Record<string, string> = {
    loan: 'Préstamo',
    credit_card: 'Tarjeta de crédito',
    installment: 'Cuotas',
    other: 'Otro'
  }

  const TYPE_VARIANTS: Record<string, BadgeVariant> = {
    loan: 'primary',
    credit_card: 'danger',
    installment: 'warning',
    other: 'secondary'
  }

  const typeLabel = (type: string) => TYPE_LABELS[type] ?? type
  const typeVariant = (type: string): BadgeVariant => TYPE_VARIANTS[type] ?? 'default'

  const paidPercent = (account: AccountPayable) => {
    if (!account.originalAmount) return 0
    return Math.min(
      ((account.originalAmount - account.currentBalance) / account.originalAmount) * 100,
      100
    )
  }

  const donutChartOption = computed(() => ({
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: chartLegendColor.value, fontSize: 11 }
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        data: byTypeChartData.value,
        label: { color: chartAxisColor.value },
        emphasis: { itemStyle: { shadowBlur: 10 } }
      }
    ]
  }))

  // ============================================================
  // INIT
  // ============================================================
  onMounted(async () => {
    await Promise.all([loadAll(), fetchCurrentBudget(financesStore.profile?.id ?? '')])
  })
</script>

<template>
  <div class="accounts-page">
    <!-- Page header -->
    <div class="accounts-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Cuentas</Heading>
        <Text size="xs" color="muted">Gestiona tus cuentas por cobrar y por pagar</Text>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="accounts-page__tabs">
      <button
        class="accounts-page__tab"
        :class="{ 'accounts-page__tab--active': activeTab === 'cobrar' }"
        @click="activeTab = 'cobrar'"
      >
        <span class="material-symbols-outlined accounts-page__tab-icon">payments</span>
        Cuentas por Cobrar
      </button>
      <button
        class="accounts-page__tab"
        :class="{ 'accounts-page__tab--active': activeTab === 'pagar' }"
        @click="activeTab = 'pagar'"
      >
        <span class="material-symbols-outlined accounts-page__tab-icon">credit_score</span>
        Cuentas por Pagar
      </button>
    </div>

    <!-- ===================== RECEIVABLES ===================== -->
    <section v-if="activeTab === 'cobrar'" class="accounts-page__section">
      <div class="accounts-page__section-header">
        <div>
          <Heading level="h2" size="xl" weight="semibold">Cuentas por Cobrar</Heading>
          <Text size="xs" color="muted">Gestiona el dinero que te deben</Text>
        </div>
        <Button variant="primary" size="sm" icon="add" @click="openCreateReceivable">
          Agregar cobro
        </Button>
      </div>

      <!-- KPI Cards -->
      <div class="accounts-page__kpis">
        <Card class="accounts-page__kpi-card">
          <div class="accounts-page__kpi">
            <span class="material-symbols-outlined accounts-page__kpi-icon">account_balance</span>
            <div>
              <Text size="xs" color="muted">Total por cobrar</Text>
              <Heading level="h3" size="xl" weight="bold">
                {{ formatCurrency(receivableSummary?.totalReceivable ?? 0, receivableCurrency) }}
              </Heading>
            </div>
          </div>
        </Card>

        <Card class="accounts-page__kpi-card">
          <div class="accounts-page__kpi">
            <span class="material-symbols-outlined accounts-page__kpi-icon--warning">
              calendar_month
            </span>
            <div>
              <Text size="xs" color="muted">Esperado este mes</Text>
              <Heading level="h3" size="xl" weight="bold">
                {{ formatCurrency(receivableSummary?.expectedThisMonth ?? 0, receivableCurrency) }}
              </Heading>
            </div>
          </div>
        </Card>

        <Card class="accounts-page__kpi-card">
          <div class="accounts-page__kpi">
            <span
              class="material-symbols-outlined"
              :class="
                (receivableSummary?.overdueCount ?? 0) > 0
                  ? 'accounts-page__kpi-icon--danger'
                  : 'accounts-page__kpi-icon'
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
                :class="
                  (receivableSummary?.overdueCount ?? 0) > 0 ? 'accounts-page__kpi-overdue' : ''
                "
              >
                {{ receivableSummary?.overdueCount ?? 0 }}
              </Heading>
            </div>
          </div>
        </Card>
      </div>

      <!-- Charts -->
      <div class="accounts-page__charts">
        <Card class="accounts-page__chart-card">
          <Heading level="h3" size="lg" weight="semibold">Antigüedad de cobros</Heading>
          <Text size="xs" color="muted">Distribución por antigüedad de vencimiento</Text>
          <ClientOnly>
            <VChart :option="agingChartOption" autoresize class="accounts-page__chart" />
          </ClientOnly>
        </Card>
        <Card class="accounts-page__chart-card">
          <Heading level="h3" size="lg" weight="semibold">Flujo esperado</Heading>
          <Text size="xs" color="muted">Cobros proyectados próximos 3 meses</Text>
          <ClientOnly>
            <VChart :option="flowChartOption" autoresize class="accounts-page__chart" />
          </ClientOnly>
        </Card>
      </div>

      <!-- Loading -->
      <div
        v-if="isLoadingReceivables && receivableAccounts.length === 0"
        class="accounts-page__loading"
      >
        <div class="accounts-page__list-skeleton" />
      </div>

      <!-- Account list -->
      <div v-else class="accounts-page__list">
        <div
          v-for="account in receivableAccounts"
          :key="account.id"
          class="accounts-page__account-card"
        >
          <div class="accounts-page__account-header">
            <div class="accounts-page__account-info">
              <Heading level="h3" size="base" weight="semibold">{{ account.name }}</Heading>
              <Text v-if="account.debtor" size="xs" color="muted">{{ account.debtor }}</Text>
              <Text v-if="account.notes" size="xs" color="muted">{{ account.notes }}</Text>
            </div>
            <Badge :variant="receivableStatusVariant(account.status)">
              {{ receivableStatusLabel(account.status) }}
            </Badge>
          </div>

          <div class="accounts-page__account-amounts">
            <div>
              <Text size="xs" color="muted">Monto original</Text>
              <Text size="xs" color="muted">
                {{ formatCurrency(account.originalAmount, receivableCurrency) }}
              </Text>
            </div>
            <div class="accounts-page__account-due">
              <Text size="xs" color="muted">Saldo pendiente</Text>
              <Heading level="h3" size="xl" weight="bold">
                {{ formatCurrency(account.currentBalance, receivableCurrency) }}
              </Heading>
            </div>
          </div>

          <div class="accounts-page__account-progress">
            <Text size="xs" color="muted">
              Cobrado:
              {{
                formatCurrency(account.originalAmount - account.currentBalance, receivableCurrency)
              }}
              / {{ formatCurrency(account.originalAmount, receivableCurrency) }}
            </Text>
            <div class="accounts-page__progress-bar">
              <div
                class="accounts-page__progress-fill"
                :style="{
                  width: `${Math.min(100, Math.max(0, ((account.originalAmount - account.currentBalance) / account.originalAmount) * 100))}%`
                }"
              />
            </div>
          </div>

          <div v-if="account.dueDate" class="accounts-page__account-due-row">
            <Text size="xs" color="muted">
              Esperado: {{ DateUtils.formatDate(account.dueDate, 'short') }}
            </Text>
          </div>

          <div v-if="account.status === 'overdue'" class="accounts-page__overdue-alert">
            <span class="material-symbols-outlined accounts-page__overdue-icon">warning</span>
            <Text size="xs" class="accounts-page__overdue-text">Este cobro está vencido</Text>
          </div>

          <div class="accounts-page__account-actions">
            <Button
              v-if="account.status !== 'collected'"
              size="sm"
              variant="primary"
              @click="openCollection(account)"
            >
              Recibir cobro
            </Button>
            <Button size="sm" variant="ghost" @click="openEditReceivable(account)">Editar</Button>
            <Button size="sm" variant="danger" @click="handleDeleteReceivable(account.id)">
              Eliminar
            </Button>
          </div>
        </div>

        <EmptyState
          v-if="!isLoadingReceivables && receivableAccounts.length === 0"
          title="Sin cobros registrados"
          description="Registra el dinero que te deben para hacer seguimiento."
          illustration="no-transactions"
        />
      </div>
    </section>

    <!-- ===================== PAYABLE ===================== -->
    <section v-if="activeTab === 'pagar'" class="accounts-page__section">
      <div class="accounts-page__section-header">
        <div>
          <Heading level="h2" size="xl" weight="semibold">Cuentas por Pagar</Heading>
          <Text size="xs" color="muted">Gestiona tus deudas y compromisos financieros</Text>
        </div>
        <Button variant="primary" size="sm" icon="add" @click="openCreatePayable">
          Agregar deuda
        </Button>
      </div>

      <!-- KPI Cards -->
      <div class="accounts-page__kpis accounts-page__kpis--payable">
        <div class="accounts-page__kpi-box accounts-page__kpi-box--danger">
          <Text size="xs" color="muted">Deuda total</Text>
          <div v-if="isLoadingPayableSummary" class="accounts-page__kpi-skeleton" />
          <Heading v-else level="h2" size="xl" weight="extrabold">
            {{ formatCurrency(payableSummary?.totalDebt ?? 0, payableCurrency) }}
          </Heading>
        </div>

        <div class="accounts-page__kpi-box accounts-page__kpi-box--warning">
          <Text size="xs" color="muted">Compromisos mensuales</Text>
          <div v-if="isLoadingPayableSummary" class="accounts-page__kpi-skeleton" />
          <Heading v-else level="h2" size="xl" weight="extrabold">
            {{ formatCurrency(payableSummary?.monthlyCommitments ?? 0, payableCurrency) }}
          </Heading>
        </div>

        <div class="accounts-page__kpi-box" :class="`accounts-page__kpi-box--${ratioStatus.color}`">
          <Text size="xs" color="muted">Ratio deuda/ingreso</Text>
          <div v-if="isLoadingPayableSummary" class="accounts-page__kpi-skeleton" />
          <template v-else>
            <Heading level="h2" size="xl" weight="extrabold">
              {{ ((payableSummary?.debtToIncomeRatio ?? 0) * 100).toFixed(1) }}%
            </Heading>
            <Badge :variant="ratioStatus.color">{{ ratioStatus.label }}</Badge>
          </template>
        </div>

        <div class="accounts-page__kpi-box accounts-page__kpi-box--neutral">
          <Text size="xs" color="muted">Próximo vencimiento</Text>
          <div v-if="isLoadingPayableSummary" class="accounts-page__kpi-skeleton" />
          <template v-else>
            <Heading level="h2" size="base" weight="extrabold">
              {{
                payableSummary?.nextDueDate
                  ? DateUtils.formatDate(payableSummary.nextDueDate)
                  : 'Sin vencimientos'
              }}
            </Heading>
            <Badge v-if="(payableSummary?.overdueCount ?? 0) > 0" variant="danger">
              {{ payableSummary?.overdueCount }}
              vencida{{ (payableSummary?.overdueCount ?? 0) > 1 ? 's' : '' }}
            </Badge>
          </template>
        </div>
      </div>

      <!-- Chart -->
      <div
        v-if="byTypeChartData.length > 0"
        class="accounts-page__charts accounts-page__charts--single"
      >
        <div class="accounts-page__chart-card-plain">
          <Text size="sm" weight="bold" color="black">Distribución por tipo</Text>
          <ClientOnly>
            <VChart :option="donutChartOption" style="height: 220px" />
          </ClientOnly>
        </div>
      </div>

      <!-- Account list -->
      <div class="accounts-page__list">
        <div v-if="isLoadingPayable" class="accounts-page__list-skeleton" />

        <EmptyState
          v-else-if="!payableAccounts || payableAccounts.length === 0"
          title="Sin deudas registradas"
          description="Agrega tus préstamos, tarjetas y otros compromisos."
          illustration="no-transactions"
        />

        <template v-else>
          <div
            v-for="account in payableAccounts ?? []"
            :key="account.id"
            class="accounts-page__account-card"
          >
            <div class="accounts-page__account-header">
              <Heading level="h3" size="base" weight="semibold">{{ account.name }}</Heading>
              <div class="accounts-page__account-badges">
                <Badge :variant="typeVariant(account.type)">{{ typeLabel(account.type) }}</Badge>
                <Badge v-if="account.status === 'overdue'" variant="danger">Vencida</Badge>
                <Badge v-if="account.status === 'paid'" variant="success">Pagada</Badge>
              </div>
            </div>

            <div class="accounts-page__payable-progress">
              <div class="accounts-page__account-amounts--row">
                <Text size="sm" color="muted">Balance actual</Text>
                <Text size="sm" weight="bold">
                  {{ formatCurrency(account.currentBalance, payableCurrency) }}
                </Text>
              </div>
              <div class="accounts-page__progress-track">
                <div
                  class="accounts-page__progress-fill--payable"
                  :style="{ width: `${paidPercent(account)}%` }"
                />
              </div>
              <Text size="xs" color="muted">
                {{ paidPercent(account).toFixed(0) }}% pagado de
                {{ formatCurrency(account.originalAmount, payableCurrency) }}
              </Text>
            </div>

            <Text v-if="account.nextPaymentDate" size="xs" color="muted">
              Próximo pago: {{ DateUtils.formatDate(account.nextPaymentDate) }}
            </Text>

            <div class="accounts-page__account-actions">
              <Button size="sm" variant="secondary" @click="openPayment(account)">
                Registrar pago
              </Button>
              <Button size="sm" variant="ghost" @click="openEditPayable(account)">Editar</Button>
              <Button size="sm" variant="danger" @click="handleDeletePayable(account.id)">
                Eliminar
              </Button>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- ===================== MODALS ===================== -->

    <!-- Receivable: create / edit -->
    <ModalWizard v-model:show="showReceivableForm">
      <AccountReceivableForm
        :account-id="editingReceivable?.id"
        :initial-data="editingReceivable?.data"
        @on-close="closeReceivableForm"
      />
    </ModalWizard>

    <!-- Receivable: register collection -->
    <ModalWizard v-model:show="showCollectionForm">
      <AccountReceivableCollectionForm
        v-if="selectedReceivable"
        :account="selectedReceivable"
        @on-close="closeCollectionForm"
      />
    </ModalWizard>

    <!-- Receivable: delete confirmation -->
    <ModalWizard v-model:show="showDeleteReceivableModal">
      <div class="accounts-page__delete-modal">
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
        <div class="accounts-page__delete-actions">
          <Button variant="ghost" size="sm" @click="showDeleteReceivableModal = false">
            Cancelar
          </Button>
          <Button variant="danger" size="sm" @click="confirmDeleteReceivable">Eliminar</Button>
        </div>
      </div>
    </ModalWizard>

    <!-- Payable: create / edit -->
    <ModalWizard :show="showPayableForm">
      <AccountPayableForm
        :mode="selectedPayable ? 'edit' : 'create'"
        :initial-data="selectedPayable"
        :is-loading="isPayableFormLoading"
        @success="handlePayableFormSuccess"
        @close="showPayableForm = false"
      />
    </ModalWizard>

    <!-- Payable: register payment -->
    <ModalWizard :show="showPaymentModal">
      <AccountPayablePaymentForm :account="paymentTarget" @close="showPaymentModal = false" />
    </ModalWizard>

    <!-- Payable: delete confirmation -->
    <ModalWizard v-model:show="showDeletePayableModal">
      <div class="accounts-page__delete-modal">
        <CardInfo
          title="Eliminar deuda"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title="¿Estás seguro de que deseas eliminar esta deuda? Esta acción no se puede deshacer."
          sub-title-size="xs"
          sub-title-color="muted"
          icon="credit_score"
          icon-variant="primary"
          icon-size="md"
        />
        <div class="accounts-page__delete-actions">
          <Button variant="ghost" size="sm" @click="showDeletePayableModal = false">
            Cancelar
          </Button>
          <Button variant="danger" size="sm" @click="confirmDeletePayable">Eliminar</Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .accounts-page {
    @apply flex flex-col gap-6 px-4 py-2;
  }

  .accounts-page__header {
    @apply flex flex-wrap items-start justify-between gap-4;
  }

  /* ---- Tabs ---- */
  .accounts-page__tabs {
    @apply flex gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .accounts-page__tab {
    @apply flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900;
    @apply dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white;
  }

  .accounts-page__tab--active {
    @apply bg-white font-semibold text-neutral-900 shadow-sm;
    @apply dark:bg-neutral-700 dark:text-white dark:shadow-none;
  }

  .accounts-page__tab-icon {
    @apply text-base;
  }

  /* ---- Section ---- */
  .accounts-page__section {
    @apply flex flex-col gap-5;
  }

  .accounts-page__section-header {
    @apply flex flex-wrap items-start justify-between gap-4;
  }

  /* ---- KPI Cards — receivables (Card component wrapper) ---- */
  .accounts-page__kpis {
    @apply grid grid-cols-1 gap-4 md:grid-cols-3;
  }

  .accounts-page__kpi-card {
    @apply !p-4;
  }

  .accounts-page__kpi {
    @apply flex items-center gap-3;
  }

  .accounts-page__kpi-icon {
    @apply text-2xl text-primary-600;
  }

  .accounts-page__kpi-icon--warning {
    @apply text-2xl text-warning-600 dark:text-warning-400;
  }

  .accounts-page__kpi-icon--danger {
    @apply text-2xl text-danger-600 dark:text-danger-400;
  }

  .accounts-page__kpi-overdue {
    @apply text-danger-600 dark:text-danger-400;
  }

  /* ---- KPI boxes — payable (inline bordered boxes) ---- */
  .accounts-page__kpis--payable {
    @apply grid-cols-2 lg:grid-cols-4;
  }

  .accounts-page__kpi-box {
    @apply flex flex-col gap-1 rounded-xl border p-4;
  }

  .accounts-page__kpi-box--danger {
    @apply border-danger-100 bg-danger-50;
    @apply dark:border-danger-900/40 dark:bg-danger-900/20;
  }

  .accounts-page__kpi-box--warning {
    @apply border-warning-100 bg-warning-50;
    @apply dark:border-warning-900/40 dark:bg-warning-900/20;
  }

  .accounts-page__kpi-box--primary {
    @apply border-primary-100 bg-primary-50;
    @apply dark:border-primary-900/40 dark:bg-primary-900/20;
  }

  .accounts-page__kpi-box--neutral {
    @apply border-neutral-200 bg-neutral-50;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .accounts-page__kpi-skeleton {
    @apply h-8 w-32 animate-pulse rounded-md bg-slate-100 dark:bg-neutral-700;
  }

  /* ---- Charts ---- */
  .accounts-page__charts {
    @apply grid grid-cols-1 gap-4 lg:grid-cols-2;
  }

  .accounts-page__charts--single {
    @apply lg:grid-cols-1 xl:w-1/2;
  }

  .accounts-page__chart-card {
    @apply flex flex-col gap-2 !p-4;
  }

  .accounts-page__chart-card-plain {
    @apply flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .accounts-page__chart {
    height: 240px;
    @apply mt-2 w-full;
  }

  .accounts-page__loading {
    @apply !p-8 text-center;
  }

  /* ---- Account list ---- */
  .accounts-page__list {
    @apply flex flex-col gap-4;
  }

  .accounts-page__list-skeleton {
    @apply h-32 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-700;
  }

  .accounts-page__account-card {
    @apply flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm;
    @apply dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-none;
  }

  .accounts-page__account-header {
    @apply flex flex-wrap items-start justify-between gap-2;
  }

  .accounts-page__account-info {
    @apply flex flex-col gap-0.5;
  }

  .accounts-page__account-badges {
    @apply flex flex-wrap gap-1;
  }

  .accounts-page__account-amounts {
    @apply grid grid-cols-2 items-end gap-4;
  }

  .accounts-page__account-due {
    @apply text-right;
  }

  .accounts-page__account-progress {
    @apply flex flex-col gap-1;
  }

  .accounts-page__progress-bar {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700;
  }

  .accounts-page__progress-fill {
    @apply h-full rounded-full bg-primary-500 transition-all;
  }

  .accounts-page__payable-progress {
    @apply flex flex-col gap-1;
  }

  .accounts-page__account-amounts--row {
    @apply flex items-center justify-between;
  }

  .accounts-page__progress-track {
    @apply h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700;
  }

  .accounts-page__progress-fill--payable {
    @apply h-full rounded-full bg-primary-500 transition-all duration-300;
  }

  .accounts-page__account-due-row {
    @apply -mt-1;
  }

  .accounts-page__overdue-alert {
    @apply flex items-center gap-1.5 rounded-md bg-danger-50 px-3 py-1.5;
    @apply dark:bg-danger-900/20;
  }

  .accounts-page__overdue-icon {
    @apply text-sm text-danger-600 dark:text-danger-400;
  }

  .accounts-page__overdue-text {
    @apply text-danger-500 dark:text-danger-400;
  }

  .accounts-page__account-actions {
    @apply flex flex-wrap gap-2 pt-1;
  }

  /* ---- Delete modal ---- */
  .accounts-page__delete-modal {
    @apply flex flex-col gap-6;
  }

  .accounts-page__delete-actions {
    @apply flex justify-end gap-2;
  }
</style>
