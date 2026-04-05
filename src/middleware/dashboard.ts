/**
 * Dashboard Middleware
 * Validates authentication and session validity for dashboard access
 */
import { useSession } from '@/composables/useSession'

export default defineNuxtRouteMiddleware(async to => {
  if (!to.path.startsWith('/dashboard')) {
    return
  }

  const { authStore, initSession } = useSession()

  try {
    await initSession({ force: true })
  } catch (error) {
    console.error('Session initialization failed:', error)
    return navigateTo('/')
  }

  if (!authStore.session) {
    return navigateTo('/')
  }

  if (authStore.isSessionExpired) {
    authStore.clearAuth()
    return navigateTo('/')
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  if (!authStore.user) {
    authStore.clearAuth()
    return navigateTo('/')
  }

  return
})
