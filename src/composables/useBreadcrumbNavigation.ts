// composables/useBreadcrumbNavigation.ts
import { watch } from 'vue'
import { useRoute } from 'vue-router'

import { useBreadcrumbsStore } from '@/stores/breadcrumbs.store'

import { useBreadcrumbs } from './useBreadcrumbs'

export function useBreadcrumbNavigation(
  options: {
    autoUpdate?: boolean
    showHome?: boolean
    homeLabel?: string
    homeIcon?: string
  } = {}
) {
  const { autoUpdate = true, showHome = true, homeLabel = 'Dashboard' } = options

  const route = useRoute()
  const breadcrumbsStore = useBreadcrumbsStore()
  const { generateBreadcrumbsFromRoute } = useBreadcrumbs()

  // Auto-update breadcrumbs when route changes
  if (autoUpdate) {
    watch(
      () => route.fullPath,
      () => {
        const breadcrumbs = generateBreadcrumbsFromRoute(route, {
          showHome,
          homeLabel
        })
        breadcrumbsStore.setBreadcrumbs(breadcrumbs)
      },
      { immediate: true }
    )
  }

  const updateBreadcrumbs = () => {
    const breadcrumbs = generateBreadcrumbsFromRoute(route, {
      showHome,
      homeLabel
    })
    breadcrumbsStore.setBreadcrumbs(breadcrumbs)
  }

  return {
    updateBreadcrumbs
  }
}
