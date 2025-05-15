import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const useMongoCache = process.env.USE_MONGO_CACHE
  const mongodbUri = process.env.MONGODB

  return res.json({
    useMongoCache,
    mongodbUri,
  })
}

export default handler
