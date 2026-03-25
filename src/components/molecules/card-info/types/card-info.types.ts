import type {
  HeadingColor,
  HeadingLevel,
  HeadingSize,
  HeadingWeight,
  LabelSize,
  LabelVariant,
  TextColor,
  TextSize,
  TextWeight
} from '~/components/atoms'

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
  iconVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
  iconSize?: 'sm' | 'md' | 'lg'
  verticalSpace?: boolean
}
