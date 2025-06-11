import { ChainId } from '@pancakeswap/chains'
import { masterChefV3ABI } from '@pancakeswap/v3-sdk'
import { MASTERCHEFV3_ADDRESS } from 'const'
import { getViemClients } from 'utils/viem.server'

const publicClient = getViemClients({ chainId: ChainId.KLAYTN })

const v3PoolAbi = [
  {
    inputs: [],
    name: 'lmPool',
    outputs: [{ internalType: 'contract IPancakeV3LmPool', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const lmPoolAbi = [
  {
    inputs: [],
    name: 'lmLiquidity',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardGrowthGlobalX128',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const getBoostedPools = async () => {
  const poolsLength = await publicClient.readContract({
    address: MASTERCHEFV3_ADDRESS,
    abi: masterChefV3ABI,
    functionName: 'poolLength',
  })

  const pids = Array.from({ length: Number(poolsLength) }, (_, i) => i + 1)

  const poolInfos = await Promise.all(
    pids.map(async (pid) => {
      const [allocPoint, poolAddress, token0, token1, fee, totalLiquidity, totalBoostLiquidity] =
        await publicClient.readContract({
          address: MASTERCHEFV3_ADDRESS,
          abi: masterChefV3ABI,
          functionName: 'poolInfo',
          args: [BigInt(pid)],
        })

      const lmPool = await publicClient.readContract({
        address: poolAddress,
        abi: v3PoolAbi,
        functionName: 'lmPool',
      })

      const [lmPoolLiquidity, rewardGrowthGlobalX128] = await Promise.all([
        publicClient.readContract({
          address: lmPool,
          abi: lmPoolAbi,
          functionName: 'lmLiquidity',
        }),
        publicClient.readContract({
          address: lmPool,
          abi: lmPoolAbi,
          functionName: 'rewardGrowthGlobalX128',
        }),
      ])

      return {
        pid,
        allocPoint: Number(allocPoint),
        poolAddress,
        token0,
        token1,
        fee: Number(fee),
        totalLiquidity: totalLiquidity.toString(),
        totalBoostLiquidity: totalBoostLiquidity.toString(),
        lmPool: lmPool.toLowerCase(),
        lmPoolLiquidity: lmPoolLiquidity.toString(),
        rewardGrowthGlobalX128: rewardGrowthGlobalX128.toString(),
      }
    }),
  )

  return Object.fromEntries(
    poolInfos
      .filter((pool) => pool.allocPoint > 0 && pool.totalBoostLiquidity !== '0')
      .map((pool) => [pool.poolAddress.toLowerCase(), pool]),
  )
}
