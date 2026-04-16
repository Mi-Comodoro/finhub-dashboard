export const useCategoryPresenter = () => {
  const getCategoryColorClasses = (type: string) => {
    const map: Record<string, { bg: string; text: string; badge: string }> = {
      need: {
        bg: 'bg-primary-50',
        text: 'text-primary-700',
        badge: 'bg-primary-50 text-primary-700'
      },
      want: {
        bg: 'bg-secondary-50',
        text: 'text-secondary-700',
        badge: 'bg-secondary-50 text-secondary-700'
      },
      saving: {
        bg: 'bg-warning-50',
        text: 'text-warning-700',
        badge: 'bg-warning-50 text-warning-700'
      }
    }
    return (
      map[type] ?? {
        bg: 'bg-neutral-100',
        text: 'text-neutral-600',
        badge: 'bg-neutral-100 text-neutral-600'
      }
    )
  }

  const getCategoryTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      need: 'Necesidad',
      want: 'Gusto',
      saving: 'Ahorro'
    }
    return map[type] ?? type
  }

  const getCategoryTypeVariant = (type: string) => {
    const map: Record<string, string> = {
      need: 'primary',
      want: 'secondary',
      saving: 'warning'
    }
    return map[type] || 'default'
  }

  return {
    getCategoryColorClasses,
    getCategoryTypeLabel,
    getCategoryTypeVariant
  }
}
