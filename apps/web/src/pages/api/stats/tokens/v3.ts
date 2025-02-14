import { VALID_ADDRESS_REGEX } from '@pancakeswap/uikit'
import { NextApiHandler } from 'next'
import { getCachedV3TokenStats } from 'tokens/get-cached-token-stats'
import filteringTokensByKey from 'utils/filteringTokensByKey'
import { z } from 'zod'

const tokensSchema = z.object({
  searchKey: z.string().optional(),

  onlyTokenAddresses: z.preprocess(
    (v) => (typeof v === 'string' && v.length > 0 ? v.split(',') : []),
    z.string().regex(VALID_ADDRESS_REGEX).array(),
  ),

  sortBy: z.enum(['volume24H', 'volume7D', 'tvl', 'priceChange24H', 'priceChange7D']).optional().default('volume24H'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),

  skip: z.coerce.number().optional().default(0),
  limit: z.coerce.number().max(100).optional().default(10),
})

const handler: NextApiHandler = async (req, res) => {
  const { searchKey, onlyTokenAddresses, sortBy, sortDirection, skip, limit } = await tokensSchema.parseAsync(req.query)

  const tokens = await getCachedV3TokenStats()
  let filteredTokens = searchKey ? filteringTokensByKey(tokens, searchKey) : tokens

  if (onlyTokenAddresses.length > 0) {
    const onlyTokenAddressesLowerCased = onlyTokenAddresses.map((address) => address.toLowerCase())
    filteredTokens = filteredTokens.filter((token) => onlyTokenAddressesLowerCased.includes(token.id.toLowerCase()))
  }

  const useDesc = sortDirection === 'desc' ? -1 : 1

  switch (sortBy) {
    case 'volume24H': {
      filteredTokens.sort((a, b) => useDesc * (a.volumeUSD['24H'] - b.volumeUSD['24H']))
      break
    }
    case 'volume7D': {
      filteredTokens.sort((a, b) => useDesc * (a.volumeUSD['7D'] - b.volumeUSD['7D']))
      break
    }
    case 'tvl': {
      filteredTokens.sort((a, b) => useDesc * (a.tvlUSD - b.tvlUSD))
      break
    }
    case 'priceChange24H': {
      filteredTokens.sort((a, b) => useDesc * (a.priceUSD['24H'] - b.priceUSD['24H']))
      break
    }
    case 'priceChange7D': {
      filteredTokens.sort((a, b) => useDesc * (a.priceUSD['7D'] - b.priceUSD['7D']))
      break
    }
    default: {
      break
    }
  }

  res.json({ tokens: filteredTokens.slice(skip, skip + limit), totalPage: Math.ceil(filteredTokens.length / limit) })
}

export default handler
