type TokenRateProps = {
  rate: number
  sigs?: number
  className?: string
  hiddenDigitClassName?: string
}

export function TokenRate({
  rate,
  sigs = 4,
  className = 'text-sm',
  hiddenDigitClassName = 'text-[9px]',
}: TokenRateProps) {
  const hiddenDigits = rate < 0.0001 ? Math.floor(-Math.log10(rate)) : 0

  if (!hiddenDigits) {
    return <span className={className}>{rate.toPrecision(sigs)}</span>
  }

  const fractions = (rate * 10 ** hiddenDigits).toPrecision(sigs).split('.')[1]

  return (
    <span className={className}>
      0.0
      <span className={hiddenDigitClassName}>{hiddenDigits}</span>
      {fractions}
    </span>
  )
}
