import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Pair, Percent } from '@pancakeswap/sdk'
import { CardProps, CurrencyLogoWithSymbol, ExternalLink, Notification, QuestionHelper } from '@pancakeswap/uikit'
import { BIG_INT_ZERO } from 'config/constants/exchange'
import { useStablecoinPriceAmount } from 'hooks/useBUSDPrice'
import useTotalSupply from 'hooks/useTotalSupply'
import { ReactNode, useContext, useMemo } from 'react'
import { useGetRemovedTokenAmounts } from 'views/RemoveLiquidity/RemoveStableLiquidity/hooks/useStableDerivedBurnInfo'
import { StableConfigContext } from 'views/Swap/hooks/useStableConfig'
import { useAccount } from 'wagmi'

import { useRouter } from 'next/router'
import { useLPApr } from 'state/swap/useLPApr'
import { useTokenBalance } from 'state/wallet/hooks'
import { unwrappedToken } from '../../utils/wrappedCurrency'

import { formatAmount } from '../../utils/formatInfoNumbers'

export interface PositionCardProps extends CardProps {
  pair: Pair
  showUnwrapped?: boolean
  currency0: Currency
  currency1: Currency
  token0Deposited: CurrencyAmount<Currency>
  token1Deposited: CurrencyAmount<Currency>
  totalUSDValue: number
  userPoolBalance: CurrencyAmount<Currency>
  poolTokenPercentage: Percent
}

export const useTokensDeposited = ({ pair, totalPoolTokens, userPoolBalance }) => {
  const [token0Deposited, token1Deposited] =
    !!pair && !!totalPoolTokens && !!userPoolBalance && totalPoolTokens.quotient >= userPoolBalance.quotient
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  return [token0Deposited, token1Deposited]
}

export const useTotalUSDValue = ({ currency0, currency1, token0Deposited, token1Deposited }) => {
  const token0USDValue = useStablecoinPriceAmount(
    currency0,
    token0Deposited ? parseFloat(token0Deposited.toSignificant(6)) : undefined,
  )
  const token1USDValue = useStablecoinPriceAmount(
    currency1,
    token1Deposited ? parseFloat(token1Deposited.toSignificant(6)) : undefined,
  )

  return token0USDValue && token1USDValue ? token0USDValue + token1USDValue : null
}

export const usePoolTokenPercentage = ({ userPoolBalance, totalPoolTokens }) => {
  return !!userPoolBalance && !!totalPoolTokens && totalPoolTokens.quotient >= userPoolBalance.quotient
    ? new Percent(userPoolBalance.quotient, totalPoolTokens.quotient)
    : undefined
}

