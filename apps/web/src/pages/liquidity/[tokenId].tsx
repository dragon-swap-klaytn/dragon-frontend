/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ChainId } from '@pancakeswap/chains'
import { isActiveV3Farm } from '@pancakeswap/farms'
import { Currency, CurrencyAmount, Fraction, Percent, Price, Token } from '@pancakeswap/sdk'
import {
  AtomBox,
  ButtonV2,
  Container,
  CurrencyLogoWithAmount,
  CurrencyLogoWithSymbol,
  ExpandableLabel,
  Flex,
  NotFound,
  Spinner,
  useMatchBreakpoints,
  useModal,
} from '@pancakeswap/uikit'

import { ConfirmationModalContent, NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

import { MasterChefV3, NonfungiblePositionManager, Pool, Position, isPoolTickInRange } from '@pancakeswap/v3-sdk'
import { AppBody, AppHeader } from 'components/App'
import { useToken } from 'hooks/Tokens'
import { useStablecoinPrice } from 'hooks/useBUSDPrice'
import { useMasterchefV3, useV3NFTPositionManagerContract } from 'hooks/useContract'
import { useFarm } from 'hooks/useFarm'
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit'
import { usePool } from 'hooks/v3/usePools'
import { NextSeo } from 'next-seo'
// import { usePositionTokenURI } from 'hooks/v3/usePositionTokenURI'
import { Trans, useTranslation } from '@pancakeswap/localization'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/Logo'
import { RangePriceSection } from 'components/RangePriceSection'
import { RangeTag } from 'components/RangeTag'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { Bound } from 'config/constants/types'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { PoolState } from 'hooks/v3/types'
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees'
import { useV3PositionFromTokenId, useV3TokenIdsByAccount } from 'hooks/v3/useV3Positions'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import getPriceOrderingFromPositionForUI from 'hooks/v3/utils/getPriceOrderingFromPositionForUI'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { PropsWithChildren, ReactNode, memo, useCallback, useMemo, useState } from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin, getBlockExploreLink } from 'utils'
import { formatCurrencyAmount, formatPrice } from 'utils/formatCurrencyAmount'
import { v3Clients } from 'utils/graphql'
import { getViemClients } from 'utils/viem'
import { CHAIN_IDS } from 'utils/wagmi'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { hexToBigInt } from 'viem'
import { AprCalculator } from 'views/AddLiquidityV3/components/AprCalculator'
import RateToggle from 'views/AddLiquidityV3/formViews/V3FormView/components/RateToggle'
import Page from 'views/Page'
import { useSendTransaction, useWalletClient } from 'wagmi'
/*
import { MerklSection } from 'components/Merkl/MerklSection'
import { MerklTag } from 'components/Merkl/MerklTag'
import { useMerklInfo } from 'hooks/useMerkl'
*/
import { CAKE_SYMBOL_VIEW } from '@pancakeswap/tokens'
import { ArrowsClockwise } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import Chip from 'components/Common/Chip'
import ExternalLink from 'components/Common/ExternalLink'
import Notification from 'components/Common/Notification'
import ToggleSwitch from 'components/Common/ToggleSwitch'
import Link from 'next/link'
import currencyId from 'utils/currencyId'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'

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
  isMobile,
  priceLower,
  inverted,
  pool,
  tickAtLimit,
  setManuallyInverted,
  manuallyInverted,
}) {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  return (
    <>
      <div className="flex items-center space-x-2 w-full justify-between mt-4">
        <SectionTitle>{t('Price Range')}</SectionTitle>

        {currencyBase && currencyQuote && (
          <RateToggle currencyA={currencyBase} handleRateToggle={() => setManuallyInverted(!manuallyInverted)} />
        )}
      </div>

      <div className="flex flex-col items-center w-full space-y-4 mt-2">
        <div className="flex items-center space-x-2 w-full">
          <RangePriceSection
            title={t('Min Price')}
            price={formatTickPrice(priceLower, tickAtLimit, Bound.LOWER, locale)}
            currency0={currencyQuote}
            currency1={currencyBase}
          />

          {isMobile ? null : <ArrowsClockwise size={24} className="text-on-surface-tertiary shrink-0" />}

          <RangePriceSection
            title={t('Max Price')}
            price={formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER, locale)}
            currency0={currencyQuote}
            currency1={currencyBase}
          />
        </div>

        {pool && currencyQuote && currencyBase ? (
          <RangePriceSection
            title={t('Current Price')}
            currency0={currencyQuote}
            currency1={currencyBase}
            price={formatPrice(inverted ? pool.token1Price : pool.token0Price, 6, locale)}
          />
        ) : null}
      </div>
    </>
  )
}

