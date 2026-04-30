export interface MenuItem {
  name: string
  icon: string
  path?: string
  isActive?: boolean
  onClick?: () => void | Promise<void>
}

export interface NavigationSectionProps {
  /** Section title */
  title: string
  /** Menu items for this section */
  items: MenuItem[]
  /** Custom classes */
  className?: string
  /** Sidebar collapsed state — hides labels */
  collapsed?: boolean
}