const withLPValuesFactory =
  ({ useLPValuesHook, hookArgFn }) =>
  (Component) =>
  (props) => {
    const { address: account } = useAccount()

    const currency0 = props.showUnwrapped ? props.pair.token0 : unwrappedToken(props.pair.token0)
    const currency1 = props.showUnwrapped ? props.pair.token1 : unwrappedToken(props.pair.token1)

    const userPoolBalance = useTokenBalance(account ?? undefined, props.pair.liquidityToken)

    const totalPoolTokens = useTotalSupply(props.pair.liquidityToken)

    const poolTokenPercentage = usePoolTokenPercentage({ totalPoolTokens, userPoolBalance })

    const args = useMemo(
      () =>
        hookArgFn({
          userPoolBalance,
          pair: props.pair,
          totalPoolTokens,
        }),
      [userPoolBalance, props.pair, totalPoolTokens],
    )

    const [token0Deposited, token1Deposited] = useLPValuesHook(args)

    const totalUSDValue = useTotalUSDValue({ currency0, currency1, token0Deposited, token1Deposited })

    return (
      <Component
        {...props}
        currency0={currency0}
        currency1={currency1}
        token0Deposited={token0Deposited}
        token1Deposited={token1Deposited}
        totalUSDValue={totalUSDValue}
        userPoolBalance={userPoolBalance}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

export const withLPValues = withLPValuesFactory({
  useLPValuesHook: useTokensDeposited,
  hookArgFn: ({ pair, userPoolBalance, totalPoolTokens }) => ({ pair, userPoolBalance, totalPoolTokens }),
})

export const withStableLPValues = withLPValuesFactory({
  useLPValuesHook: useGetRemovedTokenAmounts,
  hookArgFn: ({ userPoolBalance }) => ({
    lpAmount: userPoolBalance?.quotient?.toString(),
  }),
})

function MinimalPositionCardView({
  pair,
  currency0,
  currency1,
  token0Deposited,
  token1Deposited,
  totalUSDValue,
  userPoolBalance,
  poolTokenPercentage,
}: PositionCardProps) {
  const { locale } = useRouter()
  const isStableLP = useContext(StableConfigContext)

  const { t } = useTranslation()
  const poolData = useLPApr(pair)

  return (
    <>
      {userPoolBalance && userPoolBalance.quotient > BIG_INT_ZERO ? (
        <div className="p-4 bg-neutral rounded-2xl w-full">
          <h5 className="text-on-surface-brand text-sm">{t('LP tokens in your wallet')}</h5>

          <div className="mt-4 flex flex-col items-center space-y-2">
            <div className="flex items-start space-x-2 justify-between w-full">
              <CurrencyLogoWithSymbol
                currencyA={currency0}
                currencyB={currency1}
                symbol={`${currency0.name === 'Tether USD (Stargate)' ? 'USDT(Stargate)' : currency0.symbol}-${
                  currency1.name === 'Tether USD (Stargate)' ? 'USDT(Stargate)' : currency1.symbol
                } LP`}
                symbolClassName="text-on-surface text-sm"
              />

              <div className="flex flex-col items-end">
                <span className="text-on-surface text-sm">
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </span>

                {Number.isFinite(totalUSDValue) && (
                  <span className="text-on-surface-subtlest text-[13px]">{`(~${totalUSDValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} USD)`}</span>
                )}
              </div>
            </div>

            {poolData && (
              <Wrapper
                title={
                  <h5 className="flex items-center space-x-1">
                    <span>{t('LP reward APR')}</span>
                    <QuestionHelper
                      text={t(`Based on last 7 days' performance. Does not account for impermanent loss`)}
                    />
                  </h5>
                }
                value={`${formatAmount(poolData.lpApr7d)}%`}
              />
            )}

            <Wrapper
              title={<h5>{t('Share in Trading Pair')}</h5>}
              value={poolTokenPercentage ? `${poolTokenPercentage.toFixed(2)}%` : '-'}
            />

            {isStableLP ? null : (
              <Wrapper
                title={<h5>{t('Pooled {{asset}}', { asset: currency0.symbol })}</h5>}
                value={token0Deposited?.toSignificant(6) || '-'}
              />
            )}

            {isStableLP ? null : (
              <Wrapper
                title={<h5>{t('Pooled {{asset}}', { asset: currency1.symbol })}</h5>}
                value={token1Deposited?.toSignificant(6) || '-'}
              />
            )}
          </div>
        </div>
      ) : (
        <Notification variant="info" nStyle="highlight" fullWidth>
          {isStableLP ? (
            <>
              {t(
                'By adding liquidity, you’ll earn 50% from the fees of all trades on this pair, proportional to your share in the trading pair. Fees are added to the pair, accrue in real time, and can be claimed by withdrawing your liquidity. For more information on Stableswap fees click',
              )}

              <ExternalLink
                href={
                  locale === 'ko' ? 'https://docs.dgswap.io/ko/services/fees' : 'https://docs.dgswap.io/services/fees'
                }
                className="ml-1"
                hideIcon
              >
                {t('here.')}
              </ExternalLink>
            </>
          ) : (
            t(
              "By adding liquidity you'll earn 0.24% of all trades on this pair proportional to your share in the trading pair. Fees are added to the pair, accrue in real time and can be claimed by withdrawing your liquidity.",
            )
          )}
        </Notification>
      )}
    </>
  )
}

export const MinimalPositionCard = withLPValues(MinimalPositionCardView)

function Wrapper({ title, value }: { title: ReactNode; value: string }) {
  return (
    <div className="flex items-start space-x-2 justify-between w-full text-sm text-on-surface-subtle">
      {title} <span>{value}</span>
    </div>
  )
}
