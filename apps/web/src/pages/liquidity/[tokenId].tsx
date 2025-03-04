/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ChainId } from '@pancakeswap/chains'
import { Currency, CurrencyAmount, Fraction, Percent, Price, Token } from '@pancakeswap/sdk'
import {
  ButtonV2,
  ContainerV2,
  CurrencyLogoWithAmount,
  CurrencyLogoWithSymbol,
  ExternalLink,
  NotFound,
  Spinner,
  TagV2,
  ToggleSwitch,
  useMatchBreakpoints,
  useModal,
} from '@pancakeswap/uikit'

import { ConfirmationModalContent, NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

import { DEFAULT_LANGUAGE, Locale, Trans, useTranslation } from '@pancakeswap/localization'
import { MasterChefV3, NonfungiblePositionManager, Pool, Position, isPoolTickInRange } from '@pancakeswap/v3-sdk'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { AppBody, AppHeader } from 'components/App'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import { CurrencyLogo } from 'components/Logo'
import { RangePriceSection } from 'components/RangePriceSection'
import { RangeTag } from 'components/RangeTag'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { Bound } from 'config/constants/types'
import { MASTERCHEFV3_ADDRESS } from 'const'
import { useHistory } from 'contexts/HistoryContext'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import { useToken } from 'hooks/Tokens'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useStablecoinPrice } from 'hooks/useBUSDPrice'
import { useMasterchefV3, useV3NFTPositionManagerContract } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { PoolState } from 'hooks/v3/types'
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit'
import { usePool } from 'hooks/v3/usePools'
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees'
import { useV3PositionFromTokenId, useV3TokenIdsByAccount } from 'hooks/v3/useV3Positions'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import getPriceOrderingFromPositionForUI from 'hooks/v3/utils/getPriceOrderingFromPositionForUI'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, PropsWithChildren, ReactNode, memo, useCallback, useMemo, useState } from 'react'
import { useFarmsV3WithPositionsAndBooster } from 'state/farmsV3/hooks'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin, getBlockExploreLink } from 'utils'
import currencyId from 'utils/currencyId'
import { formatCurrencyAmount, formatPrice } from 'utils/formatCurrencyAmount'
import { v3Clients } from 'utils/graphql'
import { isUserRejected } from 'utils/sentry'
import { toChecksumToken } from 'utils/toChecksumToken'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { getViemClients } from 'utils/viem'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { hexToBigInt } from 'viem'
import { AprCalculator } from 'views/AddLiquidityV3/components/AprCalculator'
import RateToggle from 'views/AddLiquidityV3/formViews/V3FormView/components/RateToggle'
import { useIsBoostedPool, useUserPositionInfo } from 'views/Farms/components/YieldBooster/hooks/bCakeV3/useBCakeV3Info'
import { V3FarmWithoutStakedValue } from 'views/Farms/FarmsV3'
import Page from 'views/Page'
import BoostingCard from 'views/PoolsV2/components/BoostingCard'
import { useSendTransaction, useWalletClient } from 'wagmi'

const useInverter = ({
  priceLower,
  priceUpper,
  quote,
  base,
  invert,
}: {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
  invert?: boolean
}): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} => {
  return {
    priceUpper: invert ? priceLower?.invert() : priceUpper,
    priceLower: invert ? priceUpper?.invert() : priceLower,
    quote: invert ? base : quote,
    base: invert ? quote : base,
  }
}

