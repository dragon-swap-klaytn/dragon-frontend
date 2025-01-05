import { Currency } from '@pancakeswap/sdk'
import CurrencyLogo from './CurrencyLogo'

interface DoubleCurrencyLogoProps {
  size?: number
  currency0?: Currency
  currency1?: Currency
}

export default function DoubleCurrencyLogo({ currency0, currency1, size = 20 }: DoubleCurrencyLogoProps) {
  return (
    <div className="flex items-center space-x-1">
      {currency0 && <CurrencyLogo currency={currency0} size={size} />}
      {currency1 && <CurrencyLogo currency={currency1} size={size} />}
    </div>
  )
}
