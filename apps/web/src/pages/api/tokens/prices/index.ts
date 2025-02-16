import { NextApiHandler } from 'next'
import { getCachedTokenPrices } from 'tokens/get-cached-token-prices'

const handler: NextApiHandler = async (req, res) => {
  const prices = await getCachedTokenPrices()

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=150')
  return res.status(200).json(prices)
}

export default handler
