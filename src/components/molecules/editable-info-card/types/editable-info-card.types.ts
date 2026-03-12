export type EditableInfoCardVariant = 'default' | 'compact'

export interface EditableInfoCardProps {
  title: string
  icon: string
  iconContainerClass?: string
  variant?: EditableInfoCardVariant
  isEditing?: boolean
  showEditButton?: boolean
  editButtonText?: string
}
