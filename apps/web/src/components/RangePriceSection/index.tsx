import { Currency } from '@pancakeswap/sdk'
import clsx from 'clsx'
import { LightCardProps } from 'components/Card'

interface RangePriceSectionProps extends LightCardProps {
  title: string
  titleColor?: string
  currency0?: Currency
  currency1?: Currency
  price: string
  className?: string
}

export const RangePriceSection = ({
  title,
  titleColor = 'text-on-surface-subtle',
  currency0,
  currency1,
  price,
  className,
}: RangePriceSectionProps) => {
  return (
    <div className={clsx('flex flex-col items-center w-full space-y-3 bg-neutral p-4 rounded-2xl', className)}>
      <h3 className={clsx('text-sm', titleColor)}>{title}</h3>

      <p className="font-bold text-on-surface">{price}</p>

      <p className="text-on-surface-subtlest text-sm">
        {currency0?.symbol} per {currency1?.symbol}
      </p>
    </div>
  )
}
