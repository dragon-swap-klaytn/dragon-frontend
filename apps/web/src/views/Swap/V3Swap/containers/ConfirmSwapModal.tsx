import { Currency, CurrencyAmount, Token, TradeType } from '@pancakeswap/sdk'
import { memo, useCallback, useMemo, useState } from 'react'

import { useTranslation } from '@pancakeswap/localization'
import { SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { InjectedModalProps } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import {
  ApproveModalContent,
  SwapPendingModalContent,
  SwapTransactionReceiptModalContent,
} from '@pancakeswap/widgets-internal'
import { wrappedCurrency } from 'utils/wrappedCurrency'

import { useDebounce } from '@pancakeswap/hooks'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { ArrowSquareOut } from '@phosphor-icons/react'
import AddToWalletButton, { AddToWalletTextOptions } from 'components/AddToWallet/AddToWalletButton'
import useA2AConnectorQRUri from 'hooks/useA2AConnectorQRUri'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useTokenLogo } from 'hooks/useTokenLogo'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { TransactionConfirmSwapContent } from 'views/Swap/V3Swap/components'
import { ConfirmModalState, PendingConfirmModalState } from '../types'

import ConfirmSwapModalContainer from '../../components/ConfirmSwapModalContainer'
import { SwapTransactionErrorContent } from '../../components/SwapTransactionErrorContent'
import { useWallchainStatus } from '../hooks/useWallchain'
import { ApproveStepFlow } from './ApproveStepFlow'

interface ConfirmSwapModalProps {
  trade?: SmartRouterTrade<TradeType>
  originalTrade?: SmartRouterTrade<TradeType>
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  attemptingTxn: boolean
  txHash?: string
  approval: ApprovalState
  swapErrorMessage?: string | boolean
  showApproveFlow: boolean
  confirmModalState: ConfirmModalState
  startSwapFlow: () => void
  pendingModalSteps: PendingConfirmModalState[]
  currentAllowance?: CurrencyAmount<Currency>
  onAcceptChanges: () => void
  customOnDismiss?: () => void
  openSettingModal?: () => void
}

