/* eslint-disable */
import { Currency } from '@pancakeswap/sdk'
import {
  ButtonV2,
  Card,
  CurrencyLogoWithAmount,
  CurrencyLogoWithSymbol,
  TagV2,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useMemo } from 'react'

import { AppBody, AppHeader } from 'components/App'

import { styled } from 'styled-components'
import Page from 'views/Page'

import { getFarmConfig } from '@pancakeswap/farms/constants'
import { useTranslation } from '@pancakeswap/localization'
import clsx from 'clsx'
import { usePoolTokenPercentage, useTokensDeposited, useTotalUSDValue } from 'components/PositionCard'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMasterchef } from 'hooks/useContract'
import { useV2Pair } from 'hooks/usePairs'
import useTotalSupply from 'hooks/useTotalSupply'
import { useRouter } from 'next/router'
import { useLPApr } from 'state/swap/useLPApr'
import { useTokenBalance } from 'state/wallet/hooks'
import useSWRImmutable from 'swr/immutable'
import { formatAmount } from 'utils/formatInfoNumbers'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { useAccount } from 'wagmi'

type PairTokens = (Currency | undefined)[]

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  max-width: 858px;
  width: 100%;
  z-index: 1;
`

export default function PoolV2Page() {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()

  const router = useRouter()
  const { address: account } = useAccount()

  const [currencyIdA, currencyIdB] = router?.query?.currency ? router.query.currency : []

  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const [, pair] = useV2Pair(baseCurrency, currencyB)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)

  const totalPoolTokens = useTotalSupply(pair?.liquidityToken)

  const poolTokenPercentage = usePoolTokenPercentage({ totalPoolTokens, userPoolBalance })

  const [token0Deposited, token1Deposited] = useTokensDeposited({ pair, userPoolBalance, totalPoolTokens })

  const totalUSDValue = useTotalUSDValue({
    currency0: pair?.token0,
    currency1: pair?.token1,
    token0Deposited,
    token1Deposited,
  })

  const masterchefV2Contract = useMasterchef()

  const { data: isFarmExistActiveForPair } = useSWRImmutable(
    Boolean(chainId) &&
      pair &&
      masterchefV2Contract && ['isFarmExistActiveForPair', chainId, pair.liquidityToken.address],
    async () => {
      const farmsConfig = (await getFarmConfig(chainId)) || []
      const farmPair = farmsConfig.find(
        (farm) => farm.lpAddress.toLowerCase() === pair?.liquidityToken.address.toLowerCase(),
      )
      if (farmPair) {
        const poolInfo = await masterchefV2Contract.read.poolInfo([BigInt(farmPair.pid)])
        const allocPoint = poolInfo[2] as bigint
        return allocPoint > 0 ? 'exist' : 'notexist'
      }
      return 'exist'
    },
  )

  const { isMobile } = useMatchBreakpoints()

  const poolData = useLPApr(pair)

  const tokens: PairTokens = useMemo(() => {
    return [unwrappedToken(pair?.token0), unwrappedToken(pair?.token1)]
  }, [pair, chainId])
  const tokenLabels: string[] = useMemo(() => {
    return [
      //@ts-ignore
      (tokens?.[0]?.isNative ? tokens?.[0]?.symbol : tokens?.[0]?.address) ?? '',
      //@ts-ignore
      (tokens?.[1]?.isNative ? tokens?.[1]?.symbol : tokens?.[1]?.address) ?? '',
    ]
  }, [tokens])

  const buttons = useMemo(() => {
    return (
      <div className="flex items-center space-x-2 mt-6">
        <NextLinkFromReactRouter
          to={`/v2/add/${tokenLabels[0]}/${tokenLabels[1]}`}
          className={clsx({ 'w-full': isMobile })}
        >
          <ButtonV2 disabled={!pair} variant="primary" onClick={() => {}} fullWidth={isMobile}>
            {t('Add')}
          </ButtonV2>
        </NextLinkFromReactRouter>
        <NextLinkFromReactRouter
          to={`/v2/remove/${tokenLabels[0]}/${tokenLabels[1]}`}
          className={clsx({ 'w-full': isMobile })}
        >
          <ButtonV2 disabled={!pair} variant="subtle" onClick={() => {}} fullWidth={isMobile}>
            {t('Remove')}
          </ButtonV2>
        </NextLinkFromReactRouter>
        {isFarmExistActiveForPair === 'notexist' && (
          <NextLinkFromReactRouter
            to={`/v2/migrate/${pair?.liquidityToken?.address}`}
            className={clsx({ 'w-full': isMobile })}
          >
            <ButtonV2 disabled={!pair} variant="subtle" onClick={() => {}} fullWidth={isMobile}>
              {t('Migrate')}
            </ButtonV2>
          </NextLinkFromReactRouter>
        )}
      </div>
    )
  }, [isMobile, pair, t, tokenLabels, isFarmExistActiveForPair])

  return (
    <Page>
      <AppBody>
        <AppHeader
          title={
            <div className="flex items-center space-x-2 w-full justify-between">
              <CurrencyLogoWithSymbol
                currencyA={tokens[0]}
                currencyB={tokens[1]}
                symbol={`${tokens[0]?.symbol}-${tokens[1]?.symbol}`}
                symbolClassName="text-lg font-bold text-on-surface"
              />

              <TagV2>V2 LP</TagV2>
            </div>
          }
          backTo="/liquidity"
          noConfig
        />
        <div className="p-5 md:p-8">
          <h3 className="text-xs text-on-surface-brand">{t('Liquidity')}</h3>

          <p className="mt-2 font-bold text-on-surface text-xl">
            $
            {totalUSDValue
              ? totalUSDValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '-'}
          </p>

          <CurrencyWithAmount
            a={{ currency: tokens[0], symbol: tokens[0]?.symbol, amount: token0Deposited?.toSignificant(4) }}
            b={{ currency: tokens[1], symbol: tokens[1]?.symbol, amount: token1Deposited?.toSignificant(4) }}
          />

          <div className="flex flex-col items-start space-y-0.5 mt-1.5 text-on-surface-subtle text-[13px]">
            {poolData && (
              <p>
                {t('LP reward APR')}: {formatAmount(poolData?.lpApr7d)}%
              </p>
            )}

            <p>
              {t('Your share in pool')}: {poolTokenPercentage ? `${poolTokenPercentage.toFixed(8)}%` : '-'}
            </p>
          </div>

          {buttons}
        </div>
      </AppBody>
    </Page>
  )
}

type CurrencyWithAmountProps = {
  currency: Currency | undefined
  symbol?: string
  amount?: string
}

function CurrencyWithAmount({ a, b }: { a: CurrencyWithAmountProps; b: CurrencyWithAmountProps }) {
  return (
    <div className="mt-2">
      <CurrencyLogoWithAmount
        currencyA={a.currency}
        symbol={a.symbol}
        amount={a.amount}
        className="py-3 border-y border-border"
      />
      <CurrencyLogoWithAmount
        currencyA={b.currency}
        symbol={b.symbol}
        amount={b.amount}
        className="py-3 border-b border-border"
      />
    </div>
  )
}
