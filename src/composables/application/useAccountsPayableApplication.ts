import { useAccountsPayableApi } from '@/composables/api/useAccountsPayableApi'
import { useFinancesStore } from '@/stores/finances.store'
import type { Currency } from '@/utils/currency'
import type { CreateAccountPayableDto, RegisterPaymentDto } from '~/types/accounts-payable.types'

const TYPE_LABELS: Record<string, string> = {
  loan: 'Préstamo',
  credit_card: 'Tarjeta de crédito',
  installment: 'Cuotas',
  other: 'Otro'
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type
}

export function useAccountsPayableApplication() {
  const api = useAccountsPayableApi()
  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.defaultCurrency as Currency)

  const {
    data: accounts,
    refresh: refreshAccounts,
    pending: loadingAccounts
  } = useAsyncData('accounts-payable', () => api.getAll().then(r => r.result))

  const {
    data: summary,
    refresh: refreshSummary,
    pending: loadingSummary
  } = useAsyncData('accounts-payable-summary', () => api.getSummary().then(r => r.result))

  const refreshAll = () => Promise.all([refreshAccounts(), refreshSummary()])

  const createAccount = async (dto: CreateAccountPayableDto) => {
    await api.create(dto)
    await refreshAll()
  }

  const updateAccount = async (id: string, dto: Partial<CreateAccountPayableDto>) => {
    await api.update(id, dto)
    await refreshAll()
  }

  const deleteAccount = async (id: string) => {
    await api.remove(id)
    await refreshAll()
  }

  const registerPayment = async (id: string, dto: RegisterPaymentDto) => {
    await api.registerPayment(id, dto)
    await refreshAll()
  }

  const ratioStatus = computed(() => {
    const ratio = summary.value?.debtToIncomeRatio ?? 0
    if (ratio < 0.3) return { label: 'Saludable', color: 'primary' }
    if (ratio < 0.5) return { label: 'Moderado', color: 'warning' }
    return { label: 'Alto riesgo', color: 'danger' }
  })

  const byTypeChartData = computed(() =>
    Object.entries(summary.value?.byType ?? {}).map(([type, value]) => ({
      name: typeLabel(type),
      value
    }))
  )

  return {
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
  }
}