function PositionPriceSection({
  priceUpper,
  currencyQuote,
  currencyBase,
  priceLower,
  pool,
  tickAtLimit,
  setManuallyInverted,
  manuallyInverted,
}) {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()

  return (
    <>
      <div className="flex items-center space-x-2 w-full justify-between mt-8">
        <SectionTitle>{t('Price Range')}</SectionTitle>

        {currencyBase && currencyQuote && (
          <RateToggle currencyA={currencyBase} handleRateToggle={() => setManuallyInverted(!manuallyInverted)} />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        <RangePriceSection
          title={t('Min Price')}
          price={formatTickPrice(priceLower, tickAtLimit, Bound.LOWER, locale)}
          currency0={manuallyInverted ? currencyQuote : currencyBase}
          currency1={manuallyInverted ? currencyBase : currencyQuote}
        />

        <RangePriceSection
          title={t('Max Price')}
          price={formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER, locale)}
          currency0={manuallyInverted ? currencyQuote : currencyBase}
          currency1={manuallyInverted ? currencyBase : currencyQuote}
        />

        <div className="flex items-center col-span-2 md:col-span-1">
          <hr className="border-r border-border w-px mr-4 h-[120px] hidden md:block" />

          {pool && currencyQuote && currencyBase ? (
            <RangePriceSection
              className="pl-4"
              title={t('Current Price')}
              titleColor="text-on-surface-brand"
              currency0={manuallyInverted ? currencyQuote : currencyBase}
              currency1={manuallyInverted ? currencyBase : currencyQuote}
              price={formatPrice(manuallyInverted ? pool.token0Price : pool.token1Price, 6, locale)}
            />
          ) : null}
        </div>
      </div>
    </>
  )
}

export default function PoolPage() {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()

  const { backTo } = useHistory()

  const [collecting, setCollecting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const [receiveWNATIVE, setReceiveWNATIVE] = useState(false)

  const { data: signer } = useWalletClient()
  const { sendTransactionAsync } = useSendTransaction()

  const { account, chainId } = useAccountActiveChain()

  const router = useRouter()
  const { tokenId: tokenIdFromUrl } = router.query

  const parsedTokenId = tokenIdFromUrl ? BigInt(tokenIdFromUrl as string) : undefined

  const { loading, position: positionDetails } = useV3PositionFromTokenId(parsedTokenId)

  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tickLower,
    tickUpper,
    tokenId,
  } = positionDetails || {}

  const tokenIdStr = tokenId?.toString() || ''

  const removed = liquidity === 0n

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  // construct Position from details returned
  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined, feeAmount)
  const position = useMemo(() => {
    if (pool && typeof liquidity === 'bigint' && typeof tickLower === 'number' && typeof tickUpper === 'number') {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, pool, tickLower, tickUpper])

  const poolAddress = useMemo(() => pool && Pool.getAddress(pool.token0, pool.token1, pool.fee), [pool])

  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)

  const pricesFromPosition = getPriceOrderingFromPositionForUI(position)

  const [manuallyInverted, setManuallyInverted] = useState(false)

  // handle manual inversion
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: manuallyInverted,
  })

  const inverted = token1 && base ? base.equals(token1) : undefined
  const currencyQuote = inverted ? currency0 : currency1
  const currencyBase = inverted ? currency1 : currency0

  // fees
  const [feeValue0, feeValue1] = useV3PositionFees(pool ?? undefined, positionDetails?.tokenId, receiveWNATIVE)

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  const currency0ForFeeCollectionPurposes = pool
    ? receiveWNATIVE
      ? pool.token0
      : unwrappedToken(pool.token0)
    : undefined
  const currency1ForFeeCollectionPurposes = pool
    ? receiveWNATIVE
      ? pool.token1
      : unwrappedToken(pool.token1)
    : undefined

  const isCollectPending = useIsTransactionPending(collectMigrationHash ?? undefined)

  // usdc prices always in terms of tokens
  const price0 = useStablecoinPrice(token0 ? toChecksumToken(token0) : undefined, { enabled: !!feeValue0 })
  const price1 = useStablecoinPrice(token1 ? toChecksumToken(token1) : undefined, { enabled: !!feeValue1 })

  const fiatValueOfFees: CurrencyAmount<Currency> | null = useMemo(() => {
    if (!price0 || !price1 || !feeValue0 || !feeValue1) return null

    // we wrap because it doesn't matter, the quote returns a USDC amount
    const feeValue0Wrapped = feeValue0?.wrapped
    const feeValue1Wrapped = feeValue1?.wrapped

    if (!feeValue0Wrapped || !feeValue1Wrapped) return null

    const amount0 = price0.quote(feeValue0Wrapped)
    const amount1 = price1.quote(feeValue1Wrapped)
    return amount0.add(amount1)
  }, [price0, price1, feeValue0, feeValue1])

  const fiatValueOfLiquidity: CurrencyAmount<Currency> | null = useMemo(() => {
    if (!price0 || !price1 || !position) return null
    const amount0 = price0.quote(position.amount0)
    const amount1 = price1.quote(position.amount1)

    return amount0.add(amount1)
  }, [price0, price1, position])

  const addTransaction = useTransactionAdder()

  const positionManager = useV3NFTPositionManagerContract()
  const masterchefV3 = useMasterchefV3()
  const {
    tokenIds: stakedTokenIds,
    loading: tokenIdsInMCv3Loading,
    refetchAll,
  } = useV3TokenIdsByAccount(MASTERCHEFV3_ADDRESS, account)

  const isStakedInMCv3 = !!tokenId && Boolean(stakedTokenIds.find((id) => id === tokenId))

  const manager = isStakedInMCv3 ? masterchefV3 : positionManager
  const interfaceManager = isStakedInMCv3 ? MasterChefV3 : NonfungiblePositionManager

  const collect = useCallback(() => {
    if (
      tokenIdsInMCv3Loading ||
      !currency0ForFeeCollectionPurposes ||
      !currency1ForFeeCollectionPurposes ||
      !chainId ||
      !manager ||
      !account ||
      !tokenId
    )
      return

    setCollecting(true)

    // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
    // vast majority of cases
    const { calldata, value } = interfaceManager.collectCallParameters({
      tokenId: tokenId.toString(),
      expectedCurrencyOwed0: feeValue0 ?? CurrencyAmount.fromRawAmount(currency0ForFeeCollectionPurposes, 0),
      expectedCurrencyOwed1: feeValue1 ?? CurrencyAmount.fromRawAmount(currency1ForFeeCollectionPurposes, 0),
      recipient: account,
    })

    const txn = {
      to: manager.address,
      data: calldata,
      value: hexToBigInt(value),
      account,
      chain: signer?.chain,
    }

    getViemClients({ chainId })
      ?.estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gas: calculateGasMargin(estimate),
        }

        return sendTransactionAsync(newTxn).then((response) => {
          setCollectMigrationHash(response.hash)
          setCollecting(false)

          const amount0 = feeValue0 ?? CurrencyAmount.fromRawAmount(currency0ForFeeCollectionPurposes, 0)
          const amount1 = feeValue1 ?? CurrencyAmount.fromRawAmount(currency1ForFeeCollectionPurposes, 0)

          addTransaction(
            { hash: response.hash },
            {
              type: 'collect-fee',
              summary: `Collect fee ${amount0.toExact()} ${
                currency0ForFeeCollectionPurposes.symbol
              } and ${amount1.toExact()} ${currency1ForFeeCollectionPurposes.symbol}`,
            },
          )
        })
      })
      ?.catch((error) => {
        if (isUserRejected(error)) {
          setErrorMessage(t('Transaction rejected'))
        } else {
          setErrorMessage(transactionErrorToUserReadableMessage(error, t))
        }
        setCollecting(false)
        console.error(error)
      })
  }, [
    tokenIdsInMCv3Loading,
    currency0ForFeeCollectionPurposes,
    currency1ForFeeCollectionPurposes,
    chainId,
    manager,
    account,
    tokenId,
    interfaceManager,
    feeValue0,
    feeValue1,
    signer,
    sendTransactionAsync,
    addTransaction,
    t,
  ])

  const owner = useSingleCallResult({
    contract: tokenId && positionManager ? positionManager : undefined,
    functionName: 'ownerOf',
    args: useMemo(() => [tokenId] as [bigint], [tokenId]),
  }).result
  const ownsNFT =
    owner?.toLowerCase() === account?.toLowerCase() ||
    positionDetails?.operator?.toLowerCase() === account?.toLowerCase()

  const feeValueUpper = inverted ? feeValue0 : feeValue1
  const feeValueLower = inverted ? feeValue1 : feeValue0

  const positionValueUpper = inverted ? position?.amount0 : position?.amount1
  const positionValueLower = inverted ? position?.amount1 : position?.amount0
  const priceValueUpper = inverted ? price0 : price1
  const priceValueLower = inverted ? price1 : price0

  // check if price is within range
  const inRange = isPoolTickInRange(pool, tickLower, tickUpper)

  const nativeCurrency = useNativeCurrency()
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  const showCollectAsWNative = Boolean(
    ownsNFT &&
      (feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0)) &&
      currency0 &&
      currency1 &&
      (currency0.isNative || currency1.isNative) &&
      !collectMigrationHash,
  )

  const isLoading = loading || poolState === PoolState.LOADING || poolState === PoolState.INVALID || !feeAmount
  const isOwnNFT = isStakedInMCv3 || ownsNFT

  // const { hasMerkl } = useMerklInfo(poolAddress)

  const buttons = useMemo(
    () =>
      currency0 && currency1 ? (
        <div className="flex items-center space-x-2 mt-2">
          <NextLinkFromReactRouter
            to={`/increase/${currencyId(currency0)}/${currencyId(currency1)}/${feeAmount}/${tokenId}`}
          >
            <ButtonV2 disabled={!isOwnNFT} variant="primary" onClick={() => {}}>
              {t('Add')}
            </ButtonV2>
          </NextLinkFromReactRouter>

          {!removed && (
            <NextLinkFromReactRouter to={`/remove/${tokenId}`}>
              <ButtonV2 disabled={!isOwnNFT} variant="subtle" onClick={() => {}}>
                {t('Remove')}
              </ButtonV2>
            </NextLinkFromReactRouter>
          )}
        </div>
      ) : null,
    [currency0, currency1, feeAmount, isOwnNFT, removed, t, tokenId],
  )

  const { farmsWithPositions: farmsV3, updateFarmsV3WithPositionsAndBooster } = useFarmsV3WithPositionsAndBooster()
  const farmsLP = useMemo(() => farmsV3.map((f) => ({ ...f, version: 3 } as V3FarmWithoutStakedValue)), [farmsV3])
  const farm = useMemo(
    () => farmsLP.find((f) => f.lpAddress.toLowerCase() === poolAddress?.toLowerCase()),
    [farmsLP, poolAddress],
  )

  const { mutate: updateIsBoostedPool } = useIsBoostedPool(tokenIdStr)
  const { updateUserPositionInfo } = useUserPositionInfo(tokenIdStr)

  const onDone = useCallback(() => {
    updateIsBoostedPool()
    updateUserPositionInfo()
    updateFarmsV3WithPositionsAndBooster()
    refetchAll()
  }, [updateIsBoostedPool, updateUserPositionInfo, updateFarmsV3WithPositionsAndBooster, refetchAll])

  const handleDismissConfirmation = useCallback(() => {
    setErrorMessage(undefined)
    setCollecting(false)
  }, [])

  const [onClaimFee] = useModal(
    <TransactionConfirmationModal
      title={t('Claim fees')}
      attemptingTxn={collecting}
      customOnDismiss={handleDismissConfirmation}
      hash={collectMigrationHash ?? ''}
      errorMessage={errorMessage}
      content={
        <ConfirmationModalContent
          topContent={<ModalHeader feeValueUpper={feeValueUpper} feeValueLower={feeValueLower} locale={locale} />}
          bottomContent={
            <ButtonV2 variant="primary" fullWidth onClick={collect}>
              {t('Claim')}
            </ButtonV2>
          }
        />
      }
      pendingText={t('claim fees')}
      maxWidth="max-w-[400px]"
    />,
    true,
    true,
    'TransactionConfirmationModalCollectFees',
    [collecting, collectMigrationHash, feeValueUpper, feeValueLower, locale],
  )

  if (!isLoading && poolState === PoolState.NOT_EXISTS) {
    return (
      <NotFound LinkComp={Link}>
        <NextSeo title="404" />
      </NotFound>
    )
  }

  return (
    <Page>
      {!isLoading && <NextSeo title={`${currencyQuote?.symbol}-${currencyBase?.symbol} V3 LP #${tokenIdFromUrl}`} />}
      <AppBody maxWidth="max-w-[900px]">
        {isLoading ? (
          <div className="mx-auto h-[450px] flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <AppHeader
              title={
                <div className="flex flex-col items-start space-y-2 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CurrencyLogoWithSymbol
                      currencyA={currencyQuote}
                      currencyB={currencyBase}
                      symbol={`${currencyQuote?.symbol}-${currencyBase?.symbol}`}
                      symbolClassName="text-lg font-bold text-on-surface"
                    />

                    {Boolean(isStakedInMCv3) && <TagV2 color="orange">{t('Boost 🔥')}</TagV2>}
                    <RangeTag removed={removed} outOfRange={!inRange} />
                  </div>

                  <span className="text-sm text-on-surface-subtlest">
                    V3 LP #{tokenIdFromUrl} / {new Percent(feeAmount || 0, 1_000_000).toSignificant()}% {t('fee tier')}
                  </span>
                </div>
              }
              backTo={backTo}
              noConfig
            />

            <div className="p-5 md:p-8">
              {!!tokenId && isOwnNFT && !!farm?.lpAddress && (
                <>
                  <SectionTitle>{t('Boosts')}</SectionTitle>

                  <BoostingCard
                    poolId={farm.lpAddress}
                    positionId={Number(tokenId)}
                    isStaked={isStakedInMCv3}
                    onDone={onDone}
                    className="mb-8 mt-2"
                  />
                </>
              )}

              <div className="grid gap-8 w-full md:grid-flow-col md:grid-cols-2 md:gap-[60px] mt-8">
                <div className="w-full">
                  <SectionTitle>{t('Liquidity')}</SectionTitle>

                  <div className="w-full flex flex-wrap items-center gap-2 justify-between mt-3 border-b border-border pb-2">
                    <span className="font-bold text-on-surface text-xl">
                      $
                      {fiatValueOfLiquidity?.greaterThan(new Fraction(1, 100))
                        ? fiatValueOfLiquidity.toFixed(2, { groupSeparator: ',' })
                        : '-'}
                    </span>
                    <AprCalculator
                      allowApply={false}
                      showQuestion
                      baseCurrency={currencyBase}
                      quoteCurrency={currencyQuote}
                      feeAmount={feeAmount}
                      positionDetails={positionDetails}
                      defaultDepositUsd={fiatValueOfLiquidity?.toFixed(2)}
                      tokenAmount0={inRange ? position?.amount0 : undefined}
                      tokenAmount1={inRange ? position?.amount1 : undefined}
                    />
                  </div>

                  <CurrencyWithValue
                    a={{
                      currency: currencyQuote,
                      symbol: unwrappedToken(positionValueUpper?.currency)?.symbol,
                      amount: positionValueUpper,
                      value:
                        positionValueUpper && priceValueUpper
                          ? `~$${priceValueUpper
                              .quote(positionValueUpper?.wrapped)
                              .toFixed(2, { groupSeparator: ',' })}`
                          : '',
                    }}
                    b={{
                      currency: currencyBase,
                      symbol: unwrappedToken(positionValueLower?.currency)?.symbol,
                      amount: positionValueLower,
                      value:
                        positionValueLower && priceValueLower
                          ? `~$${priceValueLower
                              .quote(positionValueLower?.wrapped)
                              .toFixed(2, { groupSeparator: ',' })}`
                          : '',
                    }}
                  />

                  {buttons}
                </div>

                <div className="w-full">
                  <SectionTitle>{t('Unclaimed Fees')}</SectionTitle>

                  <p className="font-bold text-on-surface text-xl mt-3 border-b border-border pb-2">
                    $
                    {fiatValueOfFees?.greaterThan(new Fraction(1, 100))
                      ? fiatValueOfFees.toFixed(2, { groupSeparator: ',' })
                      : '-'}
                  </p>

                  <CurrencyWithValue
                    a={{
                      currency: feeValueUpper?.currency,
                      symbol: feeValueUpper?.currency?.symbol,
                      amount: feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4, locale) : '-',
                      value:
                        feeValueUpper && priceValueUpper
                          ? `~$${priceValueUpper.quote(feeValueUpper?.wrapped).toFixed(2, { groupSeparator: ',' })}`
                          : '',
                    }}
                    b={{
                      currency: feeValueLower?.currency,
                      symbol: feeValueLower?.currency?.symbol,
                      amount: feeValueLower ? formatCurrencyAmount(feeValueLower, 4, locale) : '-',
                      value:
                        feeValueLower && priceValueLower
                          ? `~$${priceValueLower.quote(feeValueLower?.wrapped).toFixed(2, { groupSeparator: ',' })}`
                          : '',
                    }}
                  />

                  <div className="flex w-full items-center space-x-2 justify-between mt-2">
                    <ButtonV2
                      disabled={
                        !isOwnNFT ||
                        collecting ||
                        isCollectPending ||
                        !(feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) || !!collectMigrationHash)
                      }
                      onClick={onClaimFee}
                      variant="primary"
                    >
                      {!!collectMigrationHash && !isCollectPending
                        ? t('Collected')
                        : isCollectPending || collecting
                        ? t('Collecting...')
                        : t('Collect')}
                    </ButtonV2>

                    {showCollectAsWNative && (
                      <div className="w-full flex items-center space-x-2 justify-end">
                        <span className="text-sm text-on-surface">
                          {t('Collect as')} {nativeWrappedSymbol}
                        </span>

                        <ToggleSwitch
                          activated={receiveWNATIVE}
                          setActivated={() => setReceiveWNATIVE((prevState) => !prevState)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <PositionPriceSection
                manuallyInverted={manuallyInverted}
                setManuallyInverted={setManuallyInverted}
                currencyQuote={currencyQuote}
                currencyBase={currencyBase}
                priceLower={priceLower}
                pool={pool}
                priceUpper={priceUpper}
                tickAtLimit={tickAtLimit}
              />

              {positionDetails && currency0 && currency1 && (
                <PositionHistory
                  tokenId={positionDetails.tokenId.toString()}
                  currency0={currency0}
                  currency1={currency1}
                />
              )}
            </div>
          </>
        )}
      </AppBody>
    </Page>
  )
}

