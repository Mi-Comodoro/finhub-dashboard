import { useUserApi } from '@/composables/api/useUserApi'
import { useFinancesStore } from '@/stores/finances.store'
import { useUserStore } from '@/stores/user.store'
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
  const { updateUserProfile, updateFinancialProfile } = useUserApi()

  const updatePersonalInfo = async (data: UserUpdate) => {
    try {
      if (!userStore.id) {
        console.error('User ID is required to update profile')
        return { success: false }
      }

      const payload: UserUpdate = {}
      if (data.displayName) payload.displayName = data.displayName
      if (data.phone) payload.phone = data.phone
      if (data.gender) payload.gender = data.gender
      if (data.country) payload.country = data.country

      const response = await updateUserProfile(payload)

      if (!response.success) return { success: false }

      userStore.setUser({
        id: userStore.id,
        name: userStore.name || '',
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
      const financeId = financesStore.financeId
      if (!financeId) {
        console.error('Finance ID is required to update financial profile')
        return { success: false }
      }

      const response = await updateFinancialProfile(financeId, { profile: data.profile })
      if (!response.success) return { success: false }

      financesStore.updateFinancialProfile({ profile: data.profile })

      return { success: true }
    } catch (error) {
      console.error('Error updating financial info:', error)
      return { success: false }
    }
  }

  const avatarUrl = computed<string | null>(() => {
    if (!userStore.photo || userStore.rejectPhoto) return null
    return userStore.photo
  })

  const avatarInitials = computed<string>(() => {
    const name = userStore.name ?? ''
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0] ?? '')
      .join('')
      .toUpperCase()
  })

  const user = computed(() => ({
    displayName: userStore.displayName,
    email: userStore.email,
    photo: userStore.photo,
    phoneNumber: userStore.phone,
    status: userStore.isActive,
    gender: userStore.gender,
    country: userStore.country,
    trialEndsAt: userStore.trialEndsAt,
    createdAt: userStore.createdAt,
    isPhoneVerified: userStore.isPhoneVerified
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
    finances,
    avatarUrl,
    avatarInitials
  }
}
