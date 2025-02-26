import { Token } from '@pancakeswap/swap-sdk-core'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useWNativeContract } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useTranslation } from 'next-i18next'
import { useCallback, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { SendTransactionResult } from 'wagmi/actions'

interface IProps {
  rewardToken: Token
  onDone?: (tx: SendTransactionResult) => void
}

export function useUnwrapRewardV2({ rewardToken, onDone }: IProps) {
  const { t } = useTranslation()
  const [inflight, setInflight] = useState(false)

  const { callWithGasPrice } = useCallWithGasPrice()
  const addTransaction = useTransactionAdder()

  const nativeInfo = useNativeCurrency()
  const wNativeContract = useWNativeContract(rewardToken.address)

  const unwrapReward = useCallback(
    async (reward: number) => {
      setInflight(true)
      const numeratedRewardAmount = Math.floor(reward * 10 ** rewardToken.decimals)
      const rewardStr = reward.toLocaleString(undefined, {
        minimumSignificantDigits: 6,
        maximumSignificantDigits: 6,
      })

      try {
        const txReceipt = await callWithGasPrice(wNativeContract, 'withdraw', [numeratedRewardAmount])
        onDone?.(txReceipt)

        addTransaction(txReceipt, {
          summary: `Unwrap ${rewardStr} ${rewardToken.symbol} to ${nativeInfo.symbol}`,
          translatableSummary: {
            text: 'Unwrap {{amount}} {{wrap}} to {{native}}',
            data: { amount: rewardStr, wrap: rewardToken.symbol, native: nativeInfo.symbol },
          },
        })

        return true
      } catch (e) {
        console.error('Could not withdraw', e)
        return false
      } finally {
        setInflight(false)
      }
    },
    [nativeInfo, rewardToken, wNativeContract, callWithGasPrice, addTransaction, onDone],
  )

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
    onAlert,
    inflight,
  }
}
