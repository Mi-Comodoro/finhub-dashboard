import { storeToRefs } from 'pinia'

import { useAccountsReceivableApi } from '~/composables/api/useAccountsReceivableApi'
import { useFinancesApplication } from '~/composables/application/useFinancesApplication'
import { useAccountsReceivableStore } from '~/stores/accounts-receivable.store'
import type { CreateAccountReceivableDto, RegisterCollectionDto } from '~/types/accounts-receivable.types'
import { CHART_COLORS } from '~/utils/design-tokens'

export const useAccountsReceivableApplication = () => {
  const api = useAccountsReceivableApi()
  const store = useAccountsReceivableStore()
  const { currency } = useFinancesApplication()
  const { accounts, summary, isLoading, error } = storeToRefs(store)

  const fetchAccounts = async () => {
    try {
      store.setLoading(true)
      store.setError(null)
      const { success, result } = await api.getAll()
      if (success && result) store.setAccounts(result)
      return { success }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar cobros'
      store.setError(msg)
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const { success, result } = await api.getSummary()
      if (success && result) store.setSummary(result)
      return { success }
    } catch {
      return { success: false }
    }
  }

  const loadAll = async () => {
    await Promise.all([fetchAccounts(), fetchSummary()])
  }

  const fetchById = async (id: string) => {
    try {
      const { success, result } = await api.getById(id)
      if (success && result) store.updateAccount(result)
      return { success, result }
    } catch {
      return { success: false, result: null }
    }
  }

  const createAccount = async (dto: CreateAccountReceivableDto) => {
    try {
      store.setLoading(true)
      store.setError(null)
      const { success } = await api.create(dto)
      if (success) await loadAll()
      return { success }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear cobro'
      store.setError(msg)
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const updateAccount = async (id: string, dto: Partial<CreateAccountReceivableDto>) => {
    try {
      store.setLoading(true)
      store.setError(null)
      const { success } = await api.update(id, dto)
      if (success) await loadAll()
      return { success }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar cobro'
      store.setError(msg)
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      store.setLoading(true)
      store.setError(null)
      const { success } = await api.remove(id)
      if (success) await loadAll()
      return { success }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar cobro'
      store.setError(msg)
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const registerCollection = async (id: string, dto: RegisterCollectionDto) => {
    try {
      store.setLoading(true)
      store.setError(null)
      await api.registerCollection(id, dto)
      await loadAll()
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar cobro'
      store.setError(msg)
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const agingData = computed(() => {
    const today = new Date()
    const buckets = [
      { label: 'Al día', color: CHART_COLORS.income, value: 0 },
      { label: '1–30 días', color: CHART_COLORS.savings, value: 0 },
      { label: '31–60 días', color: '#F97316', value: 0 },
      { label: '+60 días', color: CHART_COLORS.expense, value: 0 }
    ]

    for (const account of accounts.value) {
      if (account.status === 'collected') continue
      if (!account.dueDate) {
        buckets[0].value += Number(account.currentBalance)
        continue
      }
      const diff = Math.floor(
        (today.getTime() - new Date(account.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diff <= 0) buckets[0].value += Number(account.currentBalance)
      else if (diff <= 30) buckets[1].value += Number(account.currentBalance)
      else if (diff <= 60) buckets[2].value += Number(account.currentBalance)
      else buckets[3].value += Number(account.currentBalance)
    }

    return buckets
  })

  const flowData = computed(() => {
    const today = new Date()
    const months: { label: string; value: number }[] = []

    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const label = new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' }).format(d)
      const value = accounts.value
        .filter(a => {
          if (a.status === 'collected' || !a.dueDate) return false
          const due = new Date(a.dueDate)
          return due.getFullYear() === d.getFullYear() && due.getMonth() === d.getMonth()
        })
        .reduce((sum, a) => sum + Number(a.currentBalance), 0)
      months.push({ label, value })
    }

    return months
  })

  return {
    accounts,
    summary,
    isLoading,
    error,
    currency,
    agingData,
    flowData,
    loadAll,
    fetchById,
    createAccount,
    updateAccount,
    deleteAccount,
    registerCollection
  }
}
