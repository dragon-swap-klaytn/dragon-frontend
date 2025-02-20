import { useTranslation } from '@pancakeswap/localization'
import { Price, Token } from '@pancakeswap/swap-sdk-core'
import { TagV2 } from '@pancakeswap/uikit'
import { FeeCalculator, Pool, Position } from '@pancakeswap/v3-sdk'
import { Bound } from '@pancakeswap/widgets-internal'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { AddLiquidityButtonV2 } from 'components/AddLiquidityButtonV2'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useBackTo } from 'hooks/use-back-to'
import { PortfolioData, PortfolioV3DataBigInt, PositionV3 } from 'hooks/use-portfolio'
import useTokenPrices from 'hooks/use-token-prices'
import { useV3Pool } from 'hooks/v3/use-v3-pool'
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { TokenSimple } from 'lib/graph-queries/types'
import NextLink from 'next/link'
import { PoolParsed, PoolV3Parsed } from 'pages/api/pools'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { useMemo, useState } from 'react'
import { PoolType } from 'types'
import { calculateAPR, calculateAPY } from 'utils/calculate-interests'
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
      ...ssPrices,
      ...prices,
    }),
    [prices, ssPrices],
  )

  const v3Pool = useV3Pool({ poolData })

  return (
    <div className={clsx('flex flex-col items-center space-y-3', className)}>
      {!portfolioData ? (
        <EmptyPositionCard token0={poolData.token0} token1={poolData.token1} />
      ) : portfolioData.type === 'v3' ? (
        (portfolioData as PortfolioV3DataBigInt).positions.map((position) =>
          v3Pool ? (
            <V3PositionCard
              key={`${portfolioData.poolId}:position:${position.positionId}`}
              token0={poolData.token0}
              token1={poolData.token1}
              pool={v3Pool}
              volume24H={poolData.volumeUSD['24H']}
              rewardApr={(poolData as PoolV3Parsed).rewardApr || 0}
              position={position}
              priceMap={priceMap}
            />
          ) : null,
        )
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

export function V3PositionCard({
  token0,
  token1,
  pool,
  position: _position,
  volume24H,
  rewardApr,
  priceMap,
  bgClassName = 'bg-neutral-dark hover:bg-neutral-dark-hovered',
}: {
  token0: TokenSimple
  token1: TokenSimple
  pool: Pool
  position: PositionV3
  volume24H: number
  rewardApr: number
  priceMap: Record<string, number>
  bgClassName?: string
}) {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const { saveBackToHref } = useBackTo()

  const [inverted, setInverted] = useState(false)

  const isBoosted = rewardApr > 0

  const position = useMemo(
    () =>
      new Position({
        pool,
        liquidity: _position.liquidity,
        tickLower: _position.lower,
        tickUpper: _position.upper,
      }),
    [pool, _position.liquidity, _position.lower, _position.upper],
  )

  const { token0USD, token1USD, rewardsUSD } = useMemo(() => {
    const price0 = priceMap[_position.token0.address] ?? 0
    const price1 = priceMap[_position.token1.address] ?? 0
    const rewardPrice = _position.rewards ? priceMap[_position.rewards[0].address] ?? 0 : 0

    return {
      token0USD: {
        deposited: _position.token0.amount * price0,
        fee: _position.token0.feeAmount * price0,
      },
      token1USD: {
        deposited: _position.token1.amount * price1,
        fee: _position.token1.feeAmount * price1,
      },
      rewardsUSD: _position.rewards
        ? _position.rewards.reduce((acc, reward) => acc + reward.amount * rewardPrice, 0)
        : 0,
    }
  }, [_position, priceMap])

  const { lpApr, lpApy: _lpApy } = useMemo(() => {
    const fee24HFraction = FeeCalculator.getEstimatedLPFeeByAmounts({
      amountA: position.amount0,
      amountB: position.amount1,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      volume24H,
      sqrtRatioX96: pool.sqrtRatioX96,
      mostActiveLiquidity: pool.liquidity,
      fee: pool.fee,
    })

    const estimatedFee24H = +fee24HFraction.toSignificant(6)
    const positionLiquidity = token0USD.deposited + token1USD.deposited
    const duration = 24 * 60 * 60 * 1000

    return {
      lpApr: calculateAPR({
        interest: estimatedFee24H,
        principal: positionLiquidity,
        duration,
      }),
      lpApy: calculateAPY({
        interest: estimatedFee24H,
        principal: positionLiquidity,
        duration,
      }),
    }
  }, [pool, position, volume24H, token0USD, token1USD])

  const tickAtLimit = useIsTickAtLimit(pool.fee, _position.lower, _position.upper)
  const priceLower = inverted ? position.token0PriceLower : position.token0PriceUpper.invert()
  const priceUpper = inverted ? position.token0PriceUpper : position.token0PriceLower.invert()

  return (
    <NextLink
      className={clsx('p-5 rounded-xl space-y-5 w-full', bgClassName)}
      onClick={saveBackToHref}
      href={`/liquidity/${_position.positionId}`}
    >
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h5 className="text-on-surface">{`${token0.symbol}/${token1.symbol}`}</h5>
            <span className="text-[13px] text-gray-500">#{_position.positionId}</span>
          </div>
          <TagV2 className={clsx('min-w-8', { hidden: !isBoosted || _position.isOutOfBounds })} color="orange">
            Boost 🔥
          </TagV2>
        </div>

        <TagV2 className="min-w-8" color={_position.isOutOfBounds ? 'red' : 'green'}>
          {_position.isOutOfBounds ? t('Out of range') : 'In range'}
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
          <div
            className={clsx('text-sm', {
              'text-brand': isBoosted,
            })}
          >
            {(lpApr + rewardApr).toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div className="mt-1 text-xs text-on-surface-subtlest">{t('APR')}</div>
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
