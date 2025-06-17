import { CAKE_SYMBOL } from '@pancakeswap/tokens'
import { ButtonV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import useBoost from 'hooks/useBoost'
import { useCakePrice } from 'hooks/useCakePrice'
import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/usePortfolio'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { formatAmount } from 'utils/formatInfoNumbers'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export default function BoostingCard({
  className,
  poolId,
  positionId,
  isStaked,
  onDone,
}: {
  className?: string
  poolId: Address
  positionId: number
  isStaked: boolean
  onDone?: () => void
}) {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { portfolio } = usePortfolio({ account, onlyPoolIds: [poolId] })
  const positionData = useMemo(() => {
    if (!portfolio || !portfolio[poolId]) return null

    const position = (portfolio[poolId] as PortfolioV3DataBigInt).positions.find((p) => p.positionId === positionId)
    if (!position) return null
    return position
  }, [portfolio, poolId, positionId])

  const rewardAmount = useMemo(() => {
    if (!positionData || !positionData.rewards) return 0
    return positionData.rewards.reduce((acc, r) => acc + r.amount, 0)
  }, [positionData])

  const cakePrice = useCakePrice()
  const { onStake, onUnstake, onHarvest, attemptingTxn } = useBoost({
    poolId,
    positionId,
    onDone,
  })

  return (
    <div className={clsx('px-4 py-3 rounded-xl bg-neutral w-full', className)}>
      <div className="flex items-center space-x-3 justify-between">
        {!isStaked ? (
          <>
            <div className="flex flex-col">
              <h4 className="text-on-surface">{t('Deposit tokens and harvest rewards!')}</h4>

              <p className="text-xs text-on-surface-subtlest mt-2">
                {t('Provide tokens to the liquidity pool to start farming.')}
              </p>
              <p className="text-xs text-on-surface-subtlest">
                {t(
                  'Rewards accumulate daily based on your deposit amount, and you can claim them to your wallet anytime.',
                )}
              </p>
            </div>

            <ButtonV2 variant="primary" onClick={onStake} disabled={attemptingTxn}>
              {t('Start Boost')}
            </ButtonV2>
          </>
        ) : (
          <>
            <div className="flex flex-col space-y-2 items-start">
              <h5 className="text-on-surface-subtlest text-xs">{t('Harvested Amount')}</h5>

              <span className="text-on-surface font-bold">{`${rewardAmount} ${CAKE_SYMBOL}`}</span>

              <span className="text-on-surface-subtlest text-xs">
                ~ {formatAmount(rewardAmount * cakePrice.toNumber())} USD
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <ButtonV2 variant="subtle" onClick={onUnstake} disabled={attemptingTxn}>
                {t('Cancel Boost')}
              </ButtonV2>

              <ButtonV2 variant="secondary" onClick={onHarvest} disabled={attemptingTxn || !rewardAmount}>
                {t('Harvest')}
              </ButtonV2>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
