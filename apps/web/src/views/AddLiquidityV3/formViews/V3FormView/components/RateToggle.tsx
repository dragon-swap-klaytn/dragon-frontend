import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import { ArrowsLeftRight } from '@phosphor-icons/react'

export default function RateToggle({
  currencyA,
  handleRateToggle,
}: {
  currencyA?: Currency
  handleRateToggle: () => void
}) {
  const { t } = useTranslation()

  return currencyA ? (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-on-surface-secondary">{t('View prices in')}</span>

      <button
        type="button"
        onClick={handleRateToggle}
        className="flex items-center space-x-1 text-on-surface-primary px-3 py-1 rounded-2xl bg-surface-container-highest hover:opacity-70 text-sm"
      >
        <ArrowsLeftRight size={16} />
        <span>{currencyA?.symbol}</span>
      </button>
    </div>
  ) : null
}
