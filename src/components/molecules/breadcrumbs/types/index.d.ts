// types/navigation.ts
export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
  isActive?: boolean
  disabled?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>
}

export interface BreadcrumbOptions {
  showHome?: boolean
  homeLabel?: string
  homeIcon?: string
  homePath?: string
  maxItems?: number
}

export interface RouteMetaBreadcrumb {
  breadcrumb?: string
  breadcrumbIcon?: string
  parent?: string
  breadcrumbIgnore?: boolean
}
