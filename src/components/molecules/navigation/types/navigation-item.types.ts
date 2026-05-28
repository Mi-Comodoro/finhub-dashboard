export interface NavigationItemProps {
  name: string
  icon: string
  path?: string
  isActive?: boolean
  collapsed?: boolean
  className?: string
  badge?: number
  onClick?: () => void | Promise<void>
}
