import { useSession } from '@/composables/useSession'

export default defineNuxtRouteMiddleware(() => {
  const { authStore } = useSession()

  if (!authStore.isVerified || !authStore.isAuthenticated || !authStore.user) {
    authStore.clearAuth()
    return navigateTo('/')
  }

  if (authStore.isSessionExpired) {
    authStore.clearAuth()
    return navigateTo('/')
  }
})
