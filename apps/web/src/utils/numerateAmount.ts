export default function numerateAmount(amount: number | string, decimals: number): string {
  if (!amount || !decimals) {
    return '0'
  }

  const amtStr = typeof amount === 'number' ? amount.toFixed(decimals + 1) : amount.toString()
  const [n, f = ''] = amtStr.replace(/,/g, '').split('.')
  const full = n + f.padEnd(decimals, '0').slice(0, decimals)

  return full
}
