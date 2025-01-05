import { useTranslation } from '@pancakeswap/localization'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { PoolState } from 'hooks/v3/types'
import { useFeeTierDistribution } from 'hooks/v3/useFeeTierDistribution'

export function FeeTierPercentageBadge({
  feeAmount,
  distributions,
  poolState,
  largestUsageFeeTier,
}: {
  feeAmount: FeeAmount
  distributions: ReturnType<typeof useFeeTierDistribution>['distributions']
  poolState: PoolState
  largestUsageFeeTier?: FeeAmount
}) {
  const { t } = useTranslation()

  return (
    <div className="text-[10px] rounded-[20px] whitespace-nowrap">
      {!distributions || poolState === PoolState.NOT_EXISTS || poolState === PoolState.INVALID
        ? t('Not Created')
        : distributions[feeAmount] !== undefined
        ? `${feeAmount === largestUsageFeeTier && '🔥'} ${distributions[feeAmount]?.toFixed(0)}% ${t('Pick')}`
        : t('No Data')}
    </div>
  )
}
