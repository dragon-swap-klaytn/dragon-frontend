import { useTranslation } from '@pancakeswap/localization'
import { Price, Token } from '@pancakeswap/swap-sdk-core'
import { TagV2 } from '@pancakeswap/uikit'
import { Bound } from '@pancakeswap/widgets-internal'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { AddLiquidityButtonV2 } from 'components/AddLiquidityButtonV2'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useBackTo } from 'hooks/use-back-to'
import { PortfolioData, PortfolioPositionBigInt, PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import useTokenPrices from 'hooks/use-token-prices'
import { useDerivedPositionInfoV2 } from 'hooks/v3/useDerivedPositionInfoV2'
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { TokenSimple } from 'lib/graph-queries/types'
import NextLink from 'next/link'
import { PoolParsed, PoolV3Parsed } from 'pages/api/pools'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { useMemo, useState } from 'react'
import { PoolType } from 'types'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import { useAccount } from 'wagmi'

export default function PositionCardList({
  className,
  poolData,
  portfolioData,
}: {
  className?: string
  poolData: PoolParsed
  portfolioData?: PortfolioData
}) {
  const { prices } = useTokenPrices()
  // use swapscanner price as fallback
  const { prices: ssPrices } = useTokenPrices({ source: 'swapscanner' })

  const priceMap = useMemo(
    () => ({
      ...prices,
      ...ssPrices,
    }),
    [prices, ssPrices],
  )

  return (
    <div className={clsx('flex flex-col items-center space-y-3', className)}>
      {!portfolioData ? (
        <EmptyPositionCard token0={poolData.token0} token1={poolData.token1} />
      ) : portfolioData.type === 'v3' ? (
        (portfolioData as PortfolioV3DataBigInt).positions.map((position) => (
          <V3PositionCard
            key={`${portfolioData.poolId}:position:${position.positionId}`}
            token0={poolData.token0}
            token1={poolData.token1}
            position={position}
            poolFeeTier={+(poolData as PoolV3Parsed).feeTier}
            isBoosted={!!(poolData as PoolV3Parsed).rewardApr && (poolData as PoolV3Parsed).rewardApr > 0}
            priceMap={priceMap}
          />
        ))
      ) : (
        <V2PositionCard
          token0={poolData.token0}
          token1={poolData.token1}
          portfolioV2={portfolioData as PortfolioV2Data}
          priceMap={priceMap}
          poolTvlUSD={poolData.tvlUSD.current}
          poolAPY={poolData.apy['24H']}
        />
      )}
    </div>
  )
}

function EmptyPositionCard({
  poolType,
  token0,
  token1,
}: {
  poolType?: PoolType
  token0: TokenSimple
  token1: TokenSimple
}) {
  const { address: account } = useAccount()
  const { t } = useTranslation()

  return (
    <div className="p-5 rounded-xl flex flex-col items-start space-y-5 bg-neutral-dark w-full">
      <h5>{account ? t('No positions found') : t('Connect your wallet to view your positions')}</h5>
      {account ? (
        <AddLiquidityButtonV2 fullWidth poolType={poolType} token0={token0} token1={token1} />
      ) : (
        <ConnectWalletButton />
      )}
    </div>
  )
}

function V3PositionCard({
  token0,
  token1,
  position,
  poolFeeTier,
  isBoosted,
  priceMap,
}: {
  token0: TokenSimple
  token1: TokenSimple
  position: PortfolioPositionBigInt
  poolFeeTier: number
  isBoosted: boolean
  priceMap: Record<string, number>
}) {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const { saveBackToHref } = useBackTo()

  const { position: _position } = useDerivedPositionInfoV2(position, poolFeeTier)
  const tickAtLimit = useIsTickAtLimit(poolFeeTier, _position?.tickLower, _position?.tickUpper)

  const [inverted, setInverted] = useState(false)

  const { token0USD, token1USD, rewardsUSD } = useMemo(() => {
    const price0 = priceMap[position.token0.address] ?? 0
    const price1 = priceMap[position.token1.address] ?? 0
    const rewardPrice = position.rewards ? priceMap[position.rewards[0].address] ?? 0 : 0

    return {
      token0USD: {
        deposited: position.token0.amount * price0,
        fee: position.token0.feeAmount * price0,
      },
      token1USD: {
        deposited: position.token1.amount * price1,
        fee: position.token1.feeAmount * price1,
      },
      rewardsUSD: position.rewards ? position.rewards.reduce((acc, reward) => acc + reward.amount * rewardPrice, 0) : 0,
    }
  }, [position, priceMap])

  const { priceLower, priceUpper } = useMemo(() => {
    if (!_position) return { priceLower: null, priceUpper: null }

    return {
      priceLower: inverted ? _position.token0PriceLower : _position.token0PriceUpper.invert(),
      priceUpper: inverted ? _position.token0PriceUpper : _position.token0PriceLower.invert(),
    }
  }, [inverted, _position])

  return (
    <NextLink
      className="p-5 rounded-xl space-y-5 bg-neutral-dark w-full hover:bg-neutral-dark-hovered"
      onClick={saveBackToHref}
      href={`/liquidity/${position.positionId}`}
    >
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h5 className="text-on-surface">{`${token0.symbol}/${token1.symbol}`}</h5>
            <span className="text-[13px] text-gray-500">#{position.positionId}</span>
          </div>
          <TagV2 className={clsx('min-w-8', { hidden: !isBoosted || position.isOutOfBounds })} color="orange">
            Boost 🔥
          </TagV2>
        </div>

        <TagV2 className="min-w-8" color={position.isOutOfBounds ? 'red' : 'green'}>
          {position.isOutOfBounds ? t('Out of range') : 'In range'}
        </TagV2>
      </div>

      <div className="lg:hidden">
        <MinMaxPrice
          token0={token0}
          token1={token1}
          priceLower={priceLower}
          priceUpper={priceUpper}
          tickAtLimit={tickAtLimit}
          locale={locale}
          inverted={inverted}
          setInverted={setInverted}
        />
      </div>

      <div className="w-full grid s:flex grid-cols-3 gap-3">
        <div className="s:min-w-24">
          <div className="text-sm">
            {formatDollarAmountV2({
              num: token0USD.deposited + token1USD.deposited,
              withDollarSign: true,
            })}
          </div>
          <div className="mt-1 text-xs-subtlest">{t('Position')}</div>
        </div>
        <div className="s:min-w-24">
          <div className="text-sm">
            {formatDollarAmountV2({
              num: token0USD.fee + token1USD.fee,
              withDollarSign: true,
            })}
          </div>
          <div className="mt-1 text-xs text-on-surface-subtlest">{t('Fees')}</div>
        </div>
        <div className="s:min-w-24">
          <div className="text-sm text-on-surface">
            {/* TODO: fix this APR @kay */}
            APY VAL
          </div>

          <div className="mt-1 text-xs text-on-surface-subtlest">{t('APY')}</div>
        </div>

        <div className="hidden lg:block">
          <MinMaxPrice
            token0={token0}
            token1={token1}
            priceLower={priceLower}
            priceUpper={priceUpper}
            tickAtLimit={tickAtLimit}
            locale={locale}
            inverted={inverted}
            setInverted={setInverted}
          />
        </div>

        <div className="s:min-w-24">
          <div className="text-sm text-on-surface-brand">
            {formatDollarAmountV2({
              num: rewardsUSD,
              withDollarSign: true,
            })}
          </div>

          <div className="mt-1 text-xs text-on-surface-subtlest">{t('Rewards')}</div>
        </div>
      </div>
    </NextLink>
  )
}

function MinMaxPrice({
  token0,
  token1,
  priceLower,
  priceUpper,
  tickAtLimit,
  locale,
  inverted,
  setInverted,
}: {
  token0: TokenSimple
  token1: TokenSimple
  priceLower?: Price<Token, Token> | null
  priceUpper?: Price<Token, Token> | null
  tickAtLimit: {
    LOWER?: boolean
    UPPER?: boolean
  }
  locale: string
  inverted: boolean
  setInverted: (value: boolean) => void
}) {
  return (
    <div className="flex flex-col items-start w-[220px]">
      <div className="text-xs text-on-surface-subtlest flex flex-wrap items-center gap-1 mt-1">
        <span className="inline-block w-7">Min:</span>
        <span className="text-[13px]">
          {formatTickPrice(priceLower ?? undefined, tickAtLimit, Bound.LOWER, locale)}
        </span>

        <div className="flex items-center space-x-1">
          <span className="text-xs">
            {!inverted ? `${token0.symbol}-${token1.symbol}` : `${token1.symbol}-${token0.symbol}`}
          </span>

          <button
            type="button"
            className="hover:opacity-70 text-on-surface-subtlest"
            onClick={() => setInverted(!inverted)}
          >
            <ArrowsLeftRight />
          </button>
        </div>
      </div>

      <div className="mt-1 text-xs text-on-surface-subtlest flex flex-wrap items-center gap-1">
        <span className="inline-block w-7">Max:</span>
        <span className="text-[13px]">
          {formatTickPrice(priceUpper ?? undefined, tickAtLimit, Bound.UPPER, locale)}
        </span>

        <div className="flex items-center space-x-1">
          <span className="text-xs">
            {!inverted ? `${token0.symbol}/${token1.symbol}` : `${token1.symbol}/${token0.symbol}`}
          </span>
        </div>
      </div>
    </div>
  )
}

function V2PositionCard({
  token0,
  token1,
  portfolioV2,
  priceMap,
  poolTvlUSD,
  poolAPY,
}: {
  token0: TokenSimple
  token1: TokenSimple
  portfolioV2: PortfolioV2Data
  priceMap: Record<string, number>
  poolTvlUSD: number
  poolAPY: number
}) {
  const { t } = useTranslation()
  const { saveBackToHref } = useBackTo()

  const {
    token0: { amount: amount0 },
    token1: { amount: amount1 },
  } = portfolioV2

  const positionSummary = useMemo(() => {
    const price0 = priceMap[token0.id] ?? 0
    const price1 = priceMap[token1.id] ?? 0

    const tvlUSD = amount0 * price0 + amount1 * price1
    const share = tvlUSD / poolTvlUSD

    return {
      tvlUSD,
      share,
    }
  }, [priceMap, token0, token1, amount0, amount1, poolTvlUSD])

  return (
    <NextLink
      className="p-5 rounded-xl flex flex-col items-start space-y-5 bg-neutral-dark w-full hover:bg-neutral-dark-hovered"
      onClick={saveBackToHref}
      href={`/v2/pair/${token0.id}/${token1.id}`}
    >
      <h5>{`${token0.symbol}-${token1.symbol}`}</h5>

      <div className="w-full grid s:flex grid-cols-3 gap-3">
        <div className="s:min-w-24">
          <div className="text-sm">
            {formatDollarAmountV2({
              num: positionSummary.tvlUSD,
              withDollarSign: true,
            })}
          </div>
          <div className="mt-1 text-xs text-on-surface-subtlest">{t('Value')}</div>
        </div>
        <div className="s:min-w-24">
          <div className="text-sm">
            {positionSummary.share.toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="mt-1 text-xs text-on-surface-subtlest">{t('Shares')}</div>
        </div>
        <div className="s:min-w-24">
          <div className="text-sm">
            {poolAPY.toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div className="mt-1 text-xs text-on-surface-subtlest">{t('APY')}</div>
        </div>
      </div>
    </NextLink>
  )
}
