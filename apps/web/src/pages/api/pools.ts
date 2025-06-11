import { ChainId } from '@pancakeswap/chains'
import { fetchMasterChefV3Data } from '@pancakeswap/farms/src/fetchFarmsV3'
import { VALID_ADDRESS_REGEX } from '@pancakeswap/uikit'
import { MASTERCHEFV3_ADDRESS, TOKEN_MAPPER } from 'const'
import { FORCE_WHITELISTED_V3_POOLS } from 'lib/graph-queries/const'
import { NextApiHandler } from 'next'
import { getBoostedPools } from 'pools/get-boosted-pools'

import { getCachedPoolsData, getPoolsDataByIds } from 'pools/get-cached-pools-data'
import { parseV2Pool, parseV3Pool } from 'pools/parse-pool'
import { getCachedTokenPrices } from 'tokens/get-cached-token-prices'
import { Simplify } from 'type-fest'
import { calculateAPR } from 'utils/calculate-interests'
import { localCachedProactiveV2 } from 'utils/local-cached-proactive-v2'
import lowered from 'utils/lowered'
import { getViemClients } from 'utils/viem.server'
import { z } from 'zod'

export type PoolV2Parsed = Simplify<ReturnType<typeof parseV2Pool>>
export type PoolV3Parsed = Simplify<
  ReturnType<typeof parseV3Pool> & {
    rewardApr: number
    lmPoolLiquidity?: string
    cakePerSecond?: number
  }
>
export type PoolParsed = PoolV2Parsed | PoolV3Parsed

const poolsSchema = z.object({
  types: z.preprocess(
    (v) => (typeof v === 'string' && v.length > 0 ? v.split(',') : ['v2', 'v3']),
    z.enum(['v2', 'v3']).array().nonempty(),
  ),
  onlyPoolIds: z.preprocess(
    (v) => (typeof v === 'string' && v.length > 0 ? v.split(',') : []),
    z.string().regex(VALID_ADDRESS_REGEX).array(),
  ),
  tokenAddress: z.string().regex(VALID_ADDRESS_REGEX).optional(),
  boostedOnly: z.preprocess((v) => v === 'true', z.boolean()).optional(),
  searchKey: z.string().optional(),
  sortBy: z.enum(['apy24H', 'apy7D', 'volume24H', 'volume7D', 'tvl']).optional().default('volume24H'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),

  skip: z.coerce.number().optional().default(0),
  limit: z.coerce.number().max(100).optional().default(10),
})

function filteredByTokenAddress(pools: PoolParsed[], tokenAddress?: string) {
  if (!tokenAddress) {
    return pools
  }

  return pools.filter(
    (pool) => lowered(pool.token0.id) === lowered(tokenAddress) || lowered(pool.token1.id) === lowered(tokenAddress),
  )
}

function filteredBySearchKey(pool: PoolParsed, searchKey?: string) {
  if (!searchKey) {
    return true
  }

  const tokens = TOKEN_MAPPER[lowered(searchKey)] || []

  return (
    [pool.token0.symbol, pool.token1.symbol].some((symbol) => lowered(symbol).includes(lowered(searchKey))) ||
    [pool.token0.name, pool.token1.name].some((name) => lowered(name).includes(lowered(searchKey))) ||
    [pool.token0.id, pool.token1.id].some((id) => lowered(id).includes(lowered(searchKey))) ||
    lowered(pool.id).includes(lowered(searchKey)) ||
    tokens.some(
      (token) =>
        [pool.token0.symbol, pool.token1.symbol].some((symbol) => lowered(symbol).includes(lowered(token.symbol))) ||
        [pool.token0.name, pool.token1.name].some((name) => lowered(name).includes(lowered(token.name))) ||
        [pool.token0.id, pool.token1.id].some((id) => lowered(id).includes(lowered(token.address))),
    )
  )
}

// special logic for KAIA/USD₮ and USDT/USD₮ pools
localCachedProactiveV2(
  () =>
    getPoolsDataByIds([
      // eslint-disable-next-line address/addr-type
      '0x938779a1989e7635fdac1e040631255c3555708e', // KAIA/USD₮
      // eslint-disable-next-line address/addr-type
      '0x6f4e769d2dccfae8bcc1918d991ab1bc6b4a404c', // USDT/USD₮
    ]),
  {
    interval: 1000 * 60,
    logPrefix: '[/api/pools] proactive update for KAIA/USD₮ and USDT/USD₮',
  },
)

const getCachedBoostedPools = localCachedProactiveV2(getBoostedPools, {
  interval: 1000 * 60 * 5, // 5 minutes
  logPrefix: '[/api/pools] boosted pools',
}).getData

const getCachedMasterChefV3Data = localCachedProactiveV2(async () => {
  const { poolLength, totalAllocPoint, latestPeriodCakePerSecond } = await fetchMasterChefV3Data({
    provider: getViemClients,
    masterChefAddress: MASTERCHEFV3_ADDRESS,
    chainId: ChainId.KLAYTN,
  })

  return {
    poolLength: Number(poolLength),
    totalAllocPoint: Number(totalAllocPoint),
    cakePerSecond: Number(latestPeriodCakePerSecond) / 1e18 / 1e12, // convert to KAIA
  }
}).getData

