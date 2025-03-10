import { CommonBasesType } from 'components/SearchModal/types'

import { Currency, CurrencyAmount, Percent } from '@pancakeswap/sdk'
import { ButtonV2, useModal } from '@pancakeswap/uikit'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'

import { useIsExpertMode, useUserSlippage } from '@pancakeswap/utils/user'
import { FeeAmount, MasterChefV3, NonfungiblePositionManager } from '@pancakeswap/v3-sdk'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useDerivedPositionInfo } from 'hooks/v3/useDerivedPositionInfo'
import useV3DerivedInfo from 'hooks/v3/useV3DerivedInfo'
import { useV3PositionFromTokenId, useV3TokenIdsByAccount } from 'hooks/v3/useV3Positions'
import { useCallback, useMemo, useState } from 'react'
import { Field } from 'state/mint/actions'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { useTranslation } from '@pancakeswap/localization'
import { AppHeader } from 'components/App'
import { useIsTransactionUnsupported, useIsTransactionWarning } from 'hooks/Trades'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useMasterchefV3, useV3NFTPositionManagerContract } from 'hooks/useContract'
import { useRouter } from 'next/router'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils'
import Page from 'views/Page'
import { useSendTransaction } from 'wagmi'

import CurrencyInputPanel from 'components/CurrencyInputPanel'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { basisPointsToPercent } from 'utils/exchange'
import { formatCurrencyAmount, formatRawAmount } from 'utils/formatCurrencyAmount'
import { isUserRejected } from 'utils/sentry'
import { getViemClients } from 'utils/viem'
import { hexToBigInt } from 'viem'

import { useHistory } from 'contexts/HistoryContext'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { V3SubmitButton } from './components/V3SubmitButton'
import LockedDeposit from './formViews/V3FormView/components/LockedDeposit'
import { PositionPreview } from './formViews/V3FormView/components/PositionPreview'
import { useV3MintActionHandlers } from './formViews/V3FormView/form/hooks/useV3MintActionHandlers'
import { useV3FormState } from './formViews/V3FormView/form/reducer'

interface AddLiquidityV3PropsType {
  currencyA?: Currency | null
  currencyB?: Currency | null
}

