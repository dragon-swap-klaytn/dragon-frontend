import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/sdk'
import { SMART_ROUTER_ADDRESSES, SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { Button, Dots, ModalV2, useModal } from '@pancakeswap/uikit'
import { confirmPriceImpactWithoutFee } from '@pancakeswap/widgets-internal'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { logGTMClickSwapEvent } from 'utils/customGTMEventTracking'

import { useExpertMode } from '@pancakeswap/utils/user'
import { CommitButton } from 'components/CommitButton'
import ConnectWalletButton from 'components/ConnectWalletButton'
import SettingsModal, { RoutingSettings, withCustomOnDismiss } from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  BIG_INT_ZERO,
  PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
} from 'config/constants/exchange'
import { useCurrency } from 'hooks/Tokens'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { useRoutingSettingChanged } from 'state/user/smartRouter'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { warningSeverity } from 'utils/exchange'

import ApprovalConfirmationModal from 'components/ApprovalConfirmationModal'
import Notification from 'components/Common/Notification'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useConfirmModalState } from 'views/Swap/V3Swap/hooks/useConfirmModalState'
import { useAccount } from 'wagmi'
import { useParsedAmounts, useSlippageAdjustedAmounts, useSwapCallback, useSwapInputError } from '../hooks'
import { TransactionRejectedError } from '../hooks/useSendSwapTransaction'
import { useWallchainApi } from '../hooks/useWallchain'
import { computeTradePriceBreakdown } from '../utils/exchange'
import { ConfirmSwapModal } from './ConfirmSwapModal'

const SettingsModalWithCustomDismiss = withCustomOnDismiss(SettingsModal)

interface SwapCommitButtonPropsType {
  trade?: SmartRouterTrade<TradeType>
  tradeError?: Error
  tradeLoading?: boolean
}

