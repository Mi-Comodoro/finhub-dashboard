import type { User } from 'firebase/auth'
import { computed, ref } from 'vue'

import { SESSION_DURATION } from '@/common/constants'
import { useAuthApi } from '@/composables/api/useAuthApi'
import { useUserApi } from '@/composables/api/useUserApi'
import { useBetaInvitation } from '@/composables/application/useBetaInvitation'
import { useSessionWatcher } from '@/composables/useSessionWatcher'
import { useAuthStore } from '@/stores/auth.store'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useModalStore } from '@/stores/modal.store'
import { useUserStore } from '@/stores/user.store'
import type { FirebasePlugin } from '@/types/firebase'

// Google credentials kept in memory while the person accepts the data policy (new accounts only),
// so the Google popup does not have to be shown twice.
let pendingGoogle: { idToken: string; name: string } | null = null

const isConsentRequired = (err: unknown): boolean =>
  (err as { data?: { data?: { code?: string } } } | null)?.data?.data?.code === 'CONSENT_REQUIRED'

export const useAuth = () => {
  const error = ref('')
  const user = ref<User | null>(null)

  const authStore = useAuthStore()
  const userStore = useUserStore()
  const financesStore = useFinancesStore()
  const budgetStore = useBudgetStore()
  const { startWatcher, stopWatcher } = useSessionWatcher()
  const authApi = useAuthApi()
  const userApi = useUserApi()
  // Closed beta: the invitation the person arrived with is sent when the account is created
  const invitation = useBetaInvitation()

  const isAuthenticated = computed(() => authStore.isAuthenticated)

  const getReadableError = (err: unknown) => {
    // The BFF reason goes first: on a failed request err.message is the technical $fetch text
    if (typeof err === 'object' && err !== null && 'data' in err) {
      const data = (err as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }

    if (err instanceof Error && err.message) {
      return err.message
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
    const { success, result } = await userApi.getUserMe()

    if (!success || !result) throw new Error('No se pudo obtener datos del usuario')

    const resolvedExpiresAt = result.expiresAt ?? fallbackExpiresAt ?? null

    authStore.setSession({
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        avatar: result.user.photo || null,
        role: (result.user.role as 'admin' | 'user') ?? 'user'
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
      const { success, result: res } = await authApi.loginWithCredentials(email, password)

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

  const signup = async (data: {
    email: string
    password: string
    name: string
    displayName?: string
    handle?: string
    phone?: string
    gender?: string
    country?: string
  }): Promise<{ onboardingStatus: string; success: boolean }> => {
    error.value = ''

    try {
      const { success, result: res } = await authApi.signup({
        ...data,
        ...(invitation.token.value ? { inviteToken: invitation.token.value } : {})
      })

      if (!success || !res) {
        error.value = 'Error al crear la cuenta'
        return { success: false, onboardingStatus: 'PENDING' }
      }

      authStore.setAccountType(res.accountType)
      // The invitation was used: it will not work again
      invitation.clear()

      const onboardingStatus = await populateSessionFromServer(res.expiresAt)

      if (data.handle) {
        userStore.handle = data.handle
      }

      if (res.expiresAt) {
        startWatcher(res.expiresAt)
      }

      user.value = createFirebaseUser(authStore.user)

      return { success: true, onboardingStatus }
    } catch (err) {
      const raw = err as { data?: { message?: string }; message?: string } | null
      error.value =
        raw?.data?.message ??
        (err instanceof Error ? err.message : null) ??
        'Error al crear la cuenta'
      return { success: false, onboardingStatus: 'PENDING' }
    }
  }

  const loginWithGoogle = async (
    acceptedPolicyVersion?: string
  ): Promise<{ onboardingStatus: string; success: boolean; consentRequired?: boolean }> => {
    error.value = ''
    let credentials = acceptedPolicyVersion ? pendingGoogle : null

    try {
      if (!credentials) {
        const { $firebase } = useNuxtApp() as { $firebase: FirebasePlugin }
        const { auth, googleProvider } = await $firebase.initFirebase()

        if (!auth || !googleProvider) {
          throw new Error('Error de configuración de Firebase')
        }

        const result = await $firebase.signInWithPopup(auth, googleProvider)
        const idToken = await result.user.getIdToken()
        const fallbackName =
          result.user.displayName ?? result.user.email?.split('@')[0] ?? 'Usuario'
        credentials = { idToken, name: fallbackName }
      }

      const { success, result: res } = await authApi.loginWithGoogleToken(
        credentials.idToken,
        credentials.name,
        undefined,
        acceptedPolicyVersion,
        invitation.token.value ?? undefined
      )

      if (!success || !res) {
        throw new Error('Error de autenticación con Google')
      }

      pendingGoogle = null
      invitation.clear()
      authStore.setAccountType(res.accountType)

      // Pequeño delay para asegurar que las cookies se propaguen desde el server al cliente
      await new Promise(resolve => setTimeout(resolve, 100))

      const onboardingStatus = await populateSessionFromServer(res.expiresAt)
      startWatcher(res.expiresAt)

      user.value = createFirebaseUser(authStore.user)

      return { success: true, onboardingStatus }
    } catch (err) {
      if (isConsentRequired(err) && credentials) {
        // New account: ask for the authorization and retry with the same Google credentials
        pendingGoogle = credentials
        return { success: false, onboardingStatus: 'PENDING', consentRequired: true }
      }

      pendingGoogle = null
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

      await authApi.logout()
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

  const clearAllState = async () => {
    authStore.clearAuth()
    userStore.clearUser()
    financesStore.clearFinances()
    budgetStore.clearBudgetData()
    try {
      await authApi.logout()
    } catch {
      /* cookie puede estar inválida ya */
    }
  }

  const triggerSessionExpiredModal = () => {
    if (!import.meta.client) return
    stopWatcher()
    const modalStore = useModalStore()
    if (modalStore.state.show) return
    modalStore.showModal('warning', {
      title: 'Sesión expirada',
      message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      actionLabel: 'Aceptar',
      onAction: async () => {
        await clearAllState()
        navigateTo('/')
      },
      onClose: async () => {
        await clearAllState()
        navigateTo('/')
      }
    })
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
    signup,
    loginWithGoogle,
    logout,
    observeAuth,
    populateSessionFromServer,
    triggerSessionExpiredModal,
    user,
    error
  }
}
