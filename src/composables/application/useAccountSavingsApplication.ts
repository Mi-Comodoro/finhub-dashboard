import { useAccountApi } from '@/composables/api/useAccountApi'
import { useAccountStore } from '@/stores/account.store'
import type { AccountData, AccountResponse, CompoundingFrequency } from '@/types/api'
export const useAccountSavingsApplication = () => {
  const error = ref('')
  const isLoading = ref(false)
  const accountStore = useAccountStore()
  const accountApi = useAccountApi()
  const addAccount = async (data: {
    name: string
    description: string
    interestRate: number
    compoundingFrequency: CompoundingFrequency
    isActive: boolean
  }) => {
    isLoading.value = true
    const { success } = await accountApi.createAccount(data) as AccountResponse
    isLoading.value = false
    if (!success) {
      error.value = 'Error al crear cuentas asociadas al ahorro'
    }
    await accountStore.fetchAccounts()
    return success
  }

  const updateAccount = async (
    id: string,
    data: Partial<Omit<AccountData, 'id' | 'userId'>>
  ): Promise<{ success: boolean }> => {
    try {
      isLoading.value = true
      const response = await accountApi.updateAccount(id, data)
      isLoading.value = false
      if (response.success) {
        await accountStore.fetchAccounts()
      }
      return { success: response.success }
    } catch (err) {
      isLoading.value = false
      error.value = 'Error al actualizar cuenta'
      console.error('Error updating account:', err)
      return { success: false }
    }
  }

  const frequencyMap = (frequency: CompoundingFrequency) => {
    let freq: string = ''
    switch (frequency) {
      case 'daily':
        freq = 'Diario'
        break
      case 'monthly':
        freq = 'Mensual'
        break
      case 'annually':
        freq = 'Anual'
        break
    }
    return freq
  }
  const getRateCategory = (annualRate: number) => {
    if (annualRate >= 10.0) {
      return {
        level: 'Alta',
        description: 'Rendimiento superior'
      }
    } else if (annualRate >= 5.0) {
      return {
        level: 'Media',
        description: 'Rendimiento competitivo'
      }
    } else if (annualRate >= 1.0) {
      return {
        level: 'Baja',
        description: 'Rendimiento estándar'
      }
    } else {
      return {
        level: 'Muy Baja',
        description: 'Rendimiento casi nulo (Ahorro tradicional)'
      }
    }
  }
  const accounts = computed(() => accountStore.accounts)

  return { addAccount, updateAccount, getRateCategory, frequencyMap, error, isLoading, accounts }
}
