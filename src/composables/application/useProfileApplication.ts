import { useFinancesStore } from '@/stores/finances.store'
import { useUserStore } from '@/stores/user.store'
import type { Currency } from '@/utils/currency'

interface UserUpdate {
  displayName?: string
  email?: string
  phone?: string
  gender?: string
  country?: string
}

export const useProfileApplication = () => {
  const userStore = useUserStore()
  const financesStore = useFinancesStore()

  const updatePersonalInfo = async (data: UserUpdate) => {
    try {
      if (!userStore.id) {
        console.error('User ID is required to update profile')
        return { success: false }
      }

      userStore.setUser({
        id: userStore.id,
        name: userStore.userInfo.name || '',
        displayName: data.displayName || userStore.displayName || '',
        email: data.email || userStore.email || '',
        phone: data.phone || userStore.phone || '',
        gender: data.gender || userStore.gender,
        country: data.country || userStore.country || '',
        photo: userStore.photo || undefined,
        trialEndsAt: userStore.trialEndsAt || undefined,
        isActive: userStore.isActive
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating personal info:', error)
      return { success: false }
    }
  }

  const updateFinancialInfo = async (data: {
    currency: string
    profile: string
    usage: string
  }) => {
    try {
      if (financesStore.financialProfile) {
        financesStore.updateFinancialProfile({
          currency: data.currency as Currency,
          profile: data.profile,
          usage: data.usage
        })
      }

      financesStore.updateConfig({
        defaultCurrency: data.currency as Currency
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating financial info:', error)
      return { success: false }
    }
  }

  const user = computed(() => ({
    displayName: userStore.displayName,
    email: userStore.email,
    photo: userStore.photo,
    phoneNumber: userStore.phone,
    status: userStore.isActive,
    gender: userStore.gender,
    country: userStore.country,
    trialEndsAt: userStore.trialEndsAt,
    createdAt: userStore.createdAt
  }))

  const finances = computed(() => ({
    currency: financesStore.defaultCurrency,
    profile: financesStore.financialProfile,
    usage: financesStore.financialUsage
  }))

  return {
    updatePersonalInfo,
    updateFinancialInfo,
    user,
    finances
  }
}