export default function PoolPage() {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

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

  const removed = liquidity === 0n

  // const metadata = usePositionTokenURI(parsedTokenId)

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)
  const { data: farmDetail } = useFarm({ currencyA: token0, currencyB: token1, feeAmount })
  const hasActiveFarm = useMemo(
    () => farmDetail && isActiveV3Farm(farmDetail.farm, farmDetail.poolLength),
    [farmDetail],
  )

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

  // const ratio = useMemo(() => {
  //   return priceLower && pool && priceUpper
  //     ? getRatio(
  //         inverted ? priceUpper.invert() : priceLower,
  //         pool.token0Price,
  //         inverted ? priceLower.invert() : priceUpper,
  //       )
  //     : undefined
  // }, [inverted, pool, priceLower, priceUpper])

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
  const price0 = useStablecoinPrice(token0 ?? undefined, { enabled: !!feeValue0 })
  const price1 = useStablecoinPrice(token1 ?? undefined, { enabled: !!feeValue1 })

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
  const { tokenIds: stakedTokenIds, loading: tokenIdsInMCv3Loading } = useV3TokenIdsByAccount(
    masterchefV3?.address,
    account,
  )

  const isStakedInMCv3 = tokenId && Boolean(stakedTokenIds.find((id) => id === tokenId))

  const manager = isStakedInMCv3 ? masterchefV3 : positionManager
  const interfaceManager = isStakedInMCv3 ? MasterChefV3 : NonfungiblePositionManager

  const handleDismissConfirmation = useCallback(() => {
    setErrorMessage(undefined)
  }, [])

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

  const modalHeader = () => (
    <>
      <Container>
        <CurrencyLogoWithAmount
          currencyA={feeValueUpper?.currency}
          symbol={feeValueUpper?.currency?.symbol}
          amount={feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4, locale) : '-'}
        />

        <CurrencyLogoWithAmount
          currencyA={feeValueLower?.currency}
          symbol={feeValueLower?.currency?.symbol}
          amount={feeValueLower ? formatCurrencyAmount(feeValueLower, 4, locale) : '-'}
        />
      </Container>
      <p className="my-4 text-sm text-on-surface-primary">
        {t('Collecting fees will withdraw currently available fees for you')}
      </p>
    </>
  )

  const [onClaimFee] = useModal(
    <TransactionConfirmationModal
      title={t('Claim fees')}
      attemptingTxn={collecting}
      customOnDismiss={handleDismissConfirmation}
      hash={collectMigrationHash ?? ''}
      errorMessage={errorMessage}
      content={() => (
        <ConfirmationModalContent
          topContent={modalHeader}
          bottomContent={() => (
            <ButtonV2 variant="primary" fullWidth onClick={collect}>
              {t('Collect')}
            </ButtonV2>
          )}
        />
      )}
      pendingText={t('Collecting fees')}
    />,
    true,
    true,
    'TransactionConfirmationModalCollectFees',
  )

  const isLoading = loading || poolState === PoolState.LOADING || poolState === PoolState.INVALID || !feeAmount

  const { isMobile } = useMatchBreakpoints()

  const isOwnNFT = isStakedInMCv3 || ownsNFT

  // const { hasMerkl } = useMerklInfo(poolAddress)

  const buttons = useMemo(
    () =>
      currency0 && currency1 ? (
        <div
          className={clsx({
            'flex items-center space-x-2': !isMobile,
            'w-full flex flex-col items-center space-y-2': isMobile,
          })}
        >
          <NextLinkFromReactRouter
            to={`/increase/${currencyId(currency0)}/${currencyId(currency1)}/${feeAmount}/${tokenId}`}
            className={isMobile ? 'w-full' : ''}
          >
            <ButtonV2 disabled={!isOwnNFT} fullWidth={isMobile} variant="primary" onClick={() => {}} scale="sm">
              {t('Add')}
            </ButtonV2>
          </NextLinkFromReactRouter>

          {!removed && (
            <NextLinkFromReactRouter to={`/remove/${tokenId}`} className={isMobile ? 'w-full' : ''}>
              <ButtonV2 disabled={!isOwnNFT} fullWidth={isMobile} variant="subtle" onClick={() => {}} scale="sm">
                {t('Remove')}
              </ButtonV2>
            </NextLinkFromReactRouter>
          )}
        </div>
      ) : null,
    [currency0, currency1, feeAmount, isOwnNFT, removed, t, tokenId, isMobile],
  )

  if (!isLoading && poolState === PoolState.NOT_EXISTS) {
    return (
      <NotFound LinkComp={Link}>
        <NextSeo title="404" />
      </NotFound>
    )
  }

  const farmingTips =
    inRange && ownsNFT && hasActiveFarm && !isStakedInMCv3 ? (
      <Notification
        variant="info"
        className={clsx('mb-4', {
          'mt-2': isMobile,
        })}
      >
        <p>
          <b>{`${currencyQuote?.symbol}-${currencyBase?.symbol}`}</b>&nbsp;
          {t(
            'has an active DragonSwap farm. Stake your position in the farm to start earning with the indicated APR with %cake% farming.',
            {
              cake: CAKE_SYMBOL_VIEW,
            },
          )}
        </p>
        <NextLinkFromReactRouter to="/farms" className="underline underline-offset-2 hover:opacity-70">
          {t('Go to Farms')} {' >>'}
        </NextLinkFromReactRouter>
      </Notification>
    ) : null

  return (
    <Page>
      {!isLoading && <NextSeo title={`${currencyQuote?.symbol}-${currencyBase?.symbol} V3 LP #${tokenIdFromUrl}`} />}
      <AppBody maxWidth="max-w-2xl">
        {isLoading ? (
          <Flex width="100%" justifyContent="center" alignItems="center" minHeight="200px" mb="32px">
            <Spinner />
          </Flex>
        ) : (
          <div className="bg-surface-container">
            <AppHeader
              title={
                <div className="flex flex-col items-start space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <DoubleCurrencyLogo size={24} currency0={currencyQuote} currency1={currencyBase} />
                      <h2 className="text-lg font-bold text-on-surface-primary">
                        {currencyQuote?.symbol}-{currencyBase?.symbol}
                      </h2>
                    </div>

                    {Boolean(isStakedInMCv3) && <Chip color="orange">{t('Farming')}</Chip>}
                    <RangeTag removed={removed} outOfRange={!inRange} />
                  </div>

                  <span className="text-sm text-on-surface-secondary">
                    V3 LP #{tokenIdFromUrl} / {new Percent(feeAmount || 0, 1_000_000).toSignificant()}% {t('fee tier')}
                  </span>
                </div>
              }
              backTo="/liquidity"
              noConfig
              buttons={!isMobile && Boolean(currency0) && Boolean(currency1) && buttons}
            />

            <div className="p-4">
              {isMobile && buttons}
              {farmingTips}

              <div className="grid md:grid-cols-2 gap-4 w-full">
                <div className="w-full">
                  <div className="w-full flex items-center space-x-2 justify-between">
                    <SectionTitle>{t('Liquidity')}</SectionTitle>

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

                  <p className="font-bold mb-2 text-on-surface-primary text-2xl">
                    $
                    {fiatValueOfLiquidity?.greaterThan(new Fraction(1, 100))
                      ? fiatValueOfLiquidity.toFixed(2, { groupSeparator: ',' })
                      : '-'}
                  </p>

                  <CurrencyWithBalance
                    a={{
                      currency: currencyQuote,
                      symbol: unwrappedToken(positionValueUpper?.currency)?.symbol,
                      amount: positionValueUpper,
                      balance:
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
                      balance:
                        positionValueLower && priceValueLower
                          ? `~$${priceValueLower
                              .quote(positionValueLower?.wrapped)
                              .toFixed(2, { groupSeparator: ',' })}`
                          : '',
                    }}
                  />
                </div>

                <div className="w-full">
                  <SectionTitle>{t('Unclaimed Fees')}</SectionTitle>

                  <div className="flex items-center space-x-2 w-full justify-between mb-2">
                    <p className="font-bold text-on-surface-primary text-2xl">
                      $
                      {fiatValueOfFees?.greaterThan(new Fraction(1, 100))
                        ? fiatValueOfFees.toFixed(2, { groupSeparator: ',' })
                        : '-'}
                    </p>

                    <ButtonV2
                      scale="sm"
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
                  </div>

                  <CurrencyWithBalance
                    a={{
                      currency: feeValueUpper?.currency,
                      symbol: feeValueUpper?.currency?.symbol,
                      amount: feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4, locale) : '-',
                      balance:
                        feeValueUpper && priceValueUpper
                          ? `~$${priceValueUpper.quote(feeValueUpper?.wrapped).toFixed(2, { groupSeparator: ',' })}`
                          : '',
                    }}
                    b={{
                      currency: feeValueLower?.currency,
                      symbol: feeValueLower?.currency?.symbol,
                      amount: feeValueLower ? formatCurrencyAmount(feeValueLower, 4, locale) : '-',
                      balance:
                        feeValueLower && priceValueLower
                          ? `~$${priceValueLower.quote(feeValueLower?.wrapped).toFixed(2, { groupSeparator: ',' })}`
                          : '',
                    }}
                  />
                </div>
              </div>

              {showCollectAsWNative && (
                <div className="w-full flex items-center space-x-2 justify-end mt-1">
                  <span className="text-sm text-on-surface-primary">
                    {t('Collect as')} {nativeWrappedSymbol}
                  </span>

                  <ToggleSwitch
                    activated={receiveWNATIVE}
                    setActivated={() => setReceiveWNATIVE((prevState) => !prevState)}
                  />
                </div>
              )}

              <PositionPriceSection
                manuallyInverted={manuallyInverted}
                setManuallyInverted={setManuallyInverted}
                currencyQuote={currencyQuote}
                currencyBase={currencyBase}
                isMobile={isMobile}
                priceLower={priceLower}
                inverted={inverted}
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
          </div>
        )}
      </AppBody>
    </Page>
  )
}

