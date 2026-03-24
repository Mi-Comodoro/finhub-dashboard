import { useAccountStore } from '@/stores/account.store'
import type { AccountResponse, CompoundingFrequency } from '@/types/api'
export const useAccountSavings = () => {
  const error = ref('')
  const isLoading = ref(false)
  const accountStore = useAccountStore()
  const addAccount = async (data: {
    name: string
    description: string
    interestRate: number
    compoundingFrequency: CompoundingFrequency
    isActive: boolean
  }) => {
    isLoading.value = true
    const { success } = await $fetch<AccountResponse>('/api/accounts/create', {
      method: 'POST',
      body: data
    })
    isLoading.value = false
    if (!success) {
      error.value = 'Error al crear cuentas asociadas al ahorro'
    }
    await accountStore.fetchAccounts()
    return success
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
        description: 'Rendimiento superior (Neobancos/Cuentas de alto rendimiento)'
      }
    } else if (annualRate >= 5.0) {
      return {
        level: 'Media',
        description: 'Rendimiento competitivo (Supera la inflación)'
      }
    } else if (annualRate >= 1.0) {
      return {
        level: 'Baja',
        description: 'Rendimiento estándar (Banca tradicional)'
      }
    } else {
      return {
        level: 'Muy Baja',
        description: 'Rendimiento casi nulo (Ahorro tradicional)'
      }
    }
  }
  return { addAccount, getRateCategory, frequencyMap, error, isLoading }
}
