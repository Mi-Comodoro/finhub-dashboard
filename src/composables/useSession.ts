import { useAuthStore } from '@/stores/auth.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useUserStore } from '@/stores/user.store'
import { SESSION_DURATION } from '~/common/constants'
import type { UserMe } from '~/types/api'

export const useSession = () => {
  const authStore = useAuthStore()
  const financesStore = useFinancesStore()
  const userStore = useUserStore()

  /**
   * Reusable request para obtener los datos del usuario
   */
  const fetchUserMe = async () => {
    try {
      const { success, result } = await $fetch<UserMe>('/api/users/me', { credentials: 'include' })
      if (!success) return null
      if (result.finances) {
        financesStore.setFinancialProfile(result.finances)
        financesStore.updateConfig({
          defaultCurrency: result.finances.currency
        })
      }
      userStore.setUser(result.user)
      return result
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      return null
    }
  }

  const initSession = async () => {
    if (authStore.isInitialized && authStore.isAuthenticated) return
    try {
      authStore.setLoading(true)
      const result = await fetchUserMe()
      if (!result) {
        return
      }

      const userData: UserMe['result'] = result // 👈 clave

      authStore.setSession({
        user: {
          id: userData.user.id,
          email: userData.user.email,
          displayName: userData.user.displayName,
          avatar: userData.user.photo || null
        },
        isAuthenticated: true,
        sessionExpiresAt: new Date(Date.now() + SESSION_DURATION)
      })

      authStore.setOnboarding({
        isCompleted: userData.onboarding === 'COMPLETED' ? true : false
      })
      authStore.setAccountType(userData.accountType)
    } catch (error) {
      authStore.clearAuth()
      console.error('❌ Error validating token:', error)
    } finally {
      authStore.setInitialized(true)
      authStore.setLoading(false)
    }
  }

  return {
    authStore,
    initSession,
    fetchUserMe,
    get loggedIn() {
      return authStore.isAuthenticated
    },
    get initialized() {
      return authStore.isInitialized
    }
  }
}
