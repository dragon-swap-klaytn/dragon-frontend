import { Db, MongoClient, type MongoClientOptions } from 'mongodb'

let clientPromise: Promise<MongoClient>
let db: Db

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017'

const options: MongoClientOptions = {
  ignoreUndefined: true,
}

export const getDb = async (): Promise<Db> => {
  if (!db) {
    const mongoClient = new MongoClient(MONGODB, options)

    clientPromise = mongoClient.connect()

    const client = await clientPromise
    db = client.db('dragonswap')
  }

  return db
}