const handler: NextApiHandler = async (req, res) => {
  const { types, onlyPoolIds, tokenAddress, boostedOnly, searchKey, sortBy, sortDirection, skip, limit } =
    await poolsSchema.parseAsync(req.query)

  try {
    const [{ v2Pools, v3Pools }, boostedPools, masterChefData, prices] = await Promise.all([
      getCachedPoolsData(),
      getCachedBoostedPools(),
      getCachedMasterChefV3Data(),
      getCachedTokenPrices(),
    ])

    const { poolLength: _, cakePerSecond, totalAllocPoint } = masterChefData

    if (onlyPoolIds.length > 0) {
      const onlyPoolIdsLowerCased = onlyPoolIds.map((id) => lowered(id))
      const missingPoolIds = onlyPoolIdsLowerCased.filter(
        (id) => !v2Pools.some((pool) => pool.id === id) && !v3Pools.some((pool) => pool.id === id),
      )

      if (missingPoolIds.length > 0) {
        const { v2Pools: missingV2Pools, v3Pools: missingV3Pools } = await getPoolsDataByIds(missingPoolIds).catch(
          (err) => {
            console.error(`Failed to fetch missing pools: ${missingPoolIds.join(',')}`, err)
            return { v2Pools: [], v3Pools: [] }
          },
        )

        v2Pools.push(...missingV2Pools)
        v3Pools.push(...missingV3Pools)
      }
    }

    const v2PoolsParsed = v2Pools.map(parseV2Pool)
    const v3PoolsParsed = v3Pools.map((pool) => {
      const boostedPool = boostedPools[pool.id]
      if (!boostedPool) {
        return parseV3Pool(pool, { useVolumeOverFee: FORCE_WHITELISTED_V3_POOLS.includes(pool.id) })
      }

      const poolCakePerSecond = (boostedPool.allocPoint / totalAllocPoint) * +cakePerSecond

      const rewardApr = calculateAPR({
        interest: poolCakePerSecond * prices.KAIA,
        principal: pool.tvlUSD.current * (+boostedPool.lmPoolLiquidity / +pool.liquidity),
        duration: 1_000,
      })

      return {
        ...parseV3Pool(pool, { useVolumeOverFee: FORCE_WHITELISTED_V3_POOLS.includes(pool.id) }),
        rewardApr: Number.isFinite(rewardApr) ? rewardApr : 0,
        lmPoolLiquidity: boostedPool.lmPoolLiquidity,
        cakePerSecond: poolCakePerSecond,
      }
    })

    const filteredV2Pools = filteredByTokenAddress(v2PoolsParsed, tokenAddress).filter((pool) =>
      filteredBySearchKey(pool, searchKey),
    )
    const filteredV3Pools = filteredByTokenAddress(v3PoolsParsed, tokenAddress).filter((pool) =>
      filteredBySearchKey(pool, searchKey),
    )

    let pools: PoolParsed[] = []

    if (onlyPoolIds.length > 0) {
      const onlyPoolIdsLowerCased = onlyPoolIds.map((id) => lowered(id))
      pools.push(
        ...filteredV2Pools.filter((pool) => onlyPoolIdsLowerCased.includes(pool.id)),
        ...filteredV3Pools.filter((pool) => onlyPoolIdsLowerCased.includes(pool.id)),
      )
    } else {
      if (types.includes('v2')) {
        pools.push(...filteredV2Pools)
      }

      if (types.includes('v3')) {
        pools.push(...filteredV3Pools)
      }
    }

    if (boostedOnly) {
      pools = pools.filter(
        (pool) =>
          +boostedPools[pool.id]?.allocPoint > 0 &&
          (pool as PoolV3Parsed)?.rewardApr &&
          (pool as PoolV3Parsed).rewardApr > 0,
      )
    }

    const useDesc = sortDirection === 'desc' ? -1 : 1

    switch (sortBy) {
      case 'volume24H': {
        pools.sort((a, b) => useDesc * ((a.volumeUSD['24H'] ?? 0) - (b.volumeUSD['24H'] ?? 0)))
        break
      }
      case 'volume7D': {
        pools.sort((a, b) => useDesc * ((a.volumeUSD['7D'] ?? 0) - (b.volumeUSD['7D'] ?? 0)))
        break
      }
      case 'apy24H': {
        pools.sort(
          (a, b) =>
            useDesc *
            ((a.apy['24H'] ?? 0) +
              ((a as PoolV3Parsed).rewardApr ?? 0) -
              (b.apy['24H'] ?? 0) -
              ((b as PoolV3Parsed).rewardApr ?? 0)),
        )
        break
      }
      case 'apy7D': {
        pools.sort(
          (a, b) =>
            useDesc *
            ((a.apy['7D'] ?? 0) +
              ((a as PoolV3Parsed).rewardApr ?? 0) -
              (b.apy['7D'] ?? 0) -
              ((b as PoolV3Parsed).rewardApr ?? 0)),
        )
        break
      }
      case 'tvl': {
        pools.sort((a, b) => useDesc * (a.tvlUSD.current - b.tvlUSD.current))
        break
      }
      default: {
        break
      }
    }

    res.status(200).json({
      pools: pools.slice(skip, skip + limit),
      totalPage: Math.ceil(pools.length / limit),
      totalCount: pools.length,
    })
  } catch (err) {
    console.error('/api/pools', err)

    throw err
  }
}

export default handler
