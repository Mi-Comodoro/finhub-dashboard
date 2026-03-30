import type { User } from 'firebase/auth'
import { computed, ref } from 'vue'

import { ACCESS_TOKEN, ACCOUNT_TYPE, COOKIE_OPTIONS, SESSION_DURATION } from '@/common/constants'
import { useAuthStore } from '@/stores/auth.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useUserStore } from '@/stores/user.store'
import type { UserMe } from '@/types/api'
import type { AuthResponseResult } from '@/types/auth'
import type { FirebasePlugin } from '@/types/firebase'

export const useAuth = () => {
  // Reactive variables
  const error = ref('')
  const user = ref<User | null>(null)

  const authStore = useAuthStore()
  const userStore = useUserStore()
  const financesStore = useFinancesStore()

  const token = useCookie<string | null>(ACCESS_TOKEN, { ...COOKIE_OPTIONS })
  const accountType = useCookie<string | null>(ACCOUNT_TYPE, { ...COOKIE_OPTIONS })

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  /**
   * Fetches canonical user data from the server and populates all stores.
   * Single source of truth for session setup after any login method.
   * Mirrors the logic in useSession.initSession for consistency.
   */
  const populateSessionFromServer = async (bearerToken: string): Promise<string> => {
    const { success, result } = await $fetch<UserMe>('/api/users/me', {
      headers: { Authorization: `Bearer ${bearerToken}` }
    })

    if (!success || !result) throw new Error('No se pudo obtener datos del usuario')

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

    authStore.setOnboarding({
      isCompleted: result.onboarding === 'COMPLETED'
    })

    authStore.setAccountType(result.accountType)

    if (result.finances) {
      financesStore.setFinancialProfile(result.finances)
      financesStore.updateConfig({ defaultCurrency: result.finances.currency })
    }
    return result.onboarding
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ onboardingStatus: string; success: boolean }> => {
    error.value = ''

    try {
      const { success, result: res } = await $fetch<AuthResponseResult>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (!success || !res) {
        error.value = 'Credenciales inválidas'
        return { success: false, onboardingStatus: 'PENDING' }
      }

      token.value = res.token
      accountType.value = res.accountType
      authStore.setAccountType(res.accountType)

      const onboardingStatus = await populateSessionFromServer(res.token)

      user.value = createFirebaseUser(authStore.user)

      return { success: true, onboardingStatus }
    } catch {
      error.value = 'Error de autenticación'
      return { success: false, onboardingStatus: 'PENDING' }
    }
  }

  const loginWithGoogle = async (): Promise<{ onboardingStatus: string; success: boolean }> => {
    error.value = ''

    try {
      const { $firebase } = useNuxtApp() as { $firebase: FirebasePlugin }
      const { auth, googleProvider } = await $firebase.initFirebase()

      if (!auth || !googleProvider) {
        throw new Error('Error de configuración de Firebase')
      }

      const result = await $firebase.signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      const { success, result: res } = await $fetch<AuthResponseResult>('/api/auth/google', {
        method: 'POST',
        body: { data: { idToken, name: result.user.displayName } }
      })

      if (!success || !res) {
        throw new Error('Error de autenticación con Google')
      }

      token.value = res.token
      accountType.value = res.accountType
      authStore.setAccountType(res.accountType)

      // Fetch canonical user data from server instead of mapping Firebase user directly.
      // This ensures onboarding status, finances, and profile data are always server-sourced.
      const onboardingStatus = await populateSessionFromServer(res.token)

      user.value = createFirebaseUser(authStore.user)

      return { success: true, onboardingStatus }
    } catch (err) {
      error.value = JSON.stringify(err) /* || 'Error al iniciar sesión con Google' */

      return { success: false, onboardingStatus: 'PENDING' }
    }
  }

  const logout = async (): Promise<void> => {
    const { $firebase } = useNuxtApp() as { $firebase: FirebasePlugin }
    const { auth } = await $firebase.initFirebase()
    await $firebase.firebaseSignOut(auth!)
    await $fetch('/api/auth/logout', { method: 'POST' })

    token.value = null
    accountType.value = null
    user.value = null
    authStore.clearAuth()
  }

  // Helper function to create Firebase-compatible user from domain User
  const createFirebaseUser = (domainUser: typeof authStore.user): User | null => {
    if (!domainUser) return null

    return {
      uid: domainUser.id,
      email: domainUser.email || '',
      displayName: domainUser.displayName || 'Usuario',
      photoURL: domainUser.avatar
    } as User
  }

  const observeAuth = async (): Promise<void> => {
    // Only run on client-side
    if (import.meta.server) return

    const { $firebase } = useNuxtApp() as { $firebase: FirebasePlugin }

    const { auth } = await $firebase.initFirebase()
    if (!auth) return
    $firebase.onAuthStateChanged(auth, (firebaseUser: User | null) => {
      user.value = firebaseUser
    })
  }

  return {
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    observeAuth,
    populateSessionFromServer,
    user,
    error
  }
}
