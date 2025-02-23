import { Currency } from '@pancakeswap/sdk'
import { CurrencyLogoWithSymbol, useModal } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import { ArrowDown, CaretDown, Plus } from '@phosphor-icons/react'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MinimalPositionCard } from 'components/PositionCard'
import { CommonBasesType } from 'components/SearchModal/types'
import { BIG_INT_ZERO } from 'config/constants/exchange'
import { useBackTo } from 'hooks/use-back-to'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { PairState, useV2Pair } from 'hooks/usePairs'
import Link from 'next/link'
import { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { usePairAdder } from 'state/user/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { currencyId } from 'utils/currencyId'
import { useAccount } from 'wagmi'
import { AppBody, AppHeader } from '../../components/App'
import Dots from '../../components/Loader/Dots'
import CurrencySearchModal from '../../components/SearchModal/CurrencySearchModal'
import Page from '../Page'

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export default function PoolFinder() {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const native = useNativeCurrency()

  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)
  const [currency0, setCurrency0] = useState<Currency | null>(native)
  const [currency1, setCurrency1] = useState<Currency | null>(null)

  const [pairState, pair] = useV2Pair(currency0 ?? undefined, currency1 ?? undefined)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        pair.reserve0.quotient === BIG_INT_ZERO &&
        pair.reserve1.quotient === BIG_INT_ZERO,
    )

  const position = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = Boolean(position && position.quotient > BIG_INT_ZERO)

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField],
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={handleCurrencySelect}
      showCommonBases
      selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
      commonBasesType={CommonBasesType.LIQUIDITY}
    />,
    true,
    true,
    'selectCurrencyModal',
    [activeField, currency0, currency1],
  )

  const { backTo, saveBackToHref } = useBackTo()

  return (
    <Page>
      <AppBody maxWidth="max-w-md">
        <AppHeader title={t('Import Pool')} subtitle={t('Import an existing pool')} backTo={backTo} />
        <div className="p-5 md:p-8">
          {!account ? (
            <div className="flex flex-col items-center space-y-4 mt-4">
              <p className="text-sm text-on-surface">{t('Connect to a wallet to find pools')}</p>

              <ConnectWalletButton />
            </div>
          ) : (
            <>
              <button
                type="button"
                className="flex items-center py-1 pl-1 rounded-[20px] bg-neutral pr-4 w-full justify-between hover:opacity-70"
                onClick={() => {
                  onPresentCurrencyModal()
                  setActiveField(Fields.TOKEN0)
                }}
              >
                {currency0 ? (
                  <CurrencyLogoWithSymbol
                    currencyA={currency0}
                    logoSize={28}
                    symbol={currency0.symbol}
                    symbolClassName="text-on-surface font-bold"
                  />
                ) : (
                  <span className="font-bold inline-block px-3 text-on-surface py-0.5">{t('Select a Token')}</span>
                )}

                <CaretDown size={16} className="text-on-surface ml-2" />
              </button>

              <Plus size={16} className="text-on-surface my-4 mx-auto" />

              <button
                type="button"
                className="flex items-center py-1 pl-1 rounded-[20px] bg-neutral pr-4 w-full justify-between hover:opacity-70"
                onClick={() => {
                  onPresentCurrencyModal()
                  setActiveField(Fields.TOKEN1)
                }}
              >
                {currency1 ? (
                  <CurrencyLogoWithSymbol
                    currencyA={currency1}
                    logoSize={28}
                    symbol={currency1.symbol}
                    symbolClassName="text-on-surface font-bold"
                  />
                ) : (
                  <span className="font-bold inline-block px-3 text-on-surface py-0.5">{t('Select a Token')}</span>
                )}

                <CaretDown size={16} className="text-on-surface ml-2" />
              </button>

              {!!currency0 && !!currency1 && <ArrowDown size={16} className="text-on-surface mt-4 mx-auto" />}

              {!!currency0 &&
                !!currency1 &&
                (pairState === PairState.EXISTS ? (
                  hasPosition && pair ? (
                    <Wrapper>
                      <MinimalPositionCard pair={pair} />
                      <NextLink
                        href={`/v2/pair/${pair.token0.address}/${pair.token1.address}`}
                        onClick={saveBackToHref}
                      >
                        {t('Manage this pair')}
                      </NextLink>
                    </Wrapper>
                  ) : (
                    <Wrapper>
                      <p className="text-center">{t('You don’t have liquidity in this pair yet.')}</p>
                      <NextLink
                        href={`/v2/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                        onClick={saveBackToHref}
                      >
                        {t('Add Liquidity')}
                      </NextLink>
                    </Wrapper>
                  )
                ) : validPairNoLiquidity ? (
                  <Wrapper>
                    <p className="text-sm text-on-surface text-center">{t('No pair found.')}</p>
                    <NextLink
                      href={`/v2/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                      onClick={saveBackToHref}
                    >
                      {t('Create pair')}
                    </NextLink>
                  </Wrapper>
                ) : pairState === PairState.INVALID ? (
                  <Wrapper>
                    <p className="text-sm">
                      {t('Loading')}
                      <Dots />
                    </p>
                  </Wrapper>
                ) : pairState === PairState.LOADING ? (
                  <Wrapper>
                    <p className="text-sm">{t('Invalid pair.')}</p>
                  </Wrapper>
                ) : null)}
            </>
          )}
        </div>
      </AppBody>
    </Page>
  )
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl text-sm text-on-surface">{children}</div>
  )
}

function NextLink({ children, href, ...props }: PropsWithChildren<{ href: string; onClick?: () => void }>) {
  return (
    <Link
      href={href}
      className="rounded-[20px] bg-brand text-on-surface-inverse hover:opacity-70 px-4 py-2.5 text-sm mt-4 w-full inline-block text-center"
      {...props}
    >
      {children}
    </Link>
  )
}
