// composables/useBreadcrumbs.ts

import type { RouteLocationNormalized } from 'vue-router'

import type { BreadcrumbItem, BreadcrumbOptions } from '@/components/molecules'

interface RouteMetaWithBreadcrumb {
  title?: string
  breadcrumb?: string
  breadcrumbIcon?: string
  parents?: string[]
}

export function useBreadcrumbs() {
  /**
   * Generate breadcrumbs from route
   */
  const generateBreadcrumbsFromRoute = (
    route: RouteLocationNormalized,
    options: BreadcrumbOptions = {}
  ): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []
    const matchedRoutes = route.matched
    // Generate from matched routes

    const lastMeta = matchedRoutes[matchedRoutes.length - 1]?.meta as RouteMetaWithBreadcrumb

    const parents = lastMeta?.parents || []

    const segments = route.path.split('/').filter(Boolean)

    let currentPath = ''

    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`

      let label = formatBreadcrumbLabel(segments[i] as string)

      // 🔥 usar parents si existen
      if (parents[i - 1]) {
        label = parents[i - 1] as string
      }

      // 🔥 último nivel
      if (i === segments.length - 1 && lastMeta?.breadcrumb) {
        label = lastMeta.breadcrumb
      }

      breadcrumbs.push({
        label,
        path: currentPath,
        isActive: i === segments.length - 1
      })
    }

    // If no breadcrumbs from meta, try to generate from params
    if (breadcrumbs.length === 0 && route.params && Object.keys(route.params).length > 0) {
      return generateBreadcrumbsFromParams(route, options)
    }

    return breadcrumbs
  }

  /**
   * Generate breadcrumbs from route params (fallback)
   */
  const generateBreadcrumbsFromParams = (
    route: RouteLocationNormalized,
    options: BreadcrumbOptions = {}
  ): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []

    if (options.showHome) {
      breadcrumbs.push({
        label: options.homeLabel || 'Dashboard',
        path: options.homePath || '/dashboard',
        icon: options.homeIcon || 'home',
        isActive: true
      })
    }

    // Add current route as last breadcrumb
    const pathSegments = route.path.split('/').filter(segment => segment)
    const lastSegment = pathSegments[pathSegments.length - 1]

    if (lastSegment) {
      breadcrumbs.push({
        label: formatBreadcrumbLabel(lastSegment),
        path: route.path,
        isActive: true
      })
    }

    return breadcrumbs
  }

  /**
   * Format breadcrumb label from URL segment
   */
  const formatBreadcrumbLabel = (segment: string): string => {
    return segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Truncate breadcrumbs when too many
   */
  const truncateBreadcrumbs = (
    breadcrumbs: BreadcrumbItem[],
    maxItems: number
  ): BreadcrumbItem[] => {
    if (breadcrumbs.length <= maxItems) return breadcrumbs

    const truncated = [...breadcrumbs]
    const itemsToRemove = truncated.length - maxItems + 1 // Keep first and last

    // Replace middle items with ellipsis
    truncated.splice(1, itemsToRemove, {
      label: '...',
      path: undefined,
      isActive: false,
      disabled: true
    })

    return truncated
  }

  /**
   * Add custom breadcrumb
   */
  const addCustomBreadcrumb = (label: string, path?: string, icon?: string): BreadcrumbItem => {
    return {
      label,
      path,
      icon,
      isActive: !path
    }
  }

  return {
    generateBreadcrumbsFromRoute,
    generateBreadcrumbsFromParams,
    formatBreadcrumbLabel,
    truncateBreadcrumbs,
    addCustomBreadcrumb
  }
}
