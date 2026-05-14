<script setup lang="ts">
  import VChart from 'vue-echarts'

  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import AccountPayableForm from '@/components/business/debts/forms/AccountPayableForm.vue'
  import AccountPayablePaymentForm from '@/components/business/debts/forms/AccountPayablePaymentForm.vue'
  import { ModalWizard } from '@/components/organisms'
  import { useAccountsPayableApplication } from '@/composables/application/useAccountsPayableApplication'
  import { formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'
  import type { AccountPayable, CreateAccountPayableDto, RegisterPaymentDto } from '~/types/accounts-payable.types'

  definePageMeta({
    layout: 'dashboard',
    title: 'Cuentas por Pagar',
    breadcrumb: 'Deudas'
  })

  const {
    accounts,
    summary,
    loadingAccounts,
    loadingSummary,
    currency,
    ratioStatus,
    byTypeChartData,
    createAccount,
    updateAccount,
    deleteAccount,
    registerPayment
  } = useAccountsPayableApplication()

  const showForm = ref(false)
  const selectedAccount = ref<AccountPayable | null>(null)
  const showPaymentModal = ref(false)
  const paymentTarget = ref<AccountPayable | null>(null)
  const itemToDelete = ref<string | null>(null)

  const openCreate = () => {
    selectedAccount.value = null
    showForm.value = true
  }

  const openEdit = (account: AccountPayable) => {
    selectedAccount.value = account
    showForm.value = true
  }

  const openPayment = (account: AccountPayable) => {
    paymentTarget.value = account
    showPaymentModal.value = true
  }

  const handleFormSuccess = async (dto: CreateAccountPayableDto) => {
    if (selectedAccount.value) {
      await updateAccount(selectedAccount.value.id, dto)
    } else {
      await createAccount(dto)
    }
    showForm.value = false
  }

  const handlePaymentSuccess = async (dto: RegisterPaymentDto) => {
    if (!paymentTarget.value) return
    await registerPayment(paymentTarget.value.id, dto)
    showPaymentModal.value = false
  }

  const handleDelete = async (id: string) => {
    itemToDelete.value = id
    await deleteAccount(id)
    itemToDelete.value = null
  }

  const TYPE_LABELS: Record<string, string> = {
    loan: 'Préstamo',
    credit_card: 'Tarjeta de crédito',
    installment: 'Cuotas',
    other: 'Otro'
  }

  const TYPE_VARIANTS: Record<string, string> = {
    loan: 'primary',
    credit_card: 'danger',
    installment: 'warning',
    other: 'secondary'
  }

  const typeLabel = (type: string) => TYPE_LABELS[type] ?? type
  const typeVariant = (type: string) => TYPE_VARIANTS[type] ?? 'default'

  const paidPercent = (account: AccountPayable) => {
    if (!account.originalAmount) return 0
    return Math.min(
      ((account.originalAmount - account.currentBalance) / account.originalAmount) * 100,
      100
    )
  }

  const donutChartOption = computed(() => ({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        data: byTypeChartData.value,
        emphasis: { itemStyle: { shadowBlur: 10 } }
      }
    ]
  }))
</script>

