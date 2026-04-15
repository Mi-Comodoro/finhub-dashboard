export default defineNuxtRouteMiddleware(async to => {
  const { authStore, initSession } = useSession()
  if (!authStore.isInitialized) {
    try {
      await initSession()
    } catch (e) {
      authStore.setError(JSON.stringify(e))
      throw e
    }
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