export const SwapCommitButton = memo(function SwapCommitButton({
  trade,
  tradeError,
  tradeLoading,
}: SwapCommitButtonPropsType) {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const [isExpertMode] = useExpertMode()
  const {
    typedValue,
    independentField,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const swapIsUnsupported = useIsTransactionUnsupported(inputCurrency, outputCurrency)
  const { onUserInput } = useSwapActionHandlers()

  const [onPresentKlipTxModal, onDismissKlipTxModal] = useModal(
    <ApprovalConfirmationModal
      minWidth={['100%', null, '420px']}
      title="Confirm Transaction"
      content={() => ''}
      pendingText="wating confirm..."
      hash={undefined}
      attemptingTxn
    />,
    true,
    true,
    'WrapConfirmationModal',
  )
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(inputCurrency, outputCurrency, typedValue, {
    open: onPresentKlipTxModal,
    close: onDismissKlipTxModal,
  })
  const showWrap = wrapType !== WrapType.NOT_APPLICABLE

  const [isRoutingSettingChange, resetRoutingSetting] = useRoutingSettingChanged()
  const slippageAdjustedAmounts = useSlippageAdjustedAmounts(trade)

  const deadline = useTransactionDeadline()
  const [statusWallchain, approvalAddressForWallchain, wallchainMasterInput] = useWallchainApi(trade, deadline)
  const [wallchainSecondaryStatus, setWallchainSecondaryStatus] = useState<'found' | 'not-found'>('not-found')
  const routerAddress =
    statusWallchain === 'found' || wallchainSecondaryStatus === 'found'
      ? approvalAddressForWallchain
      : SMART_ROUTER_ADDRESSES[trade?.inputAmount?.currency?.chainId as keyof typeof SMART_ROUTER_ADDRESSES]
  const amountToApprove = slippageAdjustedAmounts[Field.INPUT]
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])
  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  // check whether the user has approved the router on the input token
  const { approvalState, approveCallback, revokeCallback, currentAllowance, isPendingError } = useApproveCallback(
    amountToApprove,
    routerAddress,
    {
      addToTransaction: true,
      useA2AQr: false,
    },
  )

  const { priceImpactWithoutFee } = useMemo(
    () => (!showWrap ? computeTradePriceBreakdown(trade) : {}),
    [showWrap, trade],
  )
  const swapInputError = useSwapInputError(trade, currencyBalances)
  const parsedAmounts = useParsedAmounts(trade, currencyBalances, showWrap)
  const parsedIndepentFieldAmount = parsedAmounts[independentField]

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const onWallchainDrop = useCallback(() => {
    setApprovalSubmitted(false)
  }, [setApprovalSubmitted])

  const {
    callback: swapCallback,
    error: swapCallbackError,
    reason: revertReason,
  } = useSwapCallback({
    trade,
    deadline,
    onWallchainDrop,
    wallchainMasterInput,
  })

  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: SmartRouterTrade<TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  // Handlers
  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash, setSwapState])

  const handleSwap = useCallback(async () => {
    if (
      priceImpactWithoutFee &&
      !confirmPriceImpactWithoutFee(
        priceImpactWithoutFee,
        PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
        ALLOWED_PRICE_IMPACT_HIGH,
        t,
      )
    ) {
      return undefined
    }
    if (!swapCallback) {
      if (revertReason === 'insufficient allowance') {
        setApprovalSubmitted(false)
        setWallchainSecondaryStatus('found')
        return undefined
      }
      return undefined
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    return swapCallback()
      .then((res) => {
        setWallchainSecondaryStatus('not-found')
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: res.hash })
      })
      .catch((error) => {
        setWallchainSecondaryStatus('not-found')

        if (error instanceof TransactionRejectedError) {
          setSwapState((s) => ({
            ...s,
            txHash: undefined,
            attemptingTxn: false,
          }))
          // throw reject error to reset the flow
          throw error
        }

        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: typeof error === 'string' ? error : error?.message,
          txHash: undefined,
        })
      })
  }, [priceImpactWithoutFee, t, swapCallback, tradeToConfirm, revertReason])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash, setSwapState])
  // End Handlers

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  // Modals
  const [indirectlyOpenConfirmModalState, setIndirectlyOpenConfirmModalState] = useState(false)

  const [onPresentSettingsModal] = useModal(
    <SettingsModalWithCustomDismiss
      customOnDismiss={() => setIndirectlyOpenConfirmModalState(true)}
      mode={SettingsMode.SWAP_LIQUIDITY}
    />,
  )

  const { confirmModalState, pendingModalSteps, startSwapFlow, resetSwapFlow } = useConfirmModalState({
    txHash,
    chainId,
    approval: approvalState,
    approvalToken: trade?.inputAmount?.currency,
    isPendingError,
    isExpertMode,
    currentAllowance,
    approveCallback,
    revokeCallback,
    onConfirm: handleSwap,
  })

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      txHash={txHash}
      approval={approvalState}
      attemptingTxn={attemptingTxn}
      originalTrade={tradeToConfirm}
      showApproveFlow={showApproveFlow}
      currencyBalances={currencyBalances}
      confirmModalState={confirmModalState}
      pendingModalSteps={pendingModalSteps}
      startSwapFlow={startSwapFlow}
      swapErrorMessage={swapErrorMessage}
      currentAllowance={currentAllowance}
      onAcceptChanges={handleAcceptChanges}
      customOnDismiss={handleConfirmDismiss}
      openSettingModal={onPresentSettingsModal}
    />,
    true,
    true,
    'confirmSwapModal',
  )
  // End Modals

  const onSwapHandler = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      attemptingTxn: false,
      swapErrorMessage: undefined,
      txHash: undefined,
    })
    resetSwapFlow()
    if (isExpertMode) {
      startSwapFlow()
    }
    onPresentConfirmModal()
    logGTMClickSwapEvent()
  }, [trade, onPresentConfirmModal, isExpertMode, startSwapFlow, resetSwapFlow])

  // useEffect
  useEffect(() => {
    if (indirectlyOpenConfirmModalState) {
      setIndirectlyOpenConfirmModalState(false)
      setSwapState((state) => ({
        ...state,
        swapErrorMessage: undefined,
      }))
      onPresentConfirmModal()
    }
  }, [indirectlyOpenConfirmModalState, onPresentConfirmModal, setSwapState])

  // Reset approval flow if input currency changed
  useEffect(() => {
    setApprovalSubmitted(false)
  }, [trade?.inputAmount?.currency])

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const [show, setShow] = useState(false)
  const isValid = !swapInputError && !tradeLoading

  if (swapIsUnsupported) {
    return (
      <Button width="100%" disabled>
        {t('Unsupported Asset')}
      </Button>
    )
  }

  if (!account) {
    return <ConnectWalletButton />
  }

  if (showWrap) {
    return (
      <CommitButton width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
        {wrapInputError ?? (wrapType === WrapType.WRAP ? t('Wrap') : wrapType === WrapType.UNWRAP ? t('Unwrap') : null)}
      </CommitButton>
    )
  }

  const noRoute = !((trade?.routes?.length ?? 0) > 0) || tradeError

  const userHasSpecifiedInputOutput = Boolean(
    inputCurrency && outputCurrency && parsedIndepentFieldAmount?.greaterThan(BIG_INT_ZERO),
  )

  if (noRoute && userHasSpecifiedInputOutput && !tradeLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <Notification variant="warning">{t('Insufficient liquidity for this trade.')}</Notification>

        <div className="p-4 rounded-[20px] bg-surface-disable">
          <p className="text-sm text-center text-gray-400">{t('Insufficient liquidity for this trade.')}</p>
        </div>

        {isRoutingSettingChange && (
          <Notification variant="warning" nStyle="default">
            <div className="flex flex-col">
              <p>{t('Unable to establish trading route due to customized routing.')}</p>

              <div className="flex items-center space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShow(true)}
                  className="hover:opacity-70 px-2 py-1 border rounded-md text-gray-100 border-gray-100 text-xs"
                >
                  {t('Check your settings')}
                </button>

                <span className="text-sm">or</span>

                <button
                  type="button"
                  onClick={resetRoutingSetting}
                  className="hover:opacity-70 px-2 py-1 border rounded-md text-gray-100 border-gray-100 text-xs"
                >
                  {t('Reset to default')}
                </button>
              </div>

              <ModalV2 isOpen={show} onDismiss={() => setShow(false)} closeOnOverlayClick>
                <RoutingSettings />
              </ModalV2>
            </div>
          </Notification>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {!tradeLoading && !swapInputError && priceImpactSeverity > 2 && (
        <Notification variant={priceImpactSeverity > 3 ? 'warning' : 'caution'}>
          {priceImpactSeverity > 3
            ? t('Swap is allowed only in Expert Mode due to High Price Impact')
            : t('Price Impact Too High')}
        </Notification>
      )}

      <CommitButton
        width="100%"
        disabled={
          !isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError || statusWallchain === 'pending'
        }
        onClick={onSwapHandler}
      >
        {swapInputError ||
          (tradeLoading && <Dots>{t('Searching For The Best Price')}</Dots>) ||
          (priceImpactSeverity > 3 && !isExpertMode
            ? t('Price Impact Too High')
            : priceImpactSeverity > 2
            ? t('Swap Anyway')
            : t('Swap'))}
      </CommitButton>
    </div>
  )
})
