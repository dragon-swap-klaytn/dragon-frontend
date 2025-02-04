import { ChainId, ERC20Token } from '@pancakeswap/sdk'
import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import { localCached } from 'lib/localCached'
import { NextApiHandler } from 'next'
import { Address } from 'viem'

const SS_TOKENS_API = 'https://api.swapscanner.io/v0/tokens'

type TokenMap = {
  [address: Address]: {
    address: string
    symbol: string
    name: string
    decimals: number
  }
}

type TokenMapWithERC20 = { [address: Address]: ERC20Token }

async function fetchTokenMapFromSs() {
  const res = await fetch(SS_TOKENS_API)
  const parsed = (await res.json()) as TokenMap

  const parsedTokens = Object.values(parsed).reduce((acc, token) => {
    if (token.address === ZERO_ADDRESS) return acc

    return {
      ...acc,
      [token.address as Address]: {
        chainId: ChainId.KLAYTN,
        address: token.address,
        decimals: +token.decimals,
        symbol: token.symbol,
        name: token.name,
      } as ERC20Token,
    }
  }, {} as TokenMapWithERC20)

  return parsedTokens
}

const getCahcedTokenMapFromSs = localCached<TokenMapWithERC20>(fetchTokenMapFromSs, {
  ttl: 1_000 * 60 * 10, // 10 minutes
})

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const tokenMap = await getCahcedTokenMapFromSs()

    return res.status(200).json(tokenMap)
  }

  return res.status(405).end()
}

export default handler
