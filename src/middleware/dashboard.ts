import { useSession } from '@/composables/useSession'
import { ACCESS_TOKEN } from '~/common/constants'

export default defineNuxtRouteMiddleware(to => {
  if (!to.path.startsWith('/dashboard') && !to.path.startsWith('/admin')) {
    return
  }

  // On SSR: if the access-token cookie is present, let session.client.ts recover the session
  if (import.meta.server && useCookie(ACCESS_TOKEN).value) {
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