PoolPage.chains = CHAIN_IDS

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
  const [isExpanded, setIsExpanded] = useState(false)
  const { chainId } = useActiveChainId()
  const { isMobile } = useMatchBreakpoints()
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
    <AtomBox textAlign="center" pt="16px">
      <ExpandableLabel
        expanded={isExpanded}
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
      >
        {isExpanded ? t('Hide') : t('History')}
      </ExpandableLabel>

      {isExpanded && (
        <div className="flex flex-col mt-6 space-y-4">
          <div
            className={clsx('grid text-center border-b pb-4 border-gray-400', {
              'grid-cols-4 gap-2': isMobile,
              'grid-cols-3': !isMobile,
            })}
          >
            <SectionTitle className="col-span-1">{t('Timestamp')}</SectionTitle>
            <SectionTitle className="col-span-1">{t('Action')}</SectionTitle>
            <SectionTitle
              className={clsx({
                'col-span-2': isMobile,
                'col-span-1': !isMobile,
              })}
            >
              {t('Token Transferred')}
            </SectionTitle>
          </div>

          {data.map((d) => {
            return (
              <div key={d.id} className="flex flex-col w-full space-y-3">
                {d.transaction.mints.map((positionTx) => (
                  <PositionHistoryRow
                    chainId={chainId}
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
                      chainId={chainId}
                      positionTx={positionTx as PositionTX}
                      key={positionTx?.id}
                      type="collect"
                      currency0={currency0}
                      currency1={currency1}
                    />
                  ))}
                {d.transaction.burns.map((positionTx) => (
                  <PositionHistoryRow
                    chainId={chainId}
                    positionTx={positionTx}
                    key={positionTx.id}
                    type="burn"
                    currency0={currency0}
                    currency1={currency1}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </AtomBox>
  )
}

type PositionHistoryType = 'mint' | 'burn' | 'collect'
const positionHistoryTypeText = {
  mint: <Trans>Add Liquidity</Trans>,
  burn: <Trans>Remove Liquidity</Trans>,
  collect: <Trans>Collect fee</Trans>,
} satisfies Record<PositionHistoryType, ReactNode>

function PositionHistoryRow({
  chainId,
  positionTx,
  type,
  currency0,
  currency1,
}: {
  chainId?: ChainId
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
      <div className="grid grid-cols-4 gap-2 text-center items-center border-b border-dashed border-gray-600 pb-3">
        <ExternalLink
          href={getBlockExploreLink(positionTx.id.split('#')[0], 'transaction', chainId)}
          className="text-on-surface-primary col-span-1"
        >
          {mobileDate} {mobileTime}
        </ExternalLink>
        <span className="text-sm text-on-surface-primary col-span-1">{positionHistoryTypeText[type]}</span>
        <div className="flex flex-col items-end space-y-1 col-span-2">
          {+positionTx.amount0 > 0 && (
            <div className="flex items-center space-x-1.5 text-sm text-on-surface-primary">
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
            <div className="flex items-center space-x-1.5 text-sm text-on-surface-primary">
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
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 text-center items-center border-b border-dashed border-gray-600 pb-3">
      <ExternalLink
        href={getBlockExploreLink(positionTx.id.split('#')[0], 'transaction', chainId)}
        className="text-on-surface-primary"
      >
        {desktopDate}
      </ExternalLink>
      <span className="text-sm text-on-surface-primary">{positionHistoryTypeText[type]}</span>
      <div className="flex flex-col items-end space-y-1">
        {+positionTx.amount0 > 0 && (
          <div className="flex items-center space-x-2.5 text-sm text-on-surface-primary">
            <span>
              {isPlus ? '+' : '-'} {position0AmountString}
            </span>

            <CurrencyLogoWithSymbol currencyA={currency0} symbol={currency0.symbol} />
          </div>
        )}
        {+positionTx.amount1 > 0 && (
          <div className="flex items-center space-x-2.5 text-sm text-on-surface-primary">
            <span>
              {isPlus ? '+' : '-'} {position1AmountString}
            </span>

            <CurrencyLogoWithSymbol currencyA={currency1} symbol={currency1.symbol} />
          </div>
        )}
      </div>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
    props: {},
  }
}

export function SectionTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h3 className={clsx('text-xs text-surface-orange', className)}>{children}</h3>
}

type CurrencyWithBalanceProps = {
  currency: Currency | undefined
  symbol?: string
  amount?: CurrencyAmount<Token> | string
  balance: string
}

function CurrencyWithBalance({ a, b }: { a: CurrencyWithBalanceProps; b: CurrencyWithBalanceProps }) {
  return (
    <Container>
      <CurrencyLogoWithAmount
        currencyA={a.currency}
        symbol={a.symbol}
        amount={typeof a.amount === 'string' ? a.amount : <FormattedCurrencyAmount currencyAmount={a.amount} />}
        value={a.balance}
      />
      <CurrencyLogoWithAmount
        currencyA={b.currency}
        symbol={b.symbol}
        amount={typeof b.amount === 'string' ? b.amount : <FormattedCurrencyAmount currencyAmount={b.amount} />}
        value={b.balance}
      />
    </Container>
  )
}
