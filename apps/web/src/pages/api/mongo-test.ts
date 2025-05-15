import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  console.log('=== Environment Variables in API Route ===')
  console.log(process.env)
  console.log('========================================')

  const useMongoCache = process.env.USE_MONGO_CACHE ?? null
  const mongodbUri = process.env.MONGODB ?? null
  const nextPublicGraph = process.env.NEXT_PUBLIC_DGSWAP_GATEWAY ?? null
  const graph = process.env.NEXT_DGSWAP_GATEWAY ?? null

  return res.json({
    useMongoCache,
    mongodbUri,
    nextPublicGraph,
    graph,
  })
}

export default handler
