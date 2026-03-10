/**
 * Onboarding Middleware
 * Simple middleware for onboarding access control
 */

export default defineNuxtRouteMiddleware(async to => {
  // Only apply to onboarding routes
  if (!to.path.startsWith('/onboarding')) {
    return
  }

  const { authStore, initSession } = useSession()

  // Initialize session if not done yet
  if (!authStore.isInitialized) {
    await initSession()
  }

  // Must be authenticated to access onboarding
  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  // Access granted to onboarding
  return
})
