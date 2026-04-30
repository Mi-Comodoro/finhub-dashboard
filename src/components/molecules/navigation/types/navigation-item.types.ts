export interface NavigationItemProps {
  name: string
  icon: string
  path?: string
  isActive?: boolean
  collapsed?: boolean
  className?: string
  onClick?: () => void | Promise<void>
}
