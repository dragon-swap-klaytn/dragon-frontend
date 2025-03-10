import clsx from 'clsx'

type TokenRateProps = {
  rate: number
  sigs?: number
  hiddenDigitsFrom?: number
  className?: string
  hiddenDigitClassName?: string
  prefix?: string
}

export function TokenRate({
  rate,
  sigs = 3,
  hiddenDigitsFrom = 3,
  className = 'text-sm',
  hiddenDigitClassName = 'text-[9px]',
  prefix,
}: TokenRateProps) {
  const hiddenDigits = rate < 1 / 10 ** hiddenDigitsFrom ? Math.floor(-Math.log10(rate)) : 0

  if (hiddenDigits) {
    const fractions = (rate * 10 ** hiddenDigits).toPrecision(sigs).split('.')[1]

    if (!Number.isFinite(hiddenDigits)) {
      return <span className={className}>-</span>
    }

    return (
      <span className={className}>
        <span className="inline-flex items-end">
          <span className="whitespace-nowrap">{prefix || ''}0.0</span>
          <span className={hiddenDigitClassName}>{hiddenDigits}</span>
          <span>{fractions}</span>
        </span>
      </span>
    )
  }

  if (rate < 10) {
    return (
      <span className={clsx(className, 'whitespace-nowrap')}>
        {prefix || ''}
        {rate.toLocaleString(undefined, {
          minimumSignificantDigits: sigs,
          maximumSignificantDigits: sigs,
        })}
      </span>
    )
  }

  return (
    <span className={clsx(className, 'whitespace-nowrap')}>
      {prefix || ''}
      {rate.toLocaleString(undefined, {
        minimumFractionDigits: rate < 1000 ? 2 : 0,
        maximumFractionDigits: rate < 1000 ? 2 : 0,
      })}
    </span>
  )
}