<template>
  <div class="debts-page">
    <div class="debts-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Cuentas por Pagar</Heading>
        <Text size="xs" color="muted">Gestiona tus deudas y compromisos financieros.</Text>
      </div>
      <Button variant="primary" size="sm" @click="openCreate">
        <span class="material-symbols-outlined">add</span>
        Agregar deuda
      </Button>
    </div>

    <div class="debts-page__kpis">
      <div class="debts-page__kpi debts-page__kpi--danger">
        <Text size="xs" color="muted">Deuda total</Text>
        <USkeleton v-if="loadingSummary" class="debts-page__kpi-skeleton" />
        <Heading v-else level="h2" size="xl" weight="extrabold">
          {{ formatCurrency(summary?.totalDebt ?? 0, currency) }}
        </Heading>
      </div>

      <div class="debts-page__kpi debts-page__kpi--warning">
        <Text size="xs" color="muted">Compromisos mensuales</Text>
        <USkeleton v-if="loadingSummary" class="debts-page__kpi-skeleton" />
        <Heading v-else level="h2" size="xl" weight="extrabold">
          {{ formatCurrency(summary?.monthlyCommitments ?? 0, currency) }}
        </Heading>
      </div>

      <div class="debts-page__kpi" :class="`debts-page__kpi--${ratioStatus.color}`">
        <Text size="xs" color="muted">Ratio deuda/ingreso</Text>
        <USkeleton v-if="loadingSummary" class="debts-page__kpi-skeleton" />
        <template v-else>
          <Heading level="h2" size="xl" weight="extrabold">
            {{ ((summary?.debtToIncomeRatio ?? 0) * 100).toFixed(1) }}%
          </Heading>
          <Badge :variant="ratioStatus.color">{{ ratioStatus.label }}</Badge>
        </template>
      </div>

      <div class="debts-page__kpi debts-page__kpi--neutral">
        <Text size="xs" color="muted">Próximo vencimiento</Text>
        <USkeleton v-if="loadingSummary" class="debts-page__kpi-skeleton" />
        <Heading v-else level="h2" size="base" weight="extrabold">
          {{ summary?.nextDueDate ? DateUtils.formatDate(summary.nextDueDate) : 'Sin vencimientos' }}
        </Heading>
        <Badge v-if="(summary?.overdueCount ?? 0) > 0" variant="danger">
          {{ summary?.overdueCount }} vencida{{ (summary?.overdueCount ?? 0) > 1 ? 's' : '' }}
        </Badge>
      </div>
    </div>

    <div v-if="byTypeChartData.length > 0" class="debts-page__charts">
      <div class="debts-page__chart-card">
        <Text size="sm" weight="bold" color="black">Distribución por tipo</Text>
        <ClientOnly>
          <VChart :option="donutChartOption" style="height: 220px" />
        </ClientOnly>
      </div>
    </div>

    <div class="debts-page__list">
      <USkeleton v-if="loadingAccounts" class="debts-page__list-skeleton" />

      <div v-else-if="!accounts || accounts.length === 0" class="debts-page__empty">
        <EmptyStateIllustration type="no-transactions" class="debts-page__empty-illustration" />
        <Text size="sm" color="muted" class="debts-page__empty-text">
          Sin deudas registradas. Agrega tus préstamos, tarjetas y otros compromisos.
        </Text>
      </div>

      <template v-else>
      <div
        v-for="account in accounts ?? []"
        :key="account.id"
        class="debts-page__account-card"
      >
        <div class="debts-page__account-header">
          <Heading level="h3" size="base" weight="semibold">{{ account.name }}</Heading>
          <div class="debts-page__account-badges">
            <Badge :variant="typeVariant(account.type)">{{ typeLabel(account.type) }}</Badge>
            <Badge v-if="account.status === 'overdue'" variant="danger">Vencida</Badge>
            <Badge v-if="account.status === 'paid'" variant="success">Pagada</Badge>
          </div>
        </div>

        <div class="debts-page__account-progress">
          <div class="debts-page__account-amounts">
            <Text size="sm" color="muted">Balance actual</Text>
            <Text size="sm" weight="bold">
              {{ formatCurrency(account.currentBalance, currency) }}
            </Text>
          </div>
          <div class="debts-page__progress-track">
            <div
              class="debts-page__progress-fill"
              :style="{ width: `${paidPercent(account)}%` }"
            />
          </div>
          <Text size="xs" color="muted">
            {{ paidPercent(account).toFixed(0) }}% pagado de
            {{ formatCurrency(account.originalAmount, currency) }}
          </Text>
        </div>

        <Text v-if="account.nextPaymentDate" size="xs" color="muted">
          Próximo pago: {{ DateUtils.formatDate(account.nextPaymentDate) }}
        </Text>

        <div class="debts-page__account-actions">
          <Button size="sm" variant="secondary" @click="openPayment(account)">
            Registrar pago
          </Button>
          <Button size="sm" variant="ghost" @click="openEdit(account)">Editar</Button>
          <Button
            size="sm"
            variant="danger-ghost"
            :loading="itemToDelete === account.id"
            @click="handleDelete(account.id)"
          >
            Eliminar
          </Button>
        </div>
      </div>
      </template>
    </div>

    <ModalWizard :show="showForm">
      <AccountPayableForm
        :mode="selectedAccount ? 'edit' : 'create'"
        :initial-data="selectedAccount"
        @success="handleFormSuccess"
        @close="showForm = false"
      />
    </ModalWizard>

    <ModalWizard :show="showPaymentModal">
      <AccountPayablePaymentForm
        :account="paymentTarget"
        @success="handlePaymentSuccess"
        @close="showPaymentModal = false"
      />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .debts-page {
    @apply flex flex-col gap-6 px-4 py-2;
  }

  .debts-page__header {
    @apply flex flex-wrap items-start justify-between gap-4;
  }

  .debts-page__kpis {
    @apply grid grid-cols-2 gap-4 lg:grid-cols-4;
  }

  .debts-page__kpi {
    @apply flex flex-col gap-1 rounded-xl border p-4;
  }

  .debts-page__kpi--danger {
    @apply border-danger-100 bg-danger-50;
  }

  .debts-page__kpi--warning {
    @apply border-warning-100 bg-warning-50;
  }

  .debts-page__kpi--primary {
    @apply border-primary-100 bg-primary-50;
  }

  .debts-page__kpi--neutral {
    @apply border-neutral-200 bg-neutral-50;
  }

  .debts-page__kpi-skeleton {
    @apply h-8 w-32 rounded-md;
  }

  .debts-page__charts {
    @apply grid grid-cols-1 gap-4 md:grid-cols-2;
  }

  .debts-page__chart-card {
    @apply flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4;
  }

  .debts-page__list {
    @apply flex flex-col gap-4;
  }

  .debts-page__list-skeleton {
    @apply h-32 w-full rounded-xl;
  }

  .debts-page__account-card {
    @apply flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm;
  }

  .debts-page__account-header {
    @apply flex flex-wrap items-center gap-2;
  }

  .debts-page__account-badges {
    @apply flex flex-wrap gap-1;
  }

  .debts-page__account-progress {
    @apply flex flex-col gap-1;
  }

  .debts-page__account-amounts {
    @apply flex items-center justify-between;
  }

  .debts-page__progress-track {
    @apply h-2 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .debts-page__progress-fill {
    @apply h-full rounded-full bg-primary-500 transition-all duration-300;
  }

  .debts-page__account-actions {
    @apply flex flex-wrap gap-2 pt-1;
  }

  .debts-page__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .debts-page__empty-illustration {
    @apply h-32 w-32;
  }

  .debts-page__empty-text {
    @apply text-center;
  }
</style>
