export const subtractPercentage = (mount: number, discount: number) => {
  return mount - mount * (discount / 100)
}
