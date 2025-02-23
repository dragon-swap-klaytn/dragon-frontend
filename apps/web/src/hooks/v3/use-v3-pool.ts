import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/swap-sdk-core'
import { FeeAmount, Pool } from '@pancakeswap/v3-sdk'
import { PoolParsed, PoolV3Parsed } from 'pages/api/pools'
import { useMemo } from 'react'

const chainId = ChainId.KLAYTN

export function useV3Pool<T extends PoolParsed>({ poolData }: { poolData: T }): T extends PoolV3Parsed ? Pool : null {
  const pool = useMemo(() => {
    if (poolData.type !== 'v3') {
      return null as T extends PoolV3Parsed ? Pool : null
    }

    const { token0, token1, feeTier, feeProtocol, sqrtPriceX96, liquidity, tick } = poolData as PoolV3Parsed

    const tokenA = new Token(chainId, token0.id, token0.decimals, token0.symbol, token0.name)
    const tokenB = new Token(chainId, token1.id, token1.decimals, token1.symbol, token1.name)
    const _pool = new Pool(tokenA, tokenB, +feeTier as FeeAmount, sqrtPriceX96, liquidity, +tick, undefined)
    _pool.feeProtocol = +feeProtocol

    return _pool as T extends PoolV3Parsed ? Pool : null
  }, [poolData])

  return pool
}
