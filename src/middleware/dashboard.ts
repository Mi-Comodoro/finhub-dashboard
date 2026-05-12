import { useSession } from '@/composables/useSession'

export default defineNuxtRouteMiddleware(to => {
  if (!to.path.startsWith('/dashboard')) {
    return
  }

  const { authStore } = useSession()

  // auth.global.ts already verified the session via API — trust its result here
  if (!authStore.isVerified || !authStore.isAuthenticated || !authStore.user) {
    authStore.clearAuth()
    return navigateTo('/')
  }

  if (authStore.isSessionExpired) {
    authStore.clearAuth()
    return navigateTo('/')
  }
})
