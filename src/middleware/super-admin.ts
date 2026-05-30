import { useAuthStore } from '@/stores/auth.store'
import { ACCESS_TOKEN } from '~/common/constants'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server && useCookie(ACCESS_TOKEN).value) {
    return
  }

  const { user } = useAuthStore()
  if (user?.role !== 'super_admin') {
    return navigateTo('/admin')
  }
})
