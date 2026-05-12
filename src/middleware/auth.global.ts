export default defineNuxtRouteMiddleware(async to => {
  const { authStore, initSession } = useSession()

  // Only call the API once per session — skip if already verified or already initialized
  if (!authStore.isInitialized) {
    await initSession()
  }

  const isLoggedIn = authStore.isAuthenticated
  const isDashboard = to.path.startsWith('/dashboard')
  const isHome = to.path === '/'

  if (!isLoggedIn && isDashboard) {
    return navigateTo('/', { replace: true })
  }

  if (isLoggedIn && isHome) {
    return navigateTo('/dashboard', { replace: true })
  }
})
