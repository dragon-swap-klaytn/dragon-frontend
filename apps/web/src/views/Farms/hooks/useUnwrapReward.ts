import { useCallback, useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { WNATIVE } from '@pancakeswap/sdk'
import { CAKE_SYMBOL } from '@pancakeswap/tokens'
import { formatBigInt } from '@pancakeswap/utils/formatBalance'
import { useWNativeContract } from 'hooks/useContract'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useTransactionAdder } from 'state/transactions/hooks'
import useNativeCurrency from "hooks/useNativeCurrency";

interface IProps {
  chainId: number,
  reward: bigint
}

export function useUnwrapReward({ reward, chainId }: IProps) {
  const { callWithGasPrice } = useCallWithGasPrice()
  const wNativeContract = useWNativeContract()
  const addTransaction = useTransactionAdder()
  const { t } = useTranslation()

  const nativeInfo = useNativeCurrency()
  const wNativeInfo = useMemo(() => {
    return WNATIVE[chainId]
  }, [chainId])
  const onAlert = useCallback(async () => {
    const rewardAmount = formatBigInt(reward, 4)
    const alertText = t(`Are you convert %wrap% reward(%reward%) to %native% now?`, {
      wrap: wNativeInfo.symbol,
      native: nativeInfo.symbol,
      reward: rewardAmount
    })
    const isConfirmed = wNativeInfo?.symbol === CAKE_SYMBOL ? window.confirm(alertText) : false

    if (!isConfirmed) {
      return false
    }

    try {
      const txReceipt = await callWithGasPrice(wNativeContract, 'withdraw', [reward])

      addTransaction(txReceipt, {
        summary: `Unwrap ${rewardAmount} ${wNativeInfo.symbol} to ${nativeInfo.symbol}`,
        translatableSummary: { text: 'Unwrap %amount% %wrap% to %native%', data: { amount: rewardAmount, wrap: wNativeInfo.symbol, native: nativeInfo.symbol } }
      })

      return true
    } catch(e) {
      console.error('Could not withdraw', e)
      return false
    }
  }, [reward, nativeInfo, wNativeInfo, wNativeContract, callWithGasPrice])

  return {
    onAlert
  }
}