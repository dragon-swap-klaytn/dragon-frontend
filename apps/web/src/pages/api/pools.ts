import { ChainId } from '@pancakeswap/chains'
import { createFarmFetcherV3 } from '@pancakeswap/farms'
import { farmsV3ConfigChainMap } from '@pancakeswap/farms/constants/v3'
import { VALID_ADDRESS_REGEX } from '@pancakeswap/uikit'
import { getCachedTokenPricesFromSwapscanner } from 'lib/ss'
import { NextApiHandler } from 'next'

import { getCachedPoolsData, getPoolsDataByIds } from 'pools/get-cached-pools-data'
import { parseV2Pool, parseV3Pool } from 'pools/parse-pool'
import { getCachedTokenPrices } from 'tokens/get-cached-token-prices'
import { Simplify } from 'type-fest'
import { calculateAPR } from 'utils/calculate-interests'
import { duplicateChecksumPriceMap } from 'utils/duplicate-checksum-price-map'
import { getViemClients } from 'utils/viem.server'
import { z } from 'zod'

export type PoolV2Parsed = Simplify<ReturnType<typeof parseV2Pool>>
export type PoolV3Parsed = Simplify<
  ReturnType<typeof parseV3Pool> & {
    rewardApr: number
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
    (pool) =>
      pool.token0.id.toLowerCase() === tokenAddress.toLowerCase() ||
      pool.token1.id.toLowerCase() === tokenAddress.toLowerCase(),
  )
}

function filteredBySearchKey(pool: PoolParsed, searchKey?: string) {
  if (!searchKey) {
    return true
  }

  return (
    pool.token0.symbol.toLowerCase().includes(searchKey.toLowerCase()) ||
    pool.token1.symbol.toLowerCase().includes(searchKey.toLowerCase()) ||
    pool.token0.name.toLowerCase().includes(searchKey.toLowerCase()) ||
    pool.token1.name.toLowerCase().includes(searchKey.toLowerCase()) ||
    pool.id.toLowerCase().includes(searchKey.toLowerCase()) ||
    pool.token0.id.toLowerCase().includes(searchKey.toLowerCase()) ||
    pool.token1.id.toLowerCase().includes(searchKey.toLowerCase())
  )
}

const farmsV3 = farmsV3ConfigChainMap[ChainId.KLAYTN]
const farmFetcherV3 = createFarmFetcherV3(getViemClients)

const handler: NextApiHandler = async (req, res) => {
  const { types, onlyPoolIds, tokenAddress, boostedOnly, searchKey, sortBy, sortDirection, skip, limit } =
    await poolsSchema.parseAsync(req.query)

  const [{ v2Pools, v3Pools }, prices, ssPrices] = await Promise.all([
    getCachedPoolsData(),
    getCachedTokenPrices(),
    // use swapscanner prices as a fallback
    getCachedTokenPricesFromSwapscanner().catch((err) => {
      console.error('/api/pools', err)
      return {}
    }),
  ])

  const commonPrice = duplicateChecksumPriceMap({ ...ssPrices, ...prices })

  const {
    farmsWithPrice,
    cakePerSecond,
    totalAllocPoint: _,
  } = await farmFetcherV3.fetchFarms({
    chainId: ChainId.KLAYTN,
    farms: farmsV3,
    commonPrice,
  })

  const lpAddressToPoolWeights = Object.fromEntries(
    farmsWithPrice.map((farm) => [farm.lpAddress.toLowerCase(), +farm.poolWeight]),
  )

  if (onlyPoolIds.length > 0) {
    const onlyPoolIdsLowerCased = onlyPoolIds.map((id) => id.toLowerCase())
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
    const rewardApr = calculateAPR({
      interest: lpAddressToPoolWeights[pool.id] * +cakePerSecond * prices.KAIA,
      principal: pool.tvlUSD.current,
      duration: 1_000,
    })

    return {
      ...parseV3Pool(pool),
      rewardApr: Number.isFinite(rewardApr) ? rewardApr : 0,
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
    const onlyPoolIdsLowerCased = onlyPoolIds.map((id) => id.toLowerCase())
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
        lpAddressToPoolWeights[pool.id] > 0 &&
        (pool as PoolV3Parsed)?.rewardApr &&
        (pool as PoolV3Parsed).rewardApr > 0,
    )
  }

  const useDesc = sortDirection === 'desc' ? -1 : 1

  switch (sortBy) {
    case 'volume24H': {
      pools.sort((a, b) => useDesc * (a.volumeUSD['24H'] - b.volumeUSD['24H']))
      break
    }
    case 'volume7D': {
      pools.sort((a, b) => useDesc * (a.volumeUSD['7D'] - b.volumeUSD['7D']))
      break
    }
    case 'apy24H': {
      pools.sort(
        (a, b) =>
          useDesc *
          (a.apy['24H'] + ((a as PoolV3Parsed).rewardApr ?? 0) - b.apy['24H'] - ((b as PoolV3Parsed).rewardApr ?? 0)),
      )
      break
    }
    case 'apy7D': {
      pools.sort(
        (a, b) =>
          useDesc *
          (a.apy['7D'] + ((a as PoolV3Parsed).rewardApr ?? 0) - b.apy['7D'] - ((b as PoolV3Parsed).rewardApr ?? 0)),
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
}

export default handler
