import type { User } from 'firebase/auth'
import { computed, ref } from 'vue'

import { SESSION_DURATION } from '@/common/constants'
import { useSessionWatcher } from '@/composables/useSessionWatcher'
import { useAuthStore } from '@/stores/auth.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useUserStore } from '@/stores/user.store'
import type { UserMe } from '@/types/api'
import type { AuthResponseResult } from '@/types/auth'
import type { FirebasePlugin } from '@/types/firebase'

export const useAuth = () => {
  const error = ref('')
  const user = ref<User | null>(null)

  const authStore = useAuthStore()
  const userStore = useUserStore()
  const financesStore = useFinancesStore()
  const { startWatcher, stopWatcher } = useSessionWatcher()

  const isAuthenticated = computed(() => authStore.isAuthenticated)

  const getReadableError = (err: unknown) => {
    if (err instanceof Error && err.message) {
      return err.message
    }

    if (typeof err === 'object' && err !== null && 'data' in err) {
      const data = (err as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }

    return 'Error de autenticación con Google'
  }

  const resolveSessionExpiresAt = (expiresAt?: number | null) => {
    if (expiresAt) {
      return new Date(expiresAt * 1000)
    }

    return new Date(Date.now() + SESSION_DURATION)
  }

  const populateSessionFromServer = async (fallbackExpiresAt?: number | null): Promise<string> => {
    const { success, result } = await $fetch<UserMe>('/api/users/me')

    if (!success || !result) throw new Error('No se pudo obtener datos del usuario')

    const resolvedExpiresAt = result.expiresAt ?? fallbackExpiresAt ?? null

    authStore.setSession({
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        avatar: result.user.photo || null
      },
      isAuthenticated: true,
      sessionExpiresAt: resolveSessionExpiresAt(resolvedExpiresAt)
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

      authStore.setAccountType(res.accountType)

      const onboardingStatus = await populateSessionFromServer(res.expiresAt)

      if (res.expiresAt) {
        startWatcher(res.expiresAt)
      }

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
      const fallbackName = result.user.displayName ?? result.user.email?.split('@')[0] ?? 'Usuario'

      const { success, result: res } = await $fetch<AuthResponseResult>('/api/auth/google', {
        method: 'POST',
        body: { data: { idToken, name: fallbackName } }
      })

      if (!success || !res) {
        throw new Error('Error de autenticación con Google')
      }

      authStore.setAccountType(res.accountType)

      const onboardingStatus = await populateSessionFromServer(res.expiresAt)
      startWatcher(res.expiresAt)

      user.value = createFirebaseUser(authStore.user)

      return { success: true, onboardingStatus }
    } catch (err) {
      error.value = getReadableError(err)

      return { success: false, onboardingStatus: 'PENDING' }
    }
  }

  const logout = async (): Promise<void> => {
    authStore.setLoading(true)
    authStore.setError(null)
    stopWatcher()

    try {
      const { $firebase } = useNuxtApp() as { $firebase: FirebasePlugin }
      const { auth } = await $firebase.initFirebase()

      if (auth) {
        await $firebase.firebaseSignOut(auth)
      }

      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cerrar la sesión'
      authStore.setError(message)
      throw err
    } finally {
      user.value = null
      userStore.clearUser()
      financesStore.clearFinances()
      authStore.clearAuth()
      authStore.setLoading(false)
    }
  }

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
