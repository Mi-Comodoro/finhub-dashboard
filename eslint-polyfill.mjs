// Polyfill for Object.groupBy required by eslint-flat-config-utils on Node.js < 21
if (!Object.groupBy) {
  Object.groupBy = function (items, keySelector) {
    return items.reduce((acc, item, index) => {
      const key = keySelector(item, index)
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    }, {})
  }
}