export const ConfirmSwapModal = memo<InjectedModalProps & ConfirmSwapModalProps>(function ConfirmSwapModalComp({
  trade,
  txHash,
  confirmModalState,
  startSwapFlow,
  pendingModalSteps,
  attemptingTxn,
  originalTrade,
  showApproveFlow,
  currencyBalances,
  swapErrorMessage,
  onDismiss,
  onAcceptChanges,
  customOnDismiss,
  openSettingModal,
}) {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()
  const [allowedSlippage] = useUserSlippage()
  const { recipient } = useSwapState()
  const [wallchainStatus] = useWallchainStatus()
  const isBonus = useDebounce(wallchainStatus === 'found', 500)
  const qrUri = useA2AConnectorQRUri()

  const token: Token | undefined = wrappedCurrency(trade?.outputAmount?.currency, chainId)
  const tokenLogo = useTokenLogo(token)

  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss?.()
    }
    onDismiss?.()
  }, [customOnDismiss, onDismiss])

  const [title, setTitle] = useState<string>('')
  const topModal = useMemo(() => {
    const currencyA = currencyBalances.INPUT?.currency ?? trade?.inputAmount?.currency
    const currencyB = currencyBalances.OUTPUT?.currency ?? trade?.outputAmount?.currency
    const amountA = formatAmount(trade?.inputAmount, 6) ?? ''
    const amountB = formatAmount(trade?.outputAmount, 6) ?? ''

    if (confirmModalState === ConfirmModalState.RESETTING_APPROVAL) {
      const _title = t('Reset Approval on USDT')
      setTitle(_title)
      return <ApproveModalContent title={_title} isBonus={isBonus} />
    }

    if (
      showApproveFlow &&
      (confirmModalState === ConfirmModalState.APPROVING_TOKEN ||
        confirmModalState === ConfirmModalState.APPROVE_PENDING)
    ) {
      const _title = t('Enable spending %symbol%', { symbol: `${trade?.inputAmount?.currency?.symbol}` })
      setTitle(_title)

      return <ApproveModalContent title={_title} isBonus={isBonus} qrUri={qrUri} />
    }

    if (swapErrorMessage) {
      setTitle('Swap Failed')

      return (
        <SwapTransactionErrorContent
          message={swapErrorMessage}
          onDismiss={handleDismiss}
          openSettingModal={openSettingModal}
        />
      )
    }

    if (attemptingTxn) {
      const _title = t('Confirm Swap')
      setTitle(_title)

      return (
        <SwapPendingModalContent
          title={_title}
          currencyA={currencyA}
          currencyB={currencyB}
          amountA={amountA}
          amountB={amountB}
          qrUri={qrUri}
        />
      )
    }

    if (confirmModalState === ConfirmModalState.PENDING_CONFIRMATION) {
      const _title = t('Transaction Submitted')
      setTitle(_title)

      return (
        <SwapPendingModalContent
          showIcon
          title={_title}
          currencyA={currencyA}
          currencyB={currencyB}
          amountA={amountA}
          amountB={amountB}
        >
          <AddToWalletButton
            textOptions={AddToWalletTextOptions.TEXT_WITH_ASSET}
            tokenAddress={token?.address}
            tokenSymbol={currencyB?.symbol}
            tokenDecimals={token?.decimals}
            tokenLogo={tokenLogo}
          />
        </SwapPendingModalContent>
      )
    }

    if (confirmModalState === ConfirmModalState.COMPLETED && txHash) {
      setTitle(t('Transaction receipt'))

      return (
        <SwapTransactionReceiptModalContent>
          {chainId && (
            <a
              href={getBlockExploreLink(txHash, 'transaction', chainId)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-y-2 text-sm hover:opacity-70"
            >
              {t('View on %site%', { site: getBlockExploreName(chainId) })}: {truncateHash(txHash, 8, 0)}
              <ArrowSquareOut size={16} />
            </a>
          )}

          <AddToWalletButton
            textOptions={AddToWalletTextOptions.TEXT_WITH_ASSET}
            tokenAddress={token?.address}
            tokenSymbol={currencyB?.symbol}
            tokenDecimals={token?.decimals}
            tokenLogo={tokenLogo}
          />
        </SwapTransactionReceiptModalContent>
      )
    }

    setTitle(t('Confirm Swap'))
    return (
      <TransactionConfirmSwapContent
        trade={trade}
        recipient={recipient}
        originalTrade={originalTrade}
        allowedSlippage={allowedSlippage}
        currencyBalances={currencyBalances}
        onConfirm={startSwapFlow}
        onAcceptChanges={onAcceptChanges}
      />
    )
  }, [
    isBonus,
    tokenLogo,
    trade,
    txHash,
    originalTrade,
    attemptingTxn,
    currencyBalances,
    showApproveFlow,
    swapErrorMessage,
    token,
    chainId,
    recipient,
    allowedSlippage,
    confirmModalState,
    qrUri,
    t,
    handleDismiss,
    startSwapFlow,
    onAcceptChanges,
    openSettingModal,
    setTitle,
  ])

  const isShowingLoadingAnimation = useMemo(
    () =>
      confirmModalState === ConfirmModalState.RESETTING_APPROVAL ||
      confirmModalState === ConfirmModalState.APPROVING_TOKEN ||
      confirmModalState === ConfirmModalState.APPROVE_PENDING ||
      attemptingTxn,
    [confirmModalState, attemptingTxn],
  )

  if (!chainId) return null

  return (
    <ConfirmSwapModalContainer handleDismiss={handleDismiss} title={title}>
      {topModal}
      {isShowingLoadingAnimation && !swapErrorMessage && (
        <ApproveStepFlow confirmModalState={confirmModalState} pendingModalSteps={pendingModalSteps} />
      )}
    </ConfirmSwapModalContainer>
  )
})
