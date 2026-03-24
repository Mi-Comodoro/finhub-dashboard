export default defineNuxtRouteMiddleware(async to => {
  const { authStore, initSession } = useSession()

  await initSession()

  const isLoggedIn = authStore.isAuthenticated
  const isDashboard = to.path.startsWith('/dashboard')
  const isHome = to.path === '/'

  // 1. Si NO está logueado e intenta entrar al dashboard -> Al Home
  if (!isLoggedIn && isDashboard) {
    return navigateTo('/', { replace: true })
  }

  // 2. Si SI está logueado e intenta ir al Home -> Al Dashboard
  if (isLoggedIn && isHome) {
    return navigateTo('/dashboard', { replace: true })
  }
})
