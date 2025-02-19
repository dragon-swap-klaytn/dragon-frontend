import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'

type MyPositionsSummaryProps = {
  positionCount: {
    v2: number
    v3: number
  }
  tvlUSD: number
  unclaimedFeeUSD: number // fees for not staked positions
  unclaimedRewardAndFeeUSD: number // rewards and fees for staked positions
  claimFees: () => void
  collectRewards: () => void
}

export function MyPositionsSummary({
  positionCount,
  tvlUSD,
  unclaimedFeeUSD,
  unclaimedRewardAndFeeUSD,
  claimFees,
  collectRewards,
}: MyPositionsSummaryProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl bg-surface-raised">
      <div className="md:py-6 md:grid grid-cols-2 md:divide-x divide-border">
        <div className="py-6 md:py-0 grid grid-cols-2 divide-x divide-border">
          <div className="px-6">
            <MyPositionSummaryItem
              label={t('Positions')}
              value={positionCount.v2 + positionCount.v3}
              suffix={
                <span
                  className={clsx('text-[13px] text-on-surface-subtlest hidden', {
                    'md:inline': positionCount.v2 + positionCount.v3 > 0,
                  })}
                >
                  V3: {positionCount.v3} / V2: {positionCount.v2}
                </span>
              }
            />
          </div>
          <div className="px-6">
            <MyPositionSummaryItem label={t('TVL')} value={tvlUSD} isDollar />
          </div>
        </div>
        <div className="px-6 md:px-0 md:grid grid-cols-2 md:divide-x divide-border">
          <div className="py-6 md:py-0 md:px-6 border-t md:border-t-0 border-border">
            <MyPositionSummaryItem
              label={t('Position Fees')}
              value={unclaimedFeeUSD}
              isDollar
              suffix={
                <ButtonV2 variant="primary" onClick={claimFees} disabled={unclaimedFeeUSD === 0}>
                  {t('Claim All')}
                </ButtonV2>
              }
              flexRowWhenSmallScreen
            />
          </div>
          <div className="py-6 md:py-0 md:px-6 border-t md:border-t-0 border-border">
            <MyPositionSummaryItem
              label={t('Staking Rewards & Fees')}
              value={unclaimedRewardAndFeeUSD}
              isDollar
              suffix={
                <ButtonV2 variant="primary" onClick={collectRewards} disabled={unclaimedRewardAndFeeUSD === 0}>
                  {t('Claim All')}
                </ButtonV2>
              }
              flexRowWhenSmallScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MyPositionSummaryItem({
  label,
  value,
  isDollar = false,
  suffix,
  flexRowWhenSmallScreen = false,
}: {
  label: string
  value: number
  isDollar?: boolean
  suffix?: ReactNode
  flexRowWhenSmallScreen?: boolean
}) {
  return (
    <div
      className={clsx(
        'flex',
        flexRowWhenSmallScreen
          ? 'justify-between items-center space-x-3 md:flex-col md:items-start md:space-x-0 md:space-y-3'
          : 'flex-col items-start space-y-3',
      )}
    >
      <div>
        <h4 className="text-[13px]">{label}</h4>
        <p className="mt-3 text-[32px] font-medium">
          {value === 0
            ? '-'
            : isDollar
            ? `${formatDollarAmountV2({
                num: value,
                withDollarSign: true,
              })}`
            : value.toLocaleString()}
        </p>
      </div>
      {suffix}
    </div>
  )
}