type PositionTX = {
  id: string
  amount0: string
  amount1: string
  timestamp: string
  logIndex: string
}

type PositionHistoryResult = {
  positionSnapshots: {
    id: string
    transaction: {
      mints: PositionTX[]
      burns: PositionTX[]
      collects: PositionTX[]
    }
  }[]
}

const PositionHistory = memo(PositionHistory_)

function PositionHistory_({
  tokenId,
  currency0,
  currency1,
}: {
  tokenId: string
  currency0: Currency
  currency1: Currency
}) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const client = v3Clients[chainId as ChainId]
  const { data, isLoading } = useQuery(
    ['positionHistory', chainId, tokenId],
    async () => {
      const result = await client.request<PositionHistoryResult>(
        gql`
          query positionHistory($tokenId: String!) {
            positionSnapshots(where: { position: $tokenId }, orderBy: timestamp, orderDirection: desc, first: 30) {
              id
              transaction {
                mints(where: { or: [{ amount0_gt: "0" }, { amount1_gt: "0" }] }) {
                  id
                  timestamp
                  amount1
                  amount0
                  logIndex
                }
                burns(where: { or: [{ amount0_gt: "0" }, { amount1_gt: "0" }] }) {
                  id
                  timestamp
                  amount1
                  amount0
                  logIndex
                }
                collects(where: { or: [{ amount0_gt: "0" }, { amount1_gt: "0" }] }) {
                  id
                  timestamp
                  amount0
                  amount1
                  logIndex
                }
              }
            }
          }
        `,
        {
          tokenId,
        },
      )

      return result.positionSnapshots.filter((snapshot) => {
        const { transaction } = snapshot
        return transaction.mints.length > 0 || transaction.burns.length > 0 || transaction.collects.length > 0
      })
    },
    {
      enabled: Boolean(client && tokenId),
      refetchInterval: 30_000,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  )

  if (isLoading || !data?.length) {
    return null
  }

  return (
    <div className="mt-8">
      <SectionTitle>{`${t('History')}(Transaction)`}</SectionTitle>

      <table className="w-full rounded-2xl overflow-hidden mt-3 bg-surface-overlay">
        <thead>
          <tr className="text-sm text-on-surface-subtlest bg-neutral border-b border-border h-10">
            <th className="text-left px-4 font-normal">{t('Timestamp')}</th>
            <th className="text-left px-3 font-normal">{t('Action')}</th>
            <th className="text-left px-3 font-normal">{t('Token Transferred')}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((d) => {
            return (
              <Fragment key={d.id}>
                {d.transaction.mints.map((positionTx) => (
                  <PositionHistoryRow
                    positionTx={positionTx}
                    key={positionTx.id}
                    type="mint"
                    currency0={currency0}
                    currency1={currency1}
                  />
                ))}
                {d.transaction.collects
                  .map((collectTx) => {
                    const foundSameTxBurn = d.transaction.burns.find(
                      (burnTx) =>
                        +collectTx.amount0 >= +burnTx.amount0 &&
                        +collectTx.amount1 >= +burnTx.amount1 &&
                        +burnTx.logIndex < +collectTx.logIndex,
                    )
                    if (foundSameTxBurn) {
                      if (
                        foundSameTxBurn.amount0 === collectTx.amount0 &&
                        foundSameTxBurn.amount1 === collectTx.amount1
                      ) {
                        return null
                      }
                      return {
                        ...collectTx,
                        amount0: String(+collectTx.amount0 - +foundSameTxBurn.amount0),
                        amount1: String(+collectTx.amount1 - +foundSameTxBurn.amount1),
                      }
                    }
                    return collectTx
                  })
                  .filter(Boolean)
                  .map((positionTx) => (
                    <PositionHistoryRow
                      positionTx={positionTx as PositionTX}
                      key={positionTx?.id}
                      type="collect"
                      currency0={currency0}
                      currency1={currency1}
                    />
                  ))}
                {d.transaction.burns.map((positionTx) => (
                  <PositionHistoryRow
                    positionTx={positionTx}
                    key={positionTx.id}
                    type="burn"
                    currency0={currency0}
                    currency1={currency1}
                  />
                ))}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

type PositionHistoryType = 'mint' | 'burn' | 'collect'
const positionHistoryTypeText = {
  mint: <Trans>Add Liquidity</Trans>,
  burn: <Trans>Remove Liquidity</Trans>,
  collect: <Trans>Collect fee</Trans>,
} satisfies Record<PositionHistoryType, ReactNode>

function PositionHistoryRow({
  positionTx,
  type,
  currency0,
  currency1,
}: {
  positionTx: PositionTX
  type: PositionHistoryType
  currency0: Currency
  currency1: Currency
}) {
  const { isMobile } = useMatchBreakpoints()

  const isPlus = type !== 'burn'

  const date = useMemo(() => dayjs.unix(+positionTx.timestamp), [positionTx.timestamp])
  const mobileDate = useMemo(() => isMobile && date.format('YYYY/MM/DD'), [isMobile, date])
  const mobileTime = useMemo(() => isMobile && date.format('HH:mm:ss'), [isMobile, date])
  const desktopDate = useMemo(() => !isMobile && date.toDate().toLocaleString(), [isMobile, date])

  const position0AmountString = useMemo(() => {
    const amount0Number = +positionTx.amount0
    if (amount0Number > 0) {
      return amount0Number.toLocaleString(undefined, {
        maximumFractionDigits: 6,
        maximumSignificantDigits: 6,
      })
    }
    return null
  }, [positionTx.amount0])

  const position1AmountString = useMemo(() => {
    const amount1Number = +positionTx.amount1
    if (amount1Number > 0) {
      return amount1Number.toLocaleString(undefined, {
        maximumFractionDigits: 6,
        maximumSignificantDigits: 6,
      })
    }
    return null
  }, [positionTx.amount1])

  if (isMobile) {
    return (
      <tr className="border-b border-border">
        <td className="p-3">
          <ExternalLink
            href={getBlockExploreLink(positionTx.id.split('#')[0], 'transaction')}
            className="text-on-surface col-span-1"
          >
            {mobileDate} {mobileTime}
          </ExternalLink>
        </td>

        <td className="p-3">
          <span className="text-sm text-on-surface col-span-1">{positionHistoryTypeText[type]}</span>
        </td>
        <td className="p-3">
          <div className="flex flex-col items-end space-y-1.5 col-span-2">
            {+positionTx.amount0 > 0 && (
              <div className="flex items-center space-x-1 text-sm text-on-surface">
                <span>
                  {isPlus ? '+' : '-'}{' '}
                  {position0AmountString
                    ? Number(position0AmountString).toLocaleString(undefined, {
                        maximumFractionDigits: 3,
                        maximumSignificantDigits: 3,
                      })
                    : '-'}
                </span>
                <CurrencyLogo currency={currency0} />
              </div>
            )}
            {+positionTx.amount1 > 0 && (
              <div className="flex items-center space-x-1 text-sm text-on-surface">
                <span>
                  {isPlus ? '+' : '-'}{' '}
                  {position1AmountString
                    ? Number(position1AmountString).toLocaleString(undefined, {
                        maximumFractionDigits: 3,
                        maximumSignificantDigits: 3,
                      })
                    : '-'}
                </span>
                <CurrencyLogo currency={currency1} />
              </div>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-border">
      <td className="p-3">
        <ExternalLink
          href={getBlockExploreLink(positionTx.id.split('#')[0], 'transaction')}
          className="text-on-surface"
        >
          {desktopDate}
        </ExternalLink>
      </td>
      <td className="p-3">
        <span className="text-sm text-on-surface">{positionHistoryTypeText[type]}</span>
      </td>
      <td className="p-3">
        <div className="flex flex-col items-start space-y-1.5">
          {+positionTx.amount0 > 0 && (
            <div className="flex items-center space-x-1 text-sm text-on-surface">
              <span>
                {isPlus ? '+' : '-'} {position0AmountString}
              </span>

              <CurrencyLogoWithSymbol currencyA={currency0} symbol={currency0.symbol} />
            </div>
          )}
          {+positionTx.amount1 > 0 && (
            <div className="flex items-center space-x-1 text-sm text-on-surface">
              <span>
                {isPlus ? '+' : '-'} {position1AmountString}
              </span>

              <CurrencyLogoWithSymbol currencyA={currency1} symbol={currency1.symbol} />
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

export function SectionTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h3 className={clsx('text-xs text-on-surface-brand', className)}>{children}</h3>
}

type CurrencyWithValueProps = {
  currency: Currency | undefined
  symbol?: string
  amount?: CurrencyAmount<Token> | string
  value: string
}

function CurrencyWithValue({ a, b }: { a: CurrencyWithValueProps; b: CurrencyWithValueProps }) {
  return (
    <>
      <CurrencyLogoWithAmount
        className="py-2 border-b border-border"
        currencyA={a.currency}
        symbol={a.symbol}
        amount={typeof a.amount === 'string' ? a.amount : <FormattedCurrencyAmount currencyAmount={a.amount} />}
        value={a.value || '0'}
      />
      <CurrencyLogoWithAmount
        className="py-2 border-b border-border"
        currencyA={b.currency}
        symbol={b.symbol}
        amount={typeof b.amount === 'string' ? b.amount : <FormattedCurrencyAmount currencyAmount={b.amount} />}
        value={b.value || '0'}
      />
    </>
  )
}

function ModalHeader({
  feeValueUpper,
  feeValueLower,
  locale,
}: {
  feeValueUpper?: CurrencyAmount<Currency> | null
  feeValueLower?: CurrencyAmount<Currency> | null
  locale: string
}) {
  const { t } = useTranslation()

  return (
    <>
      <ContainerV2>
        <CurrencyLogoWithAmount
          className="pb-2 border-b border-border"
          currencyA={feeValueUpper?.currency}
          symbol={feeValueUpper?.currency?.symbol}
          amount={feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4, locale) : '-'}
        />

        <CurrencyLogoWithAmount
          className="pt-2"
          currencyA={feeValueLower?.currency}
          symbol={feeValueLower?.currency?.symbol}
          amount={feeValueLower ? formatCurrencyAmount(feeValueLower, 4, locale) : '-'}
        />
      </ContainerV2>

      <p className="my-4 text-sm text-on-surface text-center">
        {t('Collecting fees will withdraw currently available fees for you')}
      </p>
    </>
  )
}

export const getStaticPaths = ({ locales }) => {
  return {
    // any tokenId for server-side rendering
    paths: locales?.map((locale) => ({ params: { tokenId: '1', locale } })) || [],
    fallback: 'blocking',
  }
}

export const getStaticProps = async ({ params, locale }: { params: any; locale: Locale }) => {
  const tokenId = params?.tokenId

  const isNumberReg = /^\d+$/

  if (tokenId && !(tokenId as string)?.match(isNumberReg)) {
    return {
      redirect: {
        statusCode: 303,
        destination: `/add`,
      },
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LANGUAGE, ['common'])),
    },
  }
}
