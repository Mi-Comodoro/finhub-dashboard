import { useAuthStore } from '@/stores/auth.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useUserStore } from '@/stores/user.store'
import { ACCESS_TOKEN, COOKIE_OPTIONS, SESSION_DURATION } from '~/common/constants'
import type { UserMe } from '~/types/api'

export const useSession = () => {
  const authStore = useAuthStore()
  const financesStore = useFinancesStore()
  const userStore = useUserStore()
  // Secure tokens (httpOnly: true)
  const token = useCookie(ACCESS_TOKEN, { ...COOKIE_OPTIONS })

  const initSession = async () => {
    if (authStore.isInitialized) return

    authStore.setLoading(true)

    try {
      if (!token.value) {
        if (authStore.isAuthenticated) {
          authStore.clearAuth()
        }
        return
      }

      const { success, result } = await $fetch<UserMe>('/api/users/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })

      if (!success || !result) {
        token.value = null
        authStore.clearAuth()
        return
      }

      // Set user session in auth store
      authStore.setSession({
        user: {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          avatar: result.user.photo || null
        },
        isAuthenticated: true,
        sessionExpiresAt: new Date(Date.now() + SESSION_DURATION)
      })
      userStore.setUser(result.user)

      // Set onboarding status
      authStore.setOnboarding({
        isCompleted: result.onboarding === 'COMPLETED' ? true : false
      })

      // Set account type
      authStore.setAccountType(result.accountType)

      // Set financial profile in finances store
      if (result.finances) {
        financesStore.setFinancialProfile(result.finances)

        // Initialize config from profile if needed
        financesStore.updateConfig({
          defaultCurrency: result.finances.currency
        })
      }
    } catch (error) {
      token.value = null
      authStore.clearAuth()
      console.error('❌ Error validating token:', error)
    } finally {
      authStore.setInitialized(true)
      authStore.setLoading(false)
    }
  }
  return {
    authStore,
    token,
    initSession,
    // Backwards compatibility getters
    get loggedIn() {
      return authStore.isAuthenticated
    },
    get initialized() {
      return authStore.isInitialized
    }
  }
}
