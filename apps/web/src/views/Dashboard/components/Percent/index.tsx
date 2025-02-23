import { ArrowUp } from '@phosphor-icons/react'
import { ArrowDown } from '@phosphor-icons/react/dist/ssr'
import clsx from 'clsx'
import { useMemo } from 'react'

export interface PercentProps {
  value: number | undefined
  decimals?: number
  wrap?: boolean
  className?: string
  textSize?: string
}

export default function Percent({ value, decimals = 2, wrap = false, className, textSize = 'text-sm' }: PercentProps) {
  const isNagative = useMemo(() => value && value < 0, [value])

  return (
    <span
      className={clsx(textSize, className, 'flex items-center', {
        'text-on-surface-subtlest': !value,
        'text-red-400': !!value && isNagative,
        'text-emerald-400': !!value && !isNagative,
      })}
    >
      {wrap && '('}
      {!!value && isNagative && <ArrowDown />}
      {!!value && !isNagative && <ArrowUp />}
      {value ? `${Math.abs(value).toFixed(decimals)}%` : '-'}
      {wrap && ')'}
    </span>
  )
}
