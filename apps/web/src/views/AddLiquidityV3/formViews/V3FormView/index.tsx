import { CommonBasesType } from 'components/SearchModal/types'

import { Currency, CurrencyAmount, Percent } from '@pancakeswap/sdk'
import { AutoColumn, ButtonV2, Notification, NumberFormat, useModal } from '@pancakeswap/uikit'
import {
  ConfirmationModalContent,
  LiquidityChartRangeInput,
  ZOOM_LEVELS,
  ZoomLevels,
} from '@pancakeswap/widgets-internal'

import { tryParsePrice } from 'hooks/v3/utils'
import { logGTMClickAddLiquidityEvent } from 'utils/customGTMEventTracking'

import { useIsExpertMode, useUserSlippage } from '@pancakeswap/utils/user'
import { FeeAmount, NonfungiblePositionManager } from '@pancakeswap/v3-sdk'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import useV3DerivedInfo from 'hooks/v3/useV3DerivedInfo'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { Field } from 'state/mint/actions'
import { basisPointsToPercent } from 'utils/exchange'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { useTranslation } from '@pancakeswap/localization'
import { Plus } from '@phosphor-icons/react'
import { CurrencySelect } from 'components/CurrencySelect'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { Bound } from 'config/constants/types'
import { useIsTransactionUnsupported, useIsTransactionWarning } from 'hooks/Trades'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useV3NFTPositionManagerContract } from 'hooks/useContract'
import { useRouter } from 'next/router'
import { useTransactionAdder } from 'state/transactions/hooks'
import { styled } from 'styled-components'
import { calculateGasMargin } from 'utils'
import { formatCurrencyAmount, formatRawAmount } from 'utils/formatCurrencyAmount'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { getViemClients } from 'utils/viem'
import { hexToBigInt } from 'viem'
import { DynamicSection, SectionTitle } from 'views/AddLiquidityV3'
import { V3SubmitButton } from 'views/AddLiquidityV3/components/V3SubmitButton'
import FeeSelector from 'views/AddLiquidityV3/formViews/V3FormView/components/FeeSelector'
import { useDensityChartData } from 'views/AddLiquidityV3/hooks/useDensityChartData'
import { HandleFeePoolSelectFn, QUICK_ACTION_CONFIGS } from 'views/AddLiquidityV3/types'
import { useSendTransaction, useWalletClient } from 'wagmi'
import LockedDeposit from './components/LockedDeposit'
import { PositionPreview } from './components/PositionPreview'
import RangeSelector from './components/RangeSelector'
import RateToggle from './components/RateToggle'
import { useInitialRange } from './form/hooks/useInitialRange'
import { useRangeHopCallbacks } from './form/hooks/useRangeHopCallbacks'
import { useV3MintActionHandlers } from './form/hooks/useV3MintActionHandlers'
import { useV3FormAddLiquidityCallback, useV3FormState } from './form/reducer'

export const HideMedium = styled.div`
  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`

export const MediumOnly = styled.div`
  display: none;
  ${({ theme }) => theme.mediaQueries.md} {
    display: initial;
  }
`

export const RightContainer = styled(AutoColumn)`
  height: fit-content;

  grid-row: 2 / 3;
  grid-column: 1;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-row: 1 / 3;
    grid-column: 2;
  }
`

interface V3FormViewPropsType {
  baseCurrency?: Currency
  quoteCurrency?: Currency
  currencyIdA: string
  currencyIdB: string
  feeAmount?: number
  handleCurrencyASelect: (currencyANew: Currency) => void
  handleCurrencyBSelect: (currencyBNew: Currency) => void
  handleFeePoolSelect: HandleFeePoolSelectFn
  handleSelectV2: () => void
}

