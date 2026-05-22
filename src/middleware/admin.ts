import { useAuthStore } from '@/stores/auth.store'
import { ACCESS_TOKEN } from '~/common/constants'

export default defineNuxtRouteMiddleware(() => {
  // On SSR: if the access-token cookie is present, let session.client.ts recover the session
  // before evaluating the role — avoids false redirects when user is null during SSR race
  if (import.meta.server && useCookie(ACCESS_TOKEN).value) {
    return
  }

  const { user } = useAuthStore()
  if (user?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
