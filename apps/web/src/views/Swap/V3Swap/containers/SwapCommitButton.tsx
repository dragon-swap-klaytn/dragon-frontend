import { Trans, useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/sdk'
import { SMART_ROUTER_ADDRESSES, SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { ButtonV2, Dots, ExternalLink, ModalV2, Notification, useModal, ZERO_ADDRESS } from '@pancakeswap/uikit'
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
import { useCurrencyBalances, useRefreshCurrencyBalances } from 'state/wallet/hooks'
import { warningSeverity } from 'utils/exchange'

import { useDebounce } from '@pancakeswap/hooks'
import ApprovalConfirmationModal from 'components/ApprovalConfirmationModal'
import { refreshUnifiWalletManagedTokenBalancesAtom } from 'contexts/UnifiWalletContext'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useTokenPrices from 'hooks/useTokenPrices'
import { useAtom } from 'jotai'
import { swapReducerAtom } from 'state/swap/reducer'
import { safeGetAddress } from 'utils'
import { useConfirmModalState } from 'views/Swap/V3Swap/hooks/useConfirmModalState'
import { useAccount } from 'wagmi'
import { useParsedAmounts, useSlippageAdjustedAmounts, useSwapCallback, useSwapInputError } from '../hooks'
import { TransactionRejectedError } from '../hooks/useSendSwapTransaction'
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
  const [{ fn: refreshUnifiWalletManagedTokenBalances }] = useAtom(refreshUnifiWalletManagedTokenBalancesAtom)
  const {
    typedValue,
    independentField,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const {
    i18n: { language },
  } = useTranslation()
  const { prices: pricesFromSs } = useTokenPrices({
    source: 'swapscanner',
  })
  const inputCurrencyFilteredBySs = useMemo(() => {
    const address = !inputCurrency ? undefined : inputCurrency.isNative ? ZERO_ADDRESS : inputCurrency.wrapped.address
    if (!address) return null

    const price = pricesFromSs?.[address]
    if (!price) return null

    return address
  }, [inputCurrency, pricesFromSs])

  const outputCurrencyFilteredBySs = useMemo(() => {
    const address = !outputCurrency
      ? undefined
      : outputCurrency.isNative
      ? ZERO_ADDRESS
      : outputCurrency.wrapped.address
    if (!address) return null

    const price = pricesFromSs?.[address]
    if (!price) return null

    return address
  }, [outputCurrency, pricesFromSs])

  const swapIsUnsupported = useIsTransactionUnsupported(inputCurrency, outputCurrency)
  const { onUserInput } = useSwapActionHandlers()

  const [s] = useAtom(swapReducerAtom)
  const debouncedAddress = useDebounce(s.recipient, 500)
  const address = useMemo(() => safeGetAddress(debouncedAddress), [debouncedAddress])
  const recipientError = Boolean((debouncedAddress?.length || 0) > 0 && !address)

  const [onPresentKlipTxModal, onDismissKlipTxModal] = useModal(
    <ApprovalConfirmationModal
      title={t('Confirm Transaction')}
      content={() => ''}
      pendingText="waiting confirm..."
      attemptingTxn
    />,
    true,
    false,
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

  const routerAddress =
    SMART_ROUTER_ADDRESSES[trade?.inputAmount?.currency?.chainId as keyof typeof SMART_ROUTER_ADDRESSES]
  const amountToApprove = slippageAdjustedAmounts[Field.INPUT]
  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])
  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const refreshCurrencyBalances = useRefreshCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

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
      throw new TransactionRejectedError()
    }
    if (!swapCallback) {
      if (revertReason === 'insufficient allowance') {
        setApprovalSubmitted(false)

        return undefined
      }
      return undefined
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    return swapCallback()
      .then((res) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: res.hash })
        setTimeout(() => {
          refreshUnifiWalletManagedTokenBalances()
          refreshCurrencyBalances()
        }, 1_000)
      })
      .catch((error) => {
        if (error instanceof TransactionRejectedError) {
          setSwapState((_s) => ({
            ..._s,
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

  // Handlers
  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm: undefined, attemptingTxn: false, swapErrorMessage: undefined, txHash: undefined })
    resetSwapFlow()
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [onUserInput, txHash, setSwapState, resetSwapFlow])

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
    [
      trade,
      txHash,
      approvalState,
      attemptingTxn,
      tradeToConfirm,
      showApproveFlow,
      currencyBalances,
      confirmModalState,
      pendingModalSteps,
      currentAllowance,
    ],
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
  }, [trade, onPresentConfirmModal, resetSwapFlow, isExpertMode, startSwapFlow])

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

  // const [onPresentRoutingSettings] = useModal(<RoutingSettings />)

  const [open, setOpen] = useState(false)
  const isValid = !swapInputError && !tradeLoading

  if (swapIsUnsupported) {
    return (
      <ButtonV2 variant="subtle" fullWidth disabled onClick={() => {}}>
        {t('Unsupported Asset')}
      </ButtonV2>
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
        <div className="p-4 rounded-[20px] bg-surface-disable">
          <p className="text-sm text-center text-gray-400">{t('Insufficient liquidity for this trade.')}</p>
        </div>

        {isRoutingSettingChange ? (
          <Notification variant="warning" nStyle="default">
            <div className="flex flex-col">
              <p>{t('The trading route may not be found due to customized routing.')}</p>

              <div className="flex items-center space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="hover:opacity-70 px-2 py-1 border rounded-md text-gray-100 border-gray-100 text-xs"
                >
                  {t('Check your settings')}
                </button>

                <span className="text-sm">{t('or')}</span>

                <button
                  type="button"
                  onClick={resetRoutingSetting}
                  className="hover:opacity-70 px-2 py-1 border rounded-md text-gray-100 border-gray-100 text-xs"
                >
                  {t('Reset to default')}
                </button>
              </div>

              <ModalV2 isOpen={open} onDismiss={() => setOpen(false)} closeOnOverlayClick>
                <RoutingSettings hideOnback onDismiss={() => setOpen(false)} />
              </ModalV2>
            </div>
          </Notification>
        ) : tradeError && inputCurrencyFilteredBySs && outputCurrencyFilteredBySs ? (
          <Notification variant="positive" nStyle="default">
            <div className="flex flex-col">
              <p className="break-keep">
                <Trans
                  t={t}
                  i18nKey="If certain tokens are not tradable on DragonSwap, try using <b>Swapscanner</b> service!"
                  components={{
                    b: <b className="contents" />,
                  }}
                />
              </p>

              <ExternalLink
                href={`https://swapscanner.io${
                  language === 'en' ? '' : '/ko'
                }/swap?from=${inputCurrencyFilteredBySs}&to=${outputCurrencyFilteredBySs}`}
                className="mt-4"
              >
                {t('Use Swapscanner')}
              </ExternalLink>

              <ModalV2 isOpen={open} onDismiss={() => setOpen(false)} closeOnOverlayClick>
                <RoutingSettings hideOnback onDismiss={() => setOpen(false)} />
              </ModalV2>
            </div>
          </Notification>
        ) : null}
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
          !isValid ||
          (priceImpactSeverity > 3 && !isExpertMode) ||
          !!swapCallbackError ||
          tradeLoading ||
          recipientError
        }
        onClick={onSwapHandler}
      >
        {recipientError
          ? t('Invalid recipient address')
          : swapInputError ||
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