export default function V3FormView({
  feeAmount,
  baseCurrency,
  quoteCurrency,
  currencyIdA,
  currencyIdB,
  handleCurrencyASelect,
  handleCurrencyBSelect,
  handleFeePoolSelect,
  handleSelectV2,
}: V3FormViewPropsType) {
  const router = useRouter()
  const { data: signer } = useWalletClient()
  const { sendTransactionAsync } = useSendTransaction()
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()

  const {
    t,
    i18n: { language: locale },
  } = useTranslation()
  const expertMode = useIsExpertMode()

  const positionManager = useV3NFTPositionManagerContract()
  const { account, chainId, isWrongNetwork } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  // mint state
  const formState = useV3FormState()
  const { independentField, typedValue, startPriceTypedValue, leftRangeTypedValue, rightRangeTypedValue } = formState

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
  } = useV3DerivedInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    undefined,
    formState,
  )
  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput, onBothRangeInput } =
    useV3MintActionHandlers(noLiquidity)

  const onBothRangePriceInput = useCallback(
    (leftRangeValue: string, rightRangeValue: string) => {
      onBothRangeInput({
        leftTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue),
        rightTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue),
      })
    },
    [baseCurrency, quoteCurrency, onBothRangeInput],
  )

  const onLeftRangePriceInput = useCallback(
    (leftRangeValue: string) => {
      onLeftRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue))
    },
    [baseCurrency, quoteCurrency, onLeftRangeInput],
  )

  const onRightRangePriceInput = useCallback(
    (rightRangeValue: string) => {
      onRightRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue))
    },
    [baseCurrency, quoteCurrency, onRightRangeInput],
  )

  const isValid = !errorMessage && !invalidRange

  // modal and loading
  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState<boolean>(false)

  useEffect(() => {
    setShowCapitalEfficiencyWarning(false)
  }, [baseCurrency, quoteCurrency, feeAmount])

  useEffect(() => {
    if (feeAmount) {
      setActiveQuickAction(undefined)
      onBothRangeInput({
        leftTypedValue: undefined,
        rightTypedValue: undefined,
      })
    }
    // NOTE: ignore exhaustive-deps to avoid infinite re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeAmount])

  const onAddLiquidityCallback = useV3FormAddLiquidityCallback()

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  const [txHash, setTxHash] = useState<string>('')
  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  //   // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(
    () =>
      [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxAmountSpend(currencyBalances[field]),
        }
      }, {}),
    [currencyBalances],
  )

  const nftPositionManagerAddress = useV3NFTPositionManagerContract()?.address
  // check whether the user has approved the router on the tokens
  const { approvalState: approvalA, approveCallback: approveACallback } = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    nftPositionManagerAddress,
  )
  const { approvalState: approvalB, approveCallback: approveBCallback } = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    nftPositionManagerAddress,
  )

  const [allowedSlippage] = useUserSlippage() // custom from users

  const onAdd = useCallback(async () => {
    if (!chainId || !signer || !account || !nftPositionManagerAddress) return

    if (!positionManager || !baseCurrency || !quoteCurrency) {
      return
    }

    if (position && account && deadline) {
      const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined

      const { calldata, value } = NonfungiblePositionManager.addCallParameters(position, {
        slippageTolerance: basisPointsToPercent(allowedSlippage),
        recipient: account,
        deadline: deadline.toString(),
        useNative,
        createPool: noLiquidity,
      })

      setAttemptingTxn(true)
      const txn = {
        data: calldata,
        to: nftPositionManagerAddress,
        value: hexToBigInt(value),
        account,
      }
      getViemClients({ chainId })
        ?.estimateGas(txn)
        .then((gas) => {
          sendTransactionAsync({
            ...txn,
            gas: calculateGasMargin(gas),
          })
            .then((response) => {
              const baseAmount = formatRawAmount(
                parsedAmounts[Field.CURRENCY_A]?.quotient?.toString() ?? '0',
                baseCurrency.decimals,
                4,
              )
              const quoteAmount = formatRawAmount(
                parsedAmounts[Field.CURRENCY_B]?.quotient?.toString() ?? '0',
                quoteCurrency.decimals,
                4,
              )

              setAttemptingTxn(false)
              addTransaction(response, {
                type: 'add-liquidity-v3',
                summary: `Add ${baseAmount} ${baseCurrency?.symbol} and ${quoteAmount} ${quoteCurrency?.symbol}`,
              })
              setTxHash(response.hash)
              onAddLiquidityCallback(response.hash)
            })
            .catch((error) => {
              console.error('Failed to send transaction', error)
              // we only care if the error is something _other_ than the user rejected the tx
              if (!isUserRejected(error)) {
                setTxnErrorMessage(transactionErrorToUserReadableMessage(error, t))
              }
              setAttemptingTxn(false)
            })
        })
    }
  }, [
    account,
    addTransaction,
    allowedSlippage,
    baseCurrency,
    chainId,
    deadline,
    nftPositionManagerAddress,
    noLiquidity,
    onAddLiquidityCallback,
    parsedAmounts,
    position,
    positionManager,
    quoteCurrency,
    sendTransactionAsync,
    signer,
    t,
  ])

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
    setTxnErrorMessage(undefined)
    setAttemptingTxn(false)
  }, [onFieldAInput, txHash])
  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  useInitialRange(baseCurrency?.wrapped, quoteCurrency?.wrapped)

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)
  // we need an existence check on parsed amounts for single-asset deposits
  const showApprovalA = approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A]
  const showApprovalB = approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B]

  const translationData = useMemo(() => {
    if (depositADisabled) {
      return {
        amount: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_B], 4, locale),
        symbol: currencies[Field.CURRENCY_B]?.symbol ? currencies[Field.CURRENCY_B].symbol : '',
      }
    }
    if (depositBDisabled) {
      return {
        amount: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_A], 4, locale),
        symbol: currencies[Field.CURRENCY_A]?.symbol ? currencies[Field.CURRENCY_A].symbol : '',
      }
    }
    return {
      amountA: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_A], 4, locale),
      symbolA: currencies[Field.CURRENCY_A]?.symbol ? currencies[Field.CURRENCY_A].symbol : '',
      amountB: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_B], 4, locale),
      symbolB: currencies[Field.CURRENCY_B]?.symbol ? currencies[Field.CURRENCY_B].symbol : '',
    }
  }, [depositADisabled, depositBDisabled, parsedAmounts, locale, currencies])

  const pendingText = useMemo(
    () =>
      !outOfRange
        ? t('Supplying {{amountA}} {{symbolA}} and {{amountB}} {{symbolB}}', {
            amountA: translationData.amountA,
            symbolA: translationData.symbolA,
            amountB: translationData.amountB,
            symbolB: translationData.symbolB,
          })
        : t('Supplying {{amount}} {{symbol}}', {
            amountA: translationData.amountA,
            symbolA: translationData.symbolA,
            amountB: translationData.amountB,
            symbolB: translationData.symbolB,
          }),
    [t, outOfRange, translationData],
  )

  const [activeQuickAction, setActiveQuickAction] = useState<number>()
  const isQuickButtonUsed = useRef(false)

  const [onPresentAddLiquidityModal] = useModal(
    <TransactionConfirmationModal
      title={t('Add Liquidity')}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      errorMessage={txnErrorMessage}
      content={
        <ConfirmationModalContent
          topContent={
            position ? (
              <PositionPreview
                position={position}
                inRange={!outOfRange}
                ticksAtLimit={ticksAtLimit}
                baseCurrencyDefault={baseCurrency}
              />
            ) : null
          }
          bottomContent={
            <ButtonV2 variant="primary" fullWidth className="mt-4" onClick={onAdd}>
              {t('Add')}
            </ButtonV2>
          }
        />
      }
      pendingText={pendingText}
    />,
    true,
    true,
    'TransactionConfirmationModal',
    [attemptingTxn, txHash, position, outOfRange, ticksAtLimit, baseCurrency],
  )

  const addIsWarning = useIsTransactionWarning(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const handleButtonSubmit = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    expertMode ? onAdd() : onPresentAddLiquidityModal()
    logGTMClickAddLiquidityEvent()
  }, [expertMode, onAdd, onPresentAddLiquidityModal])

  const buttons = (
    <V3SubmitButton
      className="mt-5"
      addIsUnsupported={addIsUnsupported}
      addIsWarning={addIsWarning}
      account={account ?? undefined}
      isWrongNetwork={Boolean(isWrongNetwork)}
      approvalA={approvalA}
      approvalB={approvalB}
      isValid={isValid}
      showApprovalA={showApprovalA}
      approveACallback={approveACallback}
      currencies={currencies}
      showApprovalB={showApprovalB}
      approveBCallback={approveBCallback}
      parsedAmounts={parsedAmounts}
      onClick={handleButtonSubmit}
      attemptingTxn={attemptingTxn}
      errorMessage={errorMessage}
      buttonText={t('Add')}
      depositADisabled={depositADisabled}
      depositBDisabled={depositBDisabled}
    />
  )

  useEffect(() => {
    if (!isQuickButtonUsed.current && activeQuickAction) {
      setActiveQuickAction(undefined)
    } else if (isQuickButtonUsed.current) {
      isQuickButtonUsed.current = false
    }
  }, [isQuickButtonUsed, activeQuickAction, leftRangeTypedValue, rightRangeTypedValue])

  const handleRefresh = useCallback(
    (zoomLevel?: ZoomLevels) => {
      setActiveQuickAction(undefined)
      const currentPrice = price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
      if (currentPrice) {
        onBothRangeInput({
          leftTypedValue: tryParsePrice(
            baseCurrency?.wrapped,
            quoteCurrency?.wrapped,
            (
              currentPrice * (zoomLevel?.initialMin ?? ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM].initialMin)
            ).toString(),
          ),
          rightTypedValue: tryParsePrice(
            baseCurrency?.wrapped,
            quoteCurrency?.wrapped,
            (
              currentPrice * (zoomLevel?.initialMax ?? ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM].initialMax)
            ).toString(),
          ),
        })
      }
    },
    [price, feeAmount, invertPrice, onBothRangeInput, baseCurrency, quoteCurrency],
  )

  const {
    isLoading: isChartDataLoading,
    error: chartDataError,
    formattedData,
  } = useDensityChartData({
    currencyA: baseCurrency ?? undefined,
    currencyB: quoteCurrency ?? undefined,
    feeAmount,
  })

  return (
    <>
      <div className="md:pr-4 md:border-r md:border-border">
        <SectionTitle>{t('Choose Token Pair')}</SectionTitle>

        <div className="flex items-center space-x-3 mt-2">
          <CurrencySelect
            id="add-liquidity-select-tokena"
            selectedCurrency={baseCurrency}
            onCurrencySelect={handleCurrencyASelect}
            showCommonBases
            commonBasesType={CommonBasesType.LIQUIDITY}
            hideBalance
          />

          <Plus size={16} className="text-on-surface shrink-0" />

          <CurrencySelect
            id="add-liquidity-select-tokenb"
            selectedCurrency={quoteCurrency}
            onCurrencySelect={handleCurrencyBSelect}
            showCommonBases
            commonBasesType={CommonBasesType.LIQUIDITY}
            hideBalance
          />
        </div>

        <DynamicSection disabled={!baseCurrency || !quoteCurrency} className="mt-2">
          <FeeSelector
            currencyA={baseCurrency ?? undefined}
            currencyB={quoteCurrency ?? undefined}
            handleFeePoolSelect={handleFeePoolSelect}
            feeAmount={feeAmount}
            handleSelectV2={handleSelectV2}
          />
        </DynamicSection>

        <DynamicSection
          disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue) || (!priceLower && !priceUpper)}
          className="mt-7"
        >
          <SectionTitle>{t('Deposit Amount')}</SectionTitle>

          <div className="flex flex-col space-y-2 mt-2">
            <LockedDeposit locked={depositADisabled}>
              <CurrencyInputPanel
                showUSDPrice
                maxAmount={maxAmounts[Field.CURRENCY_A]}
                onMax={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')}
                onPercentInput={(percent) =>
                  onFieldAInput(maxAmounts[Field.CURRENCY_A]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
                }
                disableCurrencySelect
                value={formattedAmounts[Field.CURRENCY_A] ?? '0'}
                onUserInput={onFieldAInput}
                showQuickInputButton
                showMaxButton
                currency={currencies[Field.CURRENCY_A]}
                id="add-liquidity-input-tokena"
                showCommonBases
                commonBasesType={CommonBasesType.LIQUIDITY}
              />
            </LockedDeposit>

            <LockedDeposit locked={depositBDisabled}>
              <CurrencyInputPanel
                showUSDPrice
                maxAmount={maxAmounts[Field.CURRENCY_B]}
                onMax={() => onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')}
                onPercentInput={(percent) =>
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
                }
                disableCurrencySelect
                value={formattedAmounts[Field.CURRENCY_B] ?? '0'}
                onUserInput={onFieldBInput}
                showQuickInputButton
                showMaxButton
                currency={currencies[Field.CURRENCY_B]}
                id="add-liquidity-input-tokenb"
                showCommonBases
                commonBasesType={CommonBasesType.LIQUIDITY}
              />
            </LockedDeposit>
          </div>
        </DynamicSection>
      </div>

      <div>
        {noLiquidity && (
          <div>
            <SectionTitle>{t('Set Starting Price')}</SectionTitle>

            <Notification variant="caution" fullWidth className="text-sm mt-2">
              <p className="mb-2">
                {t(
                  'This pool must be initialized before you can add liquidity. To initialize, select a starting price for the pool. Then, enter your liquidity price range and deposit amount. Gas fees will be higher than usual due to the initialization transaction.',
                )}
              </p>

              <b>{t('Fee-on transfer tokens and rebasing tokens are NOT compatible with V3.')}</b>
            </Notification>

            <NumberFormat
              disabled={!noLiquidity}
              className="text-on-surface bg-neutral w-full text-right focus:outline-none py-2 px-3 rounded-2xl mt-2"
              value={startPriceTypedValue}
              onChange={(e) => {
                onStartPriceInput(e.target.value.replace(/,/g, ''))
              }}
              thousandSeparator
              allowNegative={false}
              placeholder="0.00"
            />

            <p className="text-[13px] text-on-surface-subtle mt-1 px-2">
              {t('Current {{symbol}} Price', { symbol: baseCurrency?.symbol })}:{' '}
              {price ? (invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)) : '-'}{' '}
              {quoteCurrency?.symbol}
            </p>
          </div>
        )}

        <DynamicSection disabled={!feeAmount || invalidPool}>
          <div className="flex items-center space-x-2 justify-between w-full mb-2">
            <SectionTitle>{t('Set Price Range')}</SectionTitle>

            <RateToggle
              currencyA={baseCurrency}
              handleRateToggle={() => {
                if (!ticksAtLimit[Bound.LOWER] && !ticksAtLimit[Bound.UPPER]) {
                  onLeftRangeInput((invertPrice ? priceLower : priceUpper?.invert()) ?? undefined)
                  onRightRangeInput((invertPrice ? priceUpper : priceLower?.invert()) ?? undefined)
                  onFieldAInput(formattedAmounts[Field.CURRENCY_B] ?? '')
                }

                router.replace(
                  {
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      currency: [currencyIdB, currencyIdA, feeAmount ? feeAmount.toString() : ''],
                    },
                  },
                  undefined,
                  {
                    shallow: true,
                  },
                )
              }}
            />
          </div>

          {!noLiquidity && (
            <>
              {price && baseCurrency && quoteCurrency && !noLiquidity && (
                <span className="text-on-surface-subtle text-xs">
                  {`${t('Current Price')}: ${invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)} ${
                    quoteCurrency?.symbol
                  } per ${baseCurrency.symbol}`}
                </span>
              )}

              <LiquidityChartRangeInput
                zoomLevel={
                  feeAmount && activeQuickAction ? QUICK_ACTION_CONFIGS?.[feeAmount]?.[activeQuickAction] : undefined
                }
                key={baseCurrency?.wrapped?.address}
                currencyA={baseCurrency ?? undefined}
                currencyB={quoteCurrency ?? undefined}
                feeAmount={feeAmount}
                ticksAtLimit={ticksAtLimit}
                price={price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined}
                priceLower={priceLower}
                priceUpper={priceUpper}
                onBothRangeInput={onBothRangePriceInput}
                onLeftRangeInput={onLeftRangePriceInput}
                onRightRangeInput={onRightRangePriceInput}
                formattedData={formattedData}
                isLoading={isChartDataLoading}
                error={chartDataError}
                interactive
              />
            </>
          )}
        </DynamicSection>

        <DynamicSection
          disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}
          className="flex flex-col gap-3"
        >
          <RangeSelector
            priceLower={priceLower}
            priceUpper={priceUpper}
            getDecrementLower={getDecrementLower}
            getIncrementLower={getIncrementLower}
            getDecrementUpper={getDecrementUpper}
            getIncrementUpper={getIncrementUpper}
            onLeftRangeInput={onLeftRangeInput}
            onRightRangeInput={onRightRangeInput}
            currencyA={baseCurrency}
            currencyB={quoteCurrency}
            feeAmount={feeAmount}
            ticksAtLimit={ticksAtLimit}
          />
          {showCapitalEfficiencyWarning ? (
            <Notification variant="caution">
              <p>{t('Efficiency Comparison')}</p>

              <p className="text-sm mt-1">
                {t('Full range positions may earn less fees than concentrated positions.')}
              </p>

              <ButtonV2
                className="mt-4"
                onClick={() => {
                  setShowCapitalEfficiencyWarning(false)
                  getSetFullRange()
                }}
                scale="md"
                variant="primary"
                fullWidth
              >
                {t('I understand')}
              </ButtonV2>
            </Notification>
          ) : (
            <div className="flex items-center space-x-2">
              {feeAmount &&
                QUICK_ACTION_CONFIGS[feeAmount] &&
                Object.entries<ZoomLevels>(QUICK_ACTION_CONFIGS[feeAmount])
                  ?.sort(([a], [b]) => +a - +b)
                  .map(([quickAction, zoomLevel]) => {
                    return (
                      <ButtonV2
                        fullWidth
                        key={`quickActions${quickAction}`}
                        onClick={() => {
                          if (+quickAction === activeQuickAction) {
                            handleRefresh(ZOOM_LEVELS[feeAmount])
                            return
                          }
                          handleRefresh(zoomLevel)

                          setActiveQuickAction(+quickAction)
                          isQuickButtonUsed.current = true
                        }}
                        variant={+quickAction === activeQuickAction ? 'primary' : 'blank'}
                        scale="sm"
                      >
                        {quickAction}%
                      </ButtonV2>
                    )
                  })}
              <ButtonV2
                fullWidth
                onClick={() => {
                  if (activeQuickAction === 100) {
                    handleRefresh()
                    return
                  }
                  setShowCapitalEfficiencyWarning(true)
                  setActiveQuickAction(100)
                  isQuickButtonUsed.current = true
                }}
                variant={activeQuickAction === 100 ? 'primary' : 'blank'}
                scale="sm"
                className="whitespace-nowrap"
              >
                {t('Full Range')}
              </ButtonV2>
            </div>
          )}

          {outOfRange ? (
            <Notification variant="caution" fullWidth className="text-sm">
              <p>
                {t(
                  'Your position will not earn fees or be used in trades until the market price moves into your range.',
                )}
              </p>
            </Notification>
          ) : null}

          {invalidRange ? (
            <Notification variant="caution" fullWidth className="text-sm">
              <p>{t('Invalid range selected. The min price must be lower than the max price.')}</p>
            </Notification>
          ) : null}
        </DynamicSection>

        {buttons}
      </div>
    </>
  )
}
