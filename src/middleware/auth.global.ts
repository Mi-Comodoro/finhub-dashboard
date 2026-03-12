/**
 * Global Auth Middleware
 * Enhanced authentication flow with proper SSR cookie handling
 */

export default defineNuxtRouteMiddleware(async to => {
  const { authStore, initSession } = useSession()

  // Initialize session if not done yet
  await initSession()

  // Route type checks
  const isDashboard = to.path.startsWith('/dashboard')
  const isOnboarding = to.path.startsWith('/onboarding')
  const isHome = to.path === '/'

  // Check authentication status
  const isLoggedIn = authStore.isAuthenticated

  // 🚫 Not authenticated → redirect away from protected routes
  if (!isLoggedIn && (isDashboard || isOnboarding)) {
    return navigateTo('/')
  }

  // ✅ Authenticated on home → redirect based on onboarding status
  if (isLoggedIn && isHome) {
    return navigateTo('/dashboard')
  }

  // ✅ Authenticated trying to access dashboard but needs onboarding → NO REDIRECT, ahora onboarding es modal
  // if (isLoggedIn && isDashboard && needsOnboarding) {
  //   return navigateTo('/onboarding')
  // }

  // ✅ Authenticated trying to access onboarding but already completed → redirect to dashboard
  if (isLoggedIn && isOnboarding) {
    return navigateTo('/dashboard')
  }
})
