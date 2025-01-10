import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import { localCached } from 'lib/localCached'
import { NextApiHandler } from 'next'
import { Address } from 'viem'

const SS_PRICES_API = 'https://api.swapscanner.io/api/v1/tokens/prices'

type PriceMap = { [address: Address]: number }
async function fetchPricesFromSs() {
  const res = await fetch(SS_PRICES_API)
  return res.json() as Promise<PriceMap>
}

const getCahcedPricesFromSs = localCached<PriceMap>(fetchPricesFromSs, {
  ttl: 1_000 * 10, // 10s
})

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const priceMap = await getCahcedPricesFromSs()

    return res.status(200).json({
      ...priceMap,
      // WKLAY
      ['0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432'.toLowerCase()]: priceMap[ZERO_ADDRESS],
    })
  }

  return res.status(405).end()
}

export default handler
