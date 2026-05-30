import { useSession } from '@/composables/useSession'
import { ACCESS_TOKEN } from '~/common/constants'

export default defineNuxtRouteMiddleware(() => {
  // On SSR: if the access-token cookie is present, let session.client.ts recover the session
  // rather than clearing auth and redirecting (same pattern as auth.global.ts)
  if (import.meta.server && useCookie(ACCESS_TOKEN).value) {
    return
  }

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
