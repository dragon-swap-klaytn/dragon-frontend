import { NextApiHandler } from 'next'
import { z } from 'zod'

const FEE_PAYER_SERVER_URL = 'https://fee-delegation.kaia.io'

const feeDelegatedTxCallSchema = z.object({
  senderSignedTx: z.string(),
})

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { senderSignedTx } = await feeDelegatedTxCallSchema.parseAsync(req.body)

  if (!senderSignedTx) {
    return res.status(400).json({ error: 'Missing senderSignedTx' })
  }

  const fetchResponse = await fetch(`${FEE_PAYER_SERVER_URL}/api/signAsFeePayer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userSignedTx: { raw: senderSignedTx } }),
  })

  if (!fetchResponse.ok) {
    const errorBody = await fetchResponse.clone().text() // Try to get error body

    if (fetchResponse.status === 400 && errorBody.includes('Insufficient balance')) {
      return res.status(400).json({
        message: 'Insufficient balance for fee delegation',
      })
    }

    throw new Error(`Fee payer server request failed with status ${fetchResponse.status}: ${errorBody}`)
  }

  const jsonData = await fetchResponse.json()

  if (jsonData.error) {
    return res.status(500).json({
      message: jsonData.message,
      data: jsonData.data,
      error: jsonData.error,
    })
  }

  return res.json(jsonData.data)
}

export default handler
