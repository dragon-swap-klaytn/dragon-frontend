import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { Portfolio, PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import useTokenPrices from 'hooks/use-token-prices'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { ReactNode, useMemo } from 'react'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import useClaimModals from 'views/PoolsV2/components/MyPositionsSummary/use-claim-modals'

type MyPositionsSummaryProps = {
  portfolio?: Portfolio
  invalidatePortflio?: () => void
  onMyPositionsClick?: () => void
}

export function MyPositionsSummary({ portfolio, invalidatePortflio, onMyPositionsClick }: MyPositionsSummaryProps) {
  const { t } = useTranslation()

  const { prices } = useTokenPrices()
  // use swapscanner price as fallback
  const { prices: ssPrices } = useTokenPrices({ source: 'swapscanner' })

  const mergedPrices = useMemo(
    () => ({
      ...ssPrices,
      ...prices,
    }),
    [prices, ssPrices],
  )

  const { openClaimUnstakedFeesModal, openClaimFeesAndRewardsModal } = useClaimModals({
    priceMap: mergedPrices,
    portfolio,
    invalidatePortflio,
  })

  const { positionCount, tvlUSD, unclaimedFeeUSD, unclaimedRewardAndFeeUSD } = useMemo(() => {
    let v2 = 0
    let v3 = 0
    let tvl = 0
    let feeUSD = 0
    let rewardAndFeeUSD = 0

    if (portfolio) {
      Object.values(portfolio).forEach((pool) => {
        if (pool.type === 'v2') {
          const v2Pool = pool as PortfolioV2Data
          v2 += 1
          const token0Price = mergedPrices[v2Pool.token0.address] ?? 0
          const token1Price = mergedPrices[v2Pool.token1.address] ?? 0
          tvl += token0Price * v2Pool.token0.amount
          tvl += token1Price * v2Pool.token1.amount
        } else {
          const v3Pool = pool as PortfolioV3DataBigInt
          v3 += v3Pool.positions.length
          v3Pool.positions.forEach(({ isStaked, rewards, token0, token1 }) => {
            const token0Price = mergedPrices[token0.address] ?? 0
            const token1Price = mergedPrices[token1.address] ?? 0
            tvl += token0Price * token0.amount
            tvl += token1Price * token1.amount

            if (isStaked) {
              rewardAndFeeUSD += token0Price * token0.feeAmount
              rewardAndFeeUSD += token1Price * token1.feeAmount
            } else {
              feeUSD += token0Price * token0.feeAmount
              feeUSD += token1Price * token1.feeAmount
            }

            rewards?.forEach(({ address, amount }) => {
              const rewardPrice = mergedPrices[address] ?? 0
              rewardAndFeeUSD += rewardPrice * amount
            })
          })
        }
      })
    }

    return {
      positionCount: {
        v2,
        v3,
      },
      tvlUSD: tvl,
      unclaimedFeeUSD: feeUSD,
      unclaimedRewardAndFeeUSD: rewardAndFeeUSD,
    }
  }, [portfolio, mergedPrices])

  return (
    <div className="rounded-xl bg-surface-raised">
      <div className="md:py-6 md:grid grid-cols-2 md:divide-x divide-border">
        <div className="py-6 md:py-0 grid grid-cols-2 divide-x divide-border">
          <div className="px-6">
            <MyPositionSummaryItem
              label={t('Positions')}
              value={positionCount.v2 + positionCount.v3}
              onClick={onMyPositionsClick}
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
                <ButtonV2 variant="primary" onClick={openClaimUnstakedFeesModal} disabled={unclaimedFeeUSD === 0}>
                  {t('Claim All')}
                </ButtonV2>
              }
              flexRowWhenSmallScreen
            />
          </div>
          <div className="py-6 md:py-0 md:px-6 border-t md:border-t-0 border-border">
            <MyPositionSummaryItem
              label={t('Boost Rewards & Fees')}
              value={unclaimedRewardAndFeeUSD}
              isDollar
              suffix={
                <ButtonV2
                  variant="primary"
                  onClick={openClaimFeesAndRewardsModal}
                  disabled={unclaimedRewardAndFeeUSD === 0}
                >
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
  onClick,
  isDollar = false,
  suffix,
  flexRowWhenSmallScreen = false,
}: {
  label: string
  value: number
  onClick?: () => void
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
        {onClick ? (
          <button
            type="button"
            className="mt-3 text-[32px] font-medium hover:underline hover:opacity-70"
            onClick={onClick}
          >
            {value === 0
              ? '-'
              : isDollar
              ? `${formatDollarAmountV2({
                  num: value,
                  withDollarSign: true,
                })}`
              : value.toLocaleString()}
          </button>
        ) : (
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
        )}
      </div>
      {suffix}
    </div>
  )
}
