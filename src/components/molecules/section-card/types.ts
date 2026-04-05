import type { HeadingColor } from '~/components/atoms'

export interface SectionCardProps {
  /** Heading text rendered inside the card header. Omit to suppress the header entirely. */
  title?: string
  subTitle?: string
  /** HTML element to render as the card root. Defaults to 'div'. */
  as?: 'div' | 'section' | 'article'
  icon?: string
  iconVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
  textColor?: HeadingColor
  bg?: HeadingColor
  uppercase?: boolean
  className?: string
}
