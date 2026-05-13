import { useAuthApi } from '@/composables/api/useAuthApi'
import { useUserApi } from '@/composables/api/useUserApi'
import { useAuthStore } from '@/stores/auth.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useUserStore } from '@/stores/user.store'
import { SESSION_DURATION } from '~/common/constants'
import type { UserMe } from '~/types/api'

export const useSession = () => {
  const authStore = useAuthStore()
  const financesStore = useFinancesStore()
  const userStore = useUserStore()
  const userApi = useUserApi()
  const authApi = useAuthApi()

  const resolveSessionExpiresAt = (expiresAt?: number | null) => {
    if (expiresAt) {
      return new Date(expiresAt * 1000)
    }

    return new Date(Date.now() + SESSION_DURATION)
  }

  const clearSessionState = () => {
    authStore.clearAuth()
    userStore.clearUser()
    financesStore.clearFinances()
  }

  const fetchUserMe = async (retried = false): Promise<UserMe['result'] | null> => {
    try {
      const { success, result } = await userApi.getUserMeWithCredentials()

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
      // On 401 and first attempt: try to refresh the token before giving up
      if (!retried) {
        const statusCode =
          (error as Record<string, unknown>)?.statusCode ??
          (error as Record<string, unknown>)?.status
        if (statusCode === 401) {
          try {
            const { success } = await authApi.refreshToken()
            if (success) return fetchUserMe(true)
          } catch {}
        }
      }
      console.error('❌ Error fetching user:', error)
      return null
    }
  }

  const initSession = async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (
      !force &&
      authStore.isInitialized &&
      authStore.isAuthenticated &&
      !authStore.isSessionExpired
    ) {
      return
    }

    try {
      authStore.setLoading(true)

      const result = await fetchUserMe()

      if (!result) {
        clearSessionState()
        return
      }

      const userData: UserMe['result'] = result

      authStore.setSession({
        user: {
          id: userData.user.id,
          email: userData.user.email,
          displayName: userData.user.displayName,
          avatar: userData.user.photo || null
        },
        isAuthenticated: true,
        sessionExpiresAt: resolveSessionExpiresAt(userData.expiresAt)
      })

      authStore.setOnboarding({
        isCompleted: userData.onboarding === 'COMPLETED'
      })
      authStore.setAccountType(userData.accountType)
    } catch (error) {
      clearSessionState()
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
