export interface UserAvatarProps {
  name: string
  avatar?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
