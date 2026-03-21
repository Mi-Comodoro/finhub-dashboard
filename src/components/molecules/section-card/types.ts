export interface SectionCardProps {
  /** Heading text rendered inside the card header. Omit to suppress the header entirely. */
  title?: string
  /** HTML element to render as the card root. Defaults to 'div'. */
  as?: 'div' | 'section' | 'article'
  icon?: string
  iconVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
}
