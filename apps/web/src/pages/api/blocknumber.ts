import { getBlockNumber } from 'lib/node-queries/get-block-number'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const blockNumber = await getBlockNumber()

  res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=5')
  res.json({ blockNumber: +blockNumber.toString() })
}

export default handler
