import { useTranslation } from '@pancakeswap/localization'
import { useTooltip } from '@pancakeswap/uikit'

// APY is a ratio: 10 represents 1,000%.
export const HIGH_POOL_APY = 10

export default function PoolApy({ value }: { value: number | null | undefined }) {
  const { t } = useTranslation()
  const explanation = t(
    'Annualized from recent fees and current liquidity. Short-term activity can inflate this estimate; it is not an expected return.',
  )
  const { targetRef, tooltip, tooltipVisible } = useTooltip(explanation, { trigger: 'click' })

  if (value == null || Number.isNaN(value) || value === -Infinity) return <span>-</span>

  if (value > HIGH_POOL_APY) {
    return (
      <>
        <span
          ref={targetRef}
          role="button"
          tabIndex={0}
          title={explanation}
          className="cursor-help border-b border-dotted"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.currentTarget.click()
            }
          }}
        >
          {t('Unusually High')}
        </span>
        {tooltipVisible && tooltip}
      </>
    )
  }

  return (
    <span>
      {value.toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  )
}
