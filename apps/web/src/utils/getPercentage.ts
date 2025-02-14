export default function getPercentage(v: number | string, decimals: number = 2) {
  const value = +v

  return value ? `${(value * 100).toFixed(decimals)}%` : '-'
}
