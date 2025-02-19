import { ChainId } from '@pancakeswap/chains'
import { CAKE } from '@pancakeswap/tokens'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useWNativeContract } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback, useMemo } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { SendTransactionResult } from 'wagmi/actions'

interface IProps {
  chainId: number
  onDone?: (tx: SendTransactionResult) => void
}

export function useUnwrapRewardV2({ chainId, onDone }: IProps) {
  const { callWithGasPrice } = useCallWithGasPrice()
  const addTransaction = useTransactionAdder()

  const rewardToken = useMemo(() => CAKE[chainId as ChainId], [chainId])
  const nativeInfo = useNativeCurrency()
  const wNativeContract = useWNativeContract(rewardToken.address)

  const unwrapReward = useCallback(
    async (reward: number) => {
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
            text: 'Unwrap %amount% %wrap% to %native%',
            data: { amount: rewardStr, wrap: rewardToken.symbol, native: nativeInfo.symbol },
          },
        })

        return true
      } catch (e) {
        console.error('Could not withdraw', e)
        return false
      }
    },
    [nativeInfo, rewardToken, wNativeContract, callWithGasPrice, addTransaction, onDone],
  )

  return {
    unwrapReward,
  }
}
