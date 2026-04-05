export interface MenuItem {
  name: string
  icon: string
  path?: string
  isActive?: boolean
  onClick?: () => void | Promise<void>
}
