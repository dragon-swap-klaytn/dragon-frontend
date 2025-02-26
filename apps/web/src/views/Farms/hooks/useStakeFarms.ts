import { useMasterchef } from 'hooks/useContract'
import { useCallback } from 'react'
import { useFeeDataWithGasPrice } from 'state/user/hooks'
import { stakeFarm } from 'utils/calls'

const useStakeFarms = (pid: number) => {
  const { gasPrice } = useFeeDataWithGasPrice()

  const masterChefContract = useMasterchef()

  const handleStake = useCallback(
    async (amount: string) => {
      return stakeFarm(masterChefContract, pid, amount, gasPrice)
    },
    [masterChefContract, pid, gasPrice],
  )

  return { onStake: handleStake }
}

export default useStakeFarms
