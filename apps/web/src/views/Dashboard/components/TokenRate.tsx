type TokenRateProps = {
  rate: number
  sigs?: number
  hiddenDigitsFrom?: number
  className?: string
  hiddenDigitClassName?: string
}

export function TokenRate({
  rate,
  sigs = 3,
  hiddenDigitsFrom = 3,
  className = 'text-sm',
  hiddenDigitClassName = 'text-[9px]',
}: TokenRateProps) {
  const hiddenDigits = rate < 1 / 10 ** hiddenDigitsFrom ? Math.floor(-Math.log10(rate)) : 0

  if (hiddenDigits) {
    const fractions = (rate * 10 ** hiddenDigits).toPrecision(sigs).split('.')[1]

    return (
      <span className={className}>
        0.0
        <span className={hiddenDigitClassName}>{hiddenDigits}</span>
        {fractions}
      </span>
    )
  }

  if (rate < 10) {
    return (
      <span className={className}>
        {rate.toLocaleString(undefined, {
          minimumSignificantDigits: sigs,
          maximumSignificantDigits: sigs,
        })}
      </span>
    )
  }

  return (
    <span className={className}>
      {rate.toLocaleString(undefined, {
        minimumFractionDigits: rate < 1000 ? 2 : 0,
        maximumFractionDigits: rate < 1000 ? 2 : 0,
      })}
    </span>
  )
}
