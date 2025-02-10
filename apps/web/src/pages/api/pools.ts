import { VALID_ADDRESS_REGEX } from '@pancakeswap/uikit'
import { NextApiHandler } from 'next'

import { getCachedPoolsData } from 'pools/get-cached-pools-data'
import { parseV2Pool, parseV3Pool } from 'pools/parse-pool'
import { z } from 'zod'

type PoolParsed = ReturnType<typeof parseV2Pool> | ReturnType<typeof parseV3Pool>

const poolsSchema = z.object({
  types: z
    .array(z.enum(['v2', 'v3']))
    .min(1)
    .default(['v2', 'v3']),
  onlyPoolIds: z.array(z.string().regex(VALID_ADDRESS_REGEX)).optional(),
  // TODO: boosted only option ? (using MasterChef contract)
  sortBy: z.enum(['apr24H', 'apr7D', 'volume24H', 'volume7D', 'tvl']).optional().default('volume24H'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),

  skip: z.number().optional().default(0),
  limit: z.number().max(100).optional().default(10),
})

const handler: NextApiHandler = async (req, res) => {
  const { types, onlyPoolIds, sortBy, sortDirection, skip, limit } = await poolsSchema.parseAsync(req.query)

  const { v2Pools, v3Pools } = await getCachedPoolsData()

  const v2PoolsParsed = v2Pools.map(parseV2Pool)
  const v3PoolsParsed = v3Pools.map(parseV3Pool)

  const pools: PoolParsed[] = []

  if (onlyPoolIds) {
    const onlyPoolIdsLowerCased = onlyPoolIds.map((id) => id.toLowerCase())
    pools.push(
      ...v2PoolsParsed.filter((pool) => onlyPoolIdsLowerCased.includes(pool.id)),
      ...v3PoolsParsed.filter((pool) => onlyPoolIdsLowerCased.includes(pool.id)),
    )
  } else {
    if (types.includes('v2')) {
      pools.push(...v2PoolsParsed)
    }

    if (types.includes('v3')) {
      pools.push(...v3PoolsParsed)
    }
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
    case 'apr24H': {
      pools.sort((a, b) => useDesc * (a.apy['24H'] - b.apy['24H']))
      break
    }
    case 'apr7D': {
      pools.sort((a, b) => useDesc * (a.apy['7D'] - b.apy['7D']))
      break
    }
    default: {
      break
    }
  }

  res.status(200).json({ pools: pools.slice(skip, skip + limit) })
}

export default handler
