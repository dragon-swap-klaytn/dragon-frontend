import { ButtonV2, Skeleton } from '@pancakeswap/uikit'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { PoolState } from 'hooks/v3/types'
import { useFeeTierDistribution } from 'hooks/v3/useFeeTierDistribution'
import { FeeTierPercentageBadge } from './FeeTierPercentageBadge'
import { FEE_AMOUNT_DETAIL } from './shared'

interface FeeOptionProps {
  feeAmount: FeeAmount
  largestUsageFeeTier?: FeeAmount
  active: boolean
  distributions: ReturnType<typeof useFeeTierDistribution>['distributions']
  poolState: PoolState
  onClick: () => void
  isLoading?: boolean
}

export function FeeOption({
  feeAmount,
  active,
  poolState,
  distributions,
  onClick,
  largestUsageFeeTier,
  isLoading,
}: FeeOptionProps) {
  return (
    <ButtonV2
      variant={active ? 'primary' : 'blank'}
      onClick={onClick}
      className="flex flex-col items-center space-y-1"
      scale="sm"
    >
      <span className="text-sm">{FEE_AMOUNT_DETAIL[feeAmount].label}%</span>

      {isLoading ? (
        <Skeleton width="100%" height={16} />
      ) : distributions ? (
        <FeeTierPercentageBadge
          distributions={distributions}
          feeAmount={feeAmount}
          poolState={poolState}
          largestUsageFeeTier={largestUsageFeeTier}
        />
      ) : null}
    </ButtonV2>
  )
}
