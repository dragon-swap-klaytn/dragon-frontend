import { NextApiHandler } from 'next'
import { getCachedV2TokenStats } from 'tokens/get-cached-token-stats'
import { z } from 'zod'

const tokensSchema = z.object({
  sortBy: z.enum(['volume24H', 'volume7D', 'tvl', 'priceChange24H', 'priceChange7D']).optional().default('volume24H'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),

  skip: z.coerce.number().optional().default(0),
  limit: z.coerce.number().max(100).optional().default(10),
})

const handler: NextApiHandler = async (req, res) => {
  const { sortBy, sortDirection, skip, limit } = await tokensSchema.parseAsync(req.query)

  const tokens = await getCachedV2TokenStats()

  const useDesc = sortDirection === 'desc' ? -1 : 1

  switch (sortBy) {
    case 'volume24H': {
      tokens.sort((a, b) => useDesc * (a.volumeUSD['24H'] - b.volumeUSD['24H']))
      break
    }
    case 'volume7D': {
      tokens.sort((a, b) => useDesc * (a.volumeUSD['7D'] - b.volumeUSD['7D']))
      break
    }
    case 'tvl': {
      tokens.sort((a, b) => useDesc * (a.tvlUSD - b.tvlUSD))
      break
    }
    case 'priceChange24H': {
      tokens.sort((a, b) => useDesc * (a.priceUSD['24H'] - b.priceUSD['24H']))
      break
    }
    case 'priceChange7D': {
      tokens.sort((a, b) => useDesc * (a.priceUSD['7D'] - b.priceUSD['7D']))
      break
    }
    default: {
      break
    }
  }

  res.json({ tokens: tokens.slice(skip, skip + limit) })
}

export default handler
