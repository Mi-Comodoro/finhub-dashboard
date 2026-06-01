import { usePageLoading } from '@/composables/usePageLoading'

export default defineNuxtPlugin(() => {
  const isLoading = usePageLoading()
  const router = useRouter()

  router.beforeEach(() => {
    isLoading.value = true
  })

  router.afterEach(() => {
    isLoading.value = false
  })
})
