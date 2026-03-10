export const replaceUnderscoresWithSpaces = (str: string): string => {
  return str.replace(/_/g, ' ')
}

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatEnumValue = (str: string): string => {
  return capitalizeFirstLetter(replaceUnderscoresWithSpaces(str))
}
