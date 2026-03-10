/**
 * Dashboard Middleware
 * Validates authentication and session validity for dashboard access
 */
import { useSession } from '@/composables/useSession'
export default defineNuxtRouteMiddleware(async to => {
  // Only apply to dashboard routes
  if (!to.path.startsWith('/dashboard')) {
    return
  }

  const { authStore, initSession } = useSession()

  // Initialize and validate session with server
  try {
    if (!authStore.isInitialized) {
      await initSession()
    }
  } catch (error) {
    console.error('Session initialization failed:', error)
    return navigateTo('/login')
  }

  // Check if session exists and is valid after initialization
  if (!authStore.session) {
    return navigateTo('/login')
  }

  // Check if session has expired
  if (authStore.isSessionExpired) {
    authStore.clearAuth()
    return navigateTo('/login')
  }

  // Must be authenticated to access dashboard
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Validate user data exists
  if (!authStore.user) {
    authStore.clearAuth()
    return navigateTo('/login')
  }

  return
})