export default function IncreaseLiquidityV3({ currencyA: baseCurrency, currencyB }: AddLiquidityV3PropsType) {
  const router = useRouter()
  const { sendTransactionAsync } = useSendTransaction()
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()

  const [, , feeAmountFromUrl, tokenId] = router.query.currency || []

  const {
    t,
    i18n: { language: locale },
  } = useTranslation()
  const expertMode = useIsExpertMode()

  const { account, chainId, isWrongNetwork } = useActiveWeb3React()

  const masterchefV3 = useMasterchefV3()
  const { tokenIds: stakedTokenIds, loading: tokenIdsInMCv3Loading } = useV3TokenIdsByAccount(
    masterchefV3?.address,
    account,
  )

  const [txHash, setTxHash] = useState<string>('')

  const addTransaction = useTransactionAdder()
  // fee selection from url
  const feeAmount: FeeAmount | undefined = useMemo(
    () =>
      feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
        ? parseFloat(feeAmountFromUrl)
        : undefined,
    [feeAmountFromUrl],
  )

  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useV3PositionFromTokenId(
    tokenId ? BigInt(tokenId) : undefined,
  )

  const hasExistingPosition = !!existingPositionDetails && !positionLoading
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails)
  // prevent an error if they input NATIVE/WNATIVE
  const quoteCurrency = useMemo(
    () => (baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB),
    [baseCurrency, currencyB],
  )

  // mint state
  const formState = useV3FormState()
  const { independentField, typedValue } = formState

  const {
    dependentField,
    parsedAmounts,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    ticksAtLimit,
    currencyBalances,
  } = useV3DerivedInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition,
    formState,
  )
  const { onFieldAInput, onFieldBInput } = useV3MintActionHandlers(noLiquidity)
  const isValid = !errorMessage && !invalidRange

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  // get formatted amounts
  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }),
    [parsedAmounts, typedValue, independentField, dependentField],
  )

  // get the max amounts user can add
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

  const positionManager = useV3NFTPositionManagerContract()
  const [allowedSlippage] = useUserSlippage() // custom from users

  const isStakedInMCv3 = useMemo(
    () => Boolean(tokenId && stakedTokenIds.find((id) => id === BigInt(tokenId))),
    [tokenId, stakedTokenIds],
  )

  const manager = isStakedInMCv3 ? masterchefV3 : positionManager
  const interfaceManager = isStakedInMCv3 ? MasterChefV3 : NonfungiblePositionManager

  const { approvalState: approvalA, approveCallback: approveACallback } = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    manager?.address,
  )
  const { approvalState: approvalB, approveCallback: approveBCallback } = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    manager?.address,
  )

  // we need an existence check on parsed amounts for single-asset deposits
  const showApprovalA = approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A]
  const showApprovalB = approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B]

  const onIncrease = useCallback(async () => {
    if (!chainId || !sendTransactionAsync || !account || !interfaceManager || !manager) return

    if (tokenIdsInMCv3Loading || !positionManager || !baseCurrency || !quoteCurrency) {
      return
    }

    if (position && account && deadline) {
      const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined

      const { calldata, value } =
        hasExistingPosition && tokenId
          ? interfaceManager.addCallParameters(position, {
              tokenId,
              slippageTolerance: basisPointsToPercent(allowedSlippage),
              deadline: deadline.toString(),
              useNative,
            })
          : interfaceManager.addCallParameters(position, {
              slippageTolerance: basisPointsToPercent(allowedSlippage),
              recipient: account,
              deadline: deadline.toString(),
              useNative,
              createPool: noLiquidity,
            })

      setAttemptingTxn(true)
      getViemClients({ chainId })
        ?.estimateGas({
          account,
          to: manager.address,
          data: calldata,
          value: hexToBigInt(value),
        })
        .then((gasLimit) => {
          return sendTransactionAsync({
            account,
            to: manager.address,
            data: calldata,
            value: hexToBigInt(value),
            gas: calculateGasMargin(gasLimit),
            chainId,
          })
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
            type: 'increase-liquidity-v3',
            summary: `Increase ${baseAmount} ${baseCurrency?.symbol} and ${quoteAmount} ${quoteCurrency?.symbol}`,
            translatableSummary: {
              text: 'Increase {{baseAmount}} {{baseSymbol}} and {{quoteAmount}} {{quoteSymbol}}',
              data: {
                baseAmount,
                baseSymbol: baseCurrency?.symbol,
                quoteAmount,
                quoteSymbol: quoteCurrency?.symbol,
              },
            },
          })
          setTxHash(response.hash)
        })
        .catch((err) => {
          // we only care if the error is something _other_ than the user rejected the tx
          if (!isUserRejected(err)) {
            setTxnErrorMessage(transactionErrorToUserReadableMessage(err, t))
          }
          setAttemptingTxn(false)
          console.error(err)
        })
    }
  }, [
    account,
    addTransaction,
    allowedSlippage,
    baseCurrency,
    chainId,
    deadline,
    hasExistingPosition,
    interfaceManager,
    manager,
    noLiquidity,
    parsedAmounts,
    position,
    positionManager,
    quoteCurrency,
    sendTransactionAsync,
    tokenId,
    tokenIdsInMCv3Loading,
    t,
  ])

  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)
  const addIsWarning = useIsTransactionWarning(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash && tokenId) {
      onFieldAInput('')
      router.push(`/liquidity/${tokenId}`)
    }
    setTxnErrorMessage(undefined)
    setAttemptingTxn(false)
  }, [onFieldAInput, router, txHash, tokenId])

  const pendingText = useMemo(() => {
    if (depositADisabled) {
      return t('Supplying {{amountA}} {{symbolA}} {{amountB}} {{symbolB}}', {
        amountA: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_B], 4, locale),
        symbolA: currencies[Field.CURRENCY_B]?.symbol,
        amountB: '',
        symbolB: '',
      })
    }
    if (depositBDisabled) {
      return t('Supplying {{amountA}} {{symbolA}} {{amountB}} {{symbolB}}', {
        amountA: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_A], 4, locale),
        symbolA: currencies[Field.CURRENCY_A]?.symbol,
        amountB: '',
        symbolB: '',
      })
    }
    return t('Supplying {{amountA}} {{symbolA}} and {{amountB}} {{symbolB}}', {
      amountA: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_A], 4, locale),
      symbolA: currencies[Field.CURRENCY_A]?.symbol ?? '',
      amountB: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_B], 4, locale),
      symbolB: currencies[Field.CURRENCY_B]?.symbol ?? '',
    })
  }, [depositADisabled, depositBDisabled, currencies, parsedAmounts, locale, t])

  const [onPresentIncreaseLiquidityModal] = useModal(
    <TransactionConfirmationModal
      title={t('Increase Liquidity')}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      errorMessage={txnErrorMessage}
      hash={txHash}
      content={
        <ConfirmationModalContent
          topContent={
            position ? <PositionPreview position={position} inRange={!outOfRange} ticksAtLimit={ticksAtLimit} /> : null
          }
          bottomContent={
            <ButtonV2 variant="primary" fullWidth className="mt-4" onClick={onIncrease}>
              {t('Increase')}
            </ButtonV2>
          }
        />
      }
      pendingText={pendingText}
    />,
    true,
    true,
    'TransactionConfirmationModalIncreaseLiquidity',
    [attemptingTxn, txHash, position?.amount0.numerator, position?.amount1.numerator, outOfRange, ticksAtLimit],
  )

  const handleButtonSubmit = useCallback(
    () => (expertMode ? onIncrease() : onPresentIncreaseLiquidityModal()),
    [expertMode, onIncrease, onPresentIncreaseLiquidityModal],
  )

  const buttons = (
    <V3SubmitButton
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
      approveBCallback={approveBCallback}
      showApprovalB={showApprovalB}
      parsedAmounts={parsedAmounts}
      onClick={handleButtonSubmit}
      attemptingTxn={attemptingTxn}
      errorMessage={errorMessage}
      buttonText={t('Increase')}
      depositADisabled={depositADisabled}
      depositBDisabled={depositBDisabled}
    />
  )

  const { backTo } = useHistory()

  return (
    <Page>
      <div className="max-w-md mt-[60px] mx-auto md:bg-surface-raised rounded-2xl">
        <AppHeader
          backTo={backTo}
          title={t('Add {{assetA}}-{{assetB}} Liquidity', {
            assetA: currencies[Field.CURRENCY_A]?.symbol ?? '',
            assetB: currencies[Field.CURRENCY_B]?.symbol ?? '',
          })}
          noConfig
        />

        <div className="p-5 md:p-8">
          {existingPosition && (
            <PositionPreview
              position={existingPosition}
              title={t('Selected Range')}
              inRange={!outOfRange}
              ticksAtLimit={ticksAtLimit}
            />
          )}
          <div className="mt-4 flex flex-col items-center w-full space-y-3">
            <LockedDeposit locked={depositADisabled}>
              <CurrencyInputPanel
                disableCurrencySelect
                showUSDPrice
                maxAmount={maxAmounts[Field.CURRENCY_A]}
                onMax={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')}
                onPercentInput={(percent) =>
                  onFieldAInput(maxAmounts?.[Field.CURRENCY_A]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
                }
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
                disableCurrencySelect
                showUSDPrice
                maxAmount={maxAmounts[Field.CURRENCY_B]}
                onMax={() => onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')}
                onPercentInput={(percent) =>
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
                }
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

          <div className="mt-8">{buttons}</div>
        </div>
      </div>
    </Page>
  )
}
