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

  /*   const initSession = async () => {
    // On client-side, ALWAYS try to restore from cookies first (ignore current auth state)
    if (!import.meta.server) {
      try {
        console.log('📊 CLIENT: Current auth state before restore:', authStore.isAuthenticated)

        // Always restore session from client-side cookies on client
        authStore.setSession({
          user: parsedUserData,
          isAuthenticated: true,
          sessionExpiresAt: new Date(parsedSessionState.sessionExpiresAt)
        })

        if (parsedSessionState.onboarding) {
          authStore.setOnboarding(parsedSessionState.onboarding)
        }

        if (parsedSessionState.accountType) {
          authStore.setAccountType(parsedSessionState.accountType)
        }

        console.log('✅ CLIENT: Session force restored from cookies')
        console.log('📊 CLIENT: New auth state after restore:', authStore.isAuthenticated)
        authStore.setInitialized(true)
        return
      } catch (error) {
        console.warn('⚠️ CLIENT: Failed to parse cookies:', error)
        userData.value = null
        sessionState.value = null
      }
    }

    // CLIENT: Clear auth if no cookies but thinks it's authenticated
    if (!import.meta.server && !userData.value && authStore.isAuthenticated) {
      console.log('🧹 CLIENT: No user cookies but store authenticated, clearing state')
      authStore.clearAuth()
    }

    if (authStore.isInitialized) return

    // Check if we have a token (server-side validation)
    if (token.value) {
      try {
        console.log('📡 Making request to /api/auth/me with token')
        // Validate token and get user data from backend
        const { success, result } = await $fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token.value}` }
        })

        console.log('📡 /api/auth/me response:', { success, hasResult: !!result })

        if (!success) throw new Error('Token validation failed')

        const userDataFromServer = result as {
          user: {
            id: string
            email: string
            displayName: string
            photo?: string | null
            photoURL?: string | null
            avatar?: string | null
          }
          onboarding: string
          accountType: AccountType
        }

        console.log('👤 Setting session with userData:', userDataFromServer.user)

        // Set session with real user data - handle multiple avatar field names
        const userAvatar =
          userDataFromServer.user.photoURL ||
          userDataFromServer.user.photo ||
          userDataFromServer.user.avatar ||
          null

        const sessionUserData = {
          id: userDataFromServer.user.id || 'user',
          email: userDataFromServer.user.email,
          displayName: userDataFromServer.user.displayName || 'Usuario',
          avatar: userAvatar
        }

        const sessionData = {
          user: sessionUserData,
          isAuthenticated: true,
          sessionExpiresAt: new Date(Date.now() + SESSION_DURATION)
        }

        // Store session in Pinia store
        authStore.setSession(sessionData)

        // Store user data in client-accessible cookies for persistence
        userData.value = JSON.stringify(sessionUserData)
        sessionState.value = JSON.stringify({
          sessionExpiresAt: sessionData.sessionExpiresAt.toISOString(),
          onboarding: userDataFromServer.onboarding,
          accountType: userDataFromServer.accountType
        })

        console.log('💾 Saved user data to client cookies for persistence')

        // Set onboarding status from backend
        const onboardingStatus: OnboardingStatus = {
          isCompleted: userDataFromServer.onboarding === 'COMPLETED',
          currentStep:
            userDataFromServer.onboarding === 'COMPLETED'
              ? ('completed' as const)
              : ('personal-info' as const),
          completedSteps:
            userDataFromServer.onboarding === 'COMPLETED'
              ? (['personal-info', 'finances-config', 'budget-strategy', 'completed'] as const)
              : []
        }
        authStore.setOnboarding(onboardingStatus)
        authStore.setAccountType(userDataFromServer.accountType)
      } catch (error: unknown) {
        console.error(
          '❌ Session initialization failed:',
          error instanceof Error ? error.message : error
        )
        console.log('🧹 Clearing token and auth state')
        token.value = null
        accountType.value = null
        userData.value = null
        sessionState.value = null
        authStore.clearAuth()
      }
    } else {
      console.log('🚫 No token found, skipping server session initialization')
      // If no token but store thinks it's authenticated, clear the store
      if (authStore.isAuthenticated && import.meta.server) {
        console.log('🧹 No token but store is authenticated on server, clearing auth state')
        userData.value = null
        sessionState.value = null
        authStore.clearAuth()
      }
    }

    console.log('✅ Setting isInitialized to true')
    console.log(
      '📊 Final state - Token:',
      token.value ? 'EXISTS' : 'NULL',
      'Store authenticated:',
      authStore.isAuthenticated
    )
    authStore.setInitialized(true)
  } */

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
        isCompleted: result.onboarding === 'COMPLETED' ? true : false,
        currentStep: result.onboarding === 'COMPLETED' ? 'completed' : 'personal-info',
        completedSteps:
          result.onboarding === 'COMPLETED'
            ? ['personal-info', 'finances-config', 'budget-strategy', 'completed']
            : []
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
