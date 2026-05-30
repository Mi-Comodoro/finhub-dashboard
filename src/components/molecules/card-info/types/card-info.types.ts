import type { HeadingColor, HeadingLevel, HeadingSize, HeadingWeight } from '@/components/atoms/typography/types/heading.types'
import type { LabelSize, LabelVariant } from '@/components/atoms/typography/types/label.types'
import type { TextColor, TextSize, TextWeight } from '@/components/atoms/typography/types/text.types'

export type CardInfoProps = {
  title: string
  titleSize?: HeadingSize
  weight?: HeadingWeight
  color?: HeadingColor
  level: HeadingLevel
  subTitle?: string
  subTitleVariant?: LabelVariant
  subTitleColor?: TextColor
  subTitleSize?: TextSize | LabelSize
  subTitleWeight?: TextWeight
  icon?: string
  iconVariant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'gold'
    | 'accent'
    | 'custom'
  iconSize?: 'sm' | 'md' | 'lg'
  verticalSpace?: boolean
  iconTextClass?: string
  iconBgClass?: string
  currencyTextClass?: string
}
