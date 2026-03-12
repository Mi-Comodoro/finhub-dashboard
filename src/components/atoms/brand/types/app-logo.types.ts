export interface AppLogoProps {
  /** Show full logo with text */
  showText?: boolean
  /** Size of the logo */
  size?: 'sm' | 'md' | 'lg'
  /** Custom classes */
  className?: string
}

export type LogoSize = 'sm' | 'md' | 'lg'
export type TextSize = 'base' | 'lg' | 'xl'
