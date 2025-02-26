import { useTranslation } from '@pancakeswap/localization'
import { CAKE, LEGACY_CAKE_SYMBOL } from '@pancakeswap/tokens'
import { getFullDecimalMultiplier } from '@pancakeswap/utils/getFullDecimalMultiplier'
import BigNumber from 'bignumber.js'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useWNativeContract } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback, useMemo } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'

interface IProps {
  chainId: number
  reward: bigint
}

export function useUnwrapReward({ reward, chainId }: IProps) {
  const { callWithGasPrice } = useCallWithGasPrice()
  const addTransaction = useTransactionAdder()
  const { t } = useTranslation()

  const rewardToken = useMemo(() => {
    return CAKE[chainId]
  }, [chainId])
  const nativeInfo = useNativeCurrency()
  const wNativeContract = useWNativeContract(rewardToken.address)

  const onAlert = useCallback(async () => {
    const rewardAmount = new BigNumber(reward.toString())
      .div(getFullDecimalMultiplier(rewardToken.decimals))
      .toNumber()
      .toLocaleString(undefined, {
        minimumSignificantDigits: 6,
        maximumSignificantDigits: 6,
      })

    const alertText = t(`Are you convert RKAIA reward({{reward}}) to KAIA now?`, {
      reward: rewardAmount,
    })

    // eslint-disable-next-line no-alert
    const isConfirmed = reward > 0n && rewardToken?.symbol === LEGACY_CAKE_SYMBOL ? window.confirm(alertText) : false

    if (!isConfirmed) {
      return false
    }

    try {
      const txReceipt = await callWithGasPrice(wNativeContract, 'withdraw', [reward])

      addTransaction(txReceipt, {
        summary: `Unwrap ${rewardAmount} ${rewardToken.symbol} to ${nativeInfo.symbol}`,
        translatableSummary: {
          text: 'Unwrap {{amount}} {{wrap}} to {{native}}',
          data: { amount: rewardAmount, wrap: rewardToken.symbol, native: nativeInfo.symbol },
        },
      })

      return true
    } catch (e) {
      console.error('Could not withdraw', e)
      return false
    }
  }, [reward, nativeInfo, rewardToken, wNativeContract, callWithGasPrice, addTransaction, t])

  return {
    onAlert,
  }
}
