import { Token } from '@pancakeswap/swap-sdk-core'
import { useModal } from '@pancakeswap/uikit'
import ApprovalConfirmationModal from 'components/ApprovalConfirmationModal'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useWNativeContract } from 'hooks/useContract'
import useKlipQrCondition from 'hooks/useKlipQrCondition'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTokenBalance from 'hooks/useTokenBalance'
import { useTranslation } from 'next-i18next'
import { useCallback, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { SendTransactionResult } from 'wagmi/actions'

interface IProps {
  rewardToken: Token
  onDone?: (tx: SendTransactionResult) => void
  modalKey: string
}

export function useUnwrapRewardV2({ rewardToken, onDone, modalKey }: IProps) {
  const { t } = useTranslation()
  const [inflight, setInflight] = useState(false)

  const { callWithGasPrice } = useCallWithGasPrice()
  const addTransaction = useTransactionAdder()

  const nativeInfo = useNativeCurrency()
  const wNativeContract = useWNativeContract(rewardToken.address)
  const showKlipQrCode = useKlipQrCondition()

  const handleDismissConfirmation = useCallback(() => {
    setInflight(false)
  }, [setInflight])

  const [onPresentKlipTxModal, onDismissKlipTxModal] = useModal(
    <ApprovalConfirmationModal
      title={t('Confirm Transaction')}
      content={() => ''}
      pendingText={t('waiting confirm...')}
      attemptingTxn={inflight}
      customOnDismiss={handleDismissConfirmation}
    />,
    true,
    true,
    `TxConfirmationModal:unwrapRewardV2:${modalKey}`,
  )

  const unwrapReward = useCallback(
    async (reward: number) => {
      setInflight(true)
      const numeratedRewardAmount = Math.floor(reward * 10 ** rewardToken.decimals)
      const rewardStr = reward.toLocaleString(undefined, {
        minimumSignificantDigits: 6,
        maximumSignificantDigits: 6,
      })

      if (showKlipQrCode) {
        onPresentKlipTxModal()
      }

      try {
        const txReceipt = await callWithGasPrice(wNativeContract, 'withdraw', [numeratedRewardAmount])
        onDone?.(txReceipt)

        addTransaction(txReceipt, {
          type: 'unwrap',
          summary: `Unwrap ${rewardStr} ${rewardToken.symbol} to ${nativeInfo.symbol}`,
          translatableSummary: {
            text: 'Unwrap {{amount}} {{wrap}} to {{native}}',
            data: { amount: rewardStr, wrap: rewardToken.symbol, native: nativeInfo.symbol },
          },
        })

        if (showKlipQrCode) {
          onDismissKlipTxModal({ force: true })
        }

        return true
      } catch (e) {
        console.error('Could not withdraw', e)
        return false
      } finally {
        setInflight(false)
      }
    },
    [
      nativeInfo,
      rewardToken,
      wNativeContract,
      callWithGasPrice,
      addTransaction,
      onDone,
      showKlipQrCode,
      onPresentKlipTxModal,
      onDismissKlipTxModal,
    ],
  )

  const { balance } = useTokenBalance(rewardToken.address)
  const rewardBalanceStr = balance.div(10 ** rewardToken.decimals).toFixed(6)
  const unwrapAllReward = useCallback(async () => {
    setInflight(true)

    try {
      if (showKlipQrCode) {
        onPresentKlipTxModal()
      }

      const txReceipt = await callWithGasPrice(wNativeContract, 'withdraw', [balance])
      onDone?.(txReceipt)

      addTransaction(txReceipt, {
        type: 'unwrap',
        summary: `Unwrap ${rewardBalanceStr} ${rewardToken.symbol} to ${nativeInfo.symbol}`,
        translatableSummary: {
          text: 'Unwrap {{amount}} {{wrap}} to {{native}}',
          data: { amount: rewardBalanceStr, wrap: rewardToken.symbol, native: nativeInfo.symbol },
        },
      })

      if (showKlipQrCode) {
        onDismissKlipTxModal({ force: true })
      }

      return true
    } catch (e) {
      console.error('Could not unwrap', e)
      return false
    } finally {
      setInflight(false)
    }
  }, [
    nativeInfo,
    rewardToken,
    wNativeContract,
    callWithGasPrice,
    addTransaction,
    onDone,
    balance,
    showKlipQrCode,
    onPresentKlipTxModal,
    onDismissKlipTxModal,
    rewardBalanceStr,
  ])

  const onAlert = useCallback(
    async (reward: number) => {
      const alertText = t(`Are you convert RKAIA reward({{reward}}) to KAIA now?`, {
        reward,
      })

      // TODO: Replace with a proper alert component
      // eslint-disable-next-line no-alert
      const isConfirmed = reward > 0n ? window.confirm(alertText) : false

      if (!isConfirmed) {
        return false
      }

      try {
        await unwrapReward(reward)

        return true
      } catch (e) {
        console.error('Could not withdraw', e)
        return false
      }
    },
    [t, unwrapReward],
  )

  return {
    unwrapReward,
    unwrapAllReward,
    onAlert,
    inflight,
    rewardBalanceStr,
  }
}
