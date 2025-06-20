import { ChainId, Token } from '@pancakeswap/sdk'
import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import { DEFAULT_TOKEN_LIST } from 'const'
import { NextApiHandler } from 'next'
import { getCachedV2TokenStats, getCachedV3TokenStats } from 'tokens/get-cached-token-stats'
import { localCachedV2 } from 'utils/localCachedV2'
import { Address } from 'viem'
import { z } from 'zod'

const SS_TOKENS_API = 'https://api.swapscanner.io/v1/tokens?includeFiltered=true'

type TokenMap = { [address: Address]: Token }

async function fetchTokenMap() {
  const [v3Tokens, v2Tokens] = await Promise.all([getCachedV3TokenStats(), getCachedV2TokenStats()])

  const filteredV2Tokens = v2Tokens.filter((token) => !v3Tokens.find((t) => t.id === token.id))

  const tokenMap = [...v3Tokens, ...filteredV2Tokens].reduce(
    (acc, token) => ({
      ...acc,
      [token.id]: new Token(ChainId.KLAYTN, token.id, token.decimals, token.symbol, token.name),
    }),
    {},
  )

  return tokenMap
}

const getCachedTokenMap = localCachedV2<TokenMap>(fetchTokenMap, {
  ttl: 1_000 * 60 * 10, // 10 minutes
}).cachedFetcher

async function fetchTokenMapFromSs() {
  const res = await fetch(SS_TOKENS_API)
  const parsed = (await res.json()) as TokenMap

  const parsedTokens = Object.values(parsed).reduce(
    (acc, token) => {
      if (token.address === ZERO_ADDRESS) return acc

      return {
        ...acc,
        [token.address]: new Token(ChainId.KLAYTN, token.address, +token.decimals, token.symbol, token.name),
      }
    },

    {} as TokenMap,
  )

  return parsedTokens
}

const getCachedTokenMapFromSs = localCachedV2<TokenMap>(fetchTokenMapFromSs, {
  ttl: 1_000 * 60 * 10, // 10 minutes
}).cachedFetcher

const tokensSchema = z.object({
  poolOnly: z.preprocess((v) => v === 'true', z.coerce.boolean()),
})

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const { poolOnly } = await tokensSchema.parseAsync(req.query)

    const [tokenMap, tokenMapFromSs] = await Promise.all([
      getCachedTokenMap(),
      !poolOnly ? getCachedTokenMapFromSs() : new Promise<TokenMap>((resolve) => resolve({})),
    ])

    const defaultTokens = DEFAULT_TOKEN_LIST.reduce(
      (acc, token) => ({
        ...acc,
        [token.address]: new Token(ChainId.KLAYTN, token.address as Address, token.decimals, token.symbol, token.name),
      }),
      {},
    ) as TokenMap

    return res.status(200).json({ ...defaultTokens, ...tokenMap, ...tokenMapFromSs })
  }

  return res.status(405).end()
}

export default handler
