export const replaceUnderscoresWithSpaces = (str: string): string => {
  return str.replace(/_/g, ' ')
}

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const formatEnumValue = (str: string): string => {
  return capitalizeFirstLetter(replaceUnderscoresWithSpaces(str))
}
export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')

  // Si solo hay una palabra, toma sus primeras 2 letras
  if (parts.length === 1) {
    return name.slice(0, 2).toUpperCase()
  }

  // Si hay 2 o más, mantiene tu lógica original
  return parts
    .map(n => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2)
}
export const upperCase = (value: string) => value.toUpperCase()
