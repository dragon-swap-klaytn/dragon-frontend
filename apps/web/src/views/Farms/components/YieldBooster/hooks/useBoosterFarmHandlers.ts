import { useCallback } from 'react'

import { BOOSTED_FARM_GAS_LIMIT } from 'config'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useBCakeFarmBoosterContract } from 'hooks/useContract'

const useBoosterFarmHandlers = (farmPid: number, onDone) => {
  const farmBoosterContract = useBCakeFarmBoosterContract()
  const { fetchWithCatchTxError, loading: isConfirming } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()

  const activate = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(farmBoosterContract, 'activate', [BigInt(farmPid)], { gas: BOOSTED_FARM_GAS_LIMIT })
    })

    if (receipt?.status && onDone) {
      onDone()
    }
  }, [farmPid, farmBoosterContract, callWithGasPrice, fetchWithCatchTxError, onDone])

  const deactivate = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(farmBoosterContract, 'deactive', [BigInt(farmPid)], { gas: BOOSTED_FARM_GAS_LIMIT })
    })

    if (receipt?.status && onDone) {
      onDone()
    }
  }, [farmPid, farmBoosterContract, callWithGasPrice, fetchWithCatchTxError, onDone])

  return { activate, deactivate, isConfirming }
}

export default useBoosterFarmHandlers
