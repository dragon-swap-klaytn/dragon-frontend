import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import { NextApiHandler } from 'next'
import { localCachedV2 } from 'utils/localCachedV2'
import { Address } from 'viem'

const SS_PRICES_API = 'https://api.swapscanner.io/api/v1/tokens/prices'

type PriceMap = { [address: Address]: number }
async function fetchPricesFromSs() {
  const res = await fetch(SS_PRICES_API)

  if (!res.ok) {
    throw new Error('Failed to fetch prices from SwapScanner')
  }

  return res.json() as Promise<PriceMap>
}

const getCahcedPricesFromSs = localCachedV2(fetchPricesFromSs, {
  ttl: 1_000 * 10, // 10s
}).cachedFetcher

const handler: NextApiHandler = async (req, res) => {
  const priceMap = await getCahcedPricesFromSs()

  return res.json({
    ...priceMap,
    // WKLAY
    ['0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432'.toLowerCase()]: priceMap[ZERO_ADDRESS],
    KAIA: priceMap[ZERO_ADDRESS],
  })
}

export default handler
