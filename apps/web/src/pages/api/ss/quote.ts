import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util'
import { REFERRER_FEE_ACCOUNT, SIGNER_PK, SS_REFERRER_FEE_NUMERATOR } from 'const'
import { Wallet } from 'ethers'
import { NextApiHandler } from 'next'
import crypto from 'node:crypto'
import { Simplify } from 'type-fest'
import { Address } from 'viem'
import { z } from 'zod'

type SsEthTx = {
  from: Address
  to: Address
  data: Address
  value: Address
  type: string
  maxPriorityFeePerGas: string
  maxFeePerGas: string
}
type SsKaiaTx = {
  from: Address
  to: Address
  data: Address
  value: Address
  type: string
  gasPrice: string
}
type SsKlipTx = {
  bappName: string
  from: Address
  to: Address
  value: Address
  abi: string
  params: string
}

type SsQuote = {
  input: {
    address: string
    balance: string
    amount: string
  }
  output: {
    address: string
    balance: string
  }
  quote: {
    priceImpact: number
    output: {
      recipient: string
      minimumAmount: string
      estimatedAmountDeductingFee: string
    }
    fees: {
      type: 'referrer' | 'swapscanner'
      fee: {
        address: string
        amount: string
      }
      recipient: string
    }[]
    routing: {
      path: {
        token: string
        subPaths: {
          exchange: string
          fraction: 1
        }[]
      }[]
    }[]
    swapTx: {
      type: 'swap'
      txs: {
        eth: SsEthTx
        klay: SsKaiaTx
        klip: SsKlipTx
      }
    }
    errors: {
      message: 'insufficient_input_token_allowance' | 'insufficient_input_token_balance'
      tx?: {
        type: 'approve'
        txs: {
          eth: SsEthTx
          klay: SsKaiaTx
          klip: SsKlipTx
        }
      }
    }[]
  }
}

export type QuoteResponse = Simplify<{
  type: 'swap' | 'approve'
  recipient: Address
  input: {
    address: Address
    amount: string
  }
  output: {
    address: Address
    minimumAmount: string
    estimatedAmountDeductingFee: string
  }
  priceImpact: number
  fees: {
    type: 'referrer' | 'swapscanner'
    address: Address
    amount: string
  }[]
  tx: { data: Address; to: Address; value: Address; from: Address }
}>

// while the account here does not need to have any balance, it needs to be a valid address.
let referrerAccount = ''

const VALID_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

const quoteSchema = z.object({
  slippage: z.string().regex(/^\d+$/).default('100'), // slippage in basis points
  from: z.string().regex(VALID_ADDRESS_REGEX), // wallet or contract address that would like to perform a swap
  to: z.string().regex(VALID_ADDRESS_REGEX), // wallet or contract address that would like to receive the swapped token
  tokenInAddress: z.string().regex(VALID_ADDRESS_REGEX), // address of the token that the from wallet would like to provide
  tokenOutAddress: z.string().regex(VALID_ADDRESS_REGEX), // address of the token that the from wallet would like to receive
  amount: z.string().regex(/^\d+$/), // amount of tokenInAddress that the from wallet would like to provide (numerated with the decimals of the tokenInAddress)
})

const handler: NextApiHandler = async (req, res) => {
  const { slippage, from, to, tokenInAddress, tokenOutAddress, amount } = await quoteSchema.parseAsync(req.query)

  try {
    if (!SIGNER_PK) {
      res.status(500).json({ error: 'SIGNER_PK is not set' })
    }

    if (!referrerAccount) {
      const wallet = new Wallet(SIGNER_PK)
      referrerAccount = wallet.address.toLowerCase()
    }

    const salt = `0x${crypto.randomBytes(32).toString('hex')}` as any

    const message = {
      issuedAt: Math.floor(Date.now() / 1000),
      slippage,

      // from is a wallet (or contract) address that would like to perform a swap.
      from: from.toLowerCase(),

      // to is a wallet (or contract) address that would like to receive the swapped token.
      // In most cases, this should be the same as `from`.
      to: to.toLowerCase(),

      // tokenInAddress is the address of the token that the from wallet would like to provide.
      tokenInAddress: tokenInAddress.toLowerCase(),

      // tokenOutAddress is the address of the token that the from wallet would like to receive.
      tokenOutAddress: tokenOutAddress.toLowerCase(),

      // amount is the amount of tokenInAddress that the from wallet would like to provide (numerated
      // with the decimals of the tokenInAddress).
      amount,

      // referrerFeeToken is the token that the referrer would like to receive as a fee:
      // - `0`: no fee
      // - `1`: input token
      // - `2`: output token
      referrerFeeToken: '1',

      // referrerFee is the amount of referrerFeeToken that the referrer would like to receive as a
      // fee in basis points.
      // e.g. for 0.1%, set `referrerFee` to 10.
      referrerFee: SS_REFERRER_FEE_NUMERATOR,

      // referrerFeeTo is the address that the referrer would like to receive the referrer fee.
      referrerFeeTo: REFERRER_FEE_ACCOUNT,

      // payWithSCNR is a boolean that indicates whether the from wallet would like to pay the
      // Swapscanner fee with SCNR.
      payWithSCNR: false,
    }

    // sign the data (signTypedData_v4).
    const signature = signTypedData({
      privateKey: SIGNER_PK as any,
      data: {
        message,
        // all the entries in the domain field are fixed constants for now, except for the salt.
        domain: {
          name: 'Swapscanner Navigator',
          version: 'v2',
          chainId: 8217,
          verifyingContract: '0x8888888888888888888888888888888888888888',
          salt,
        },
        // all the remaining fields are fixed constants.
        primaryType: 'QuoteRequestV2',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
            { name: 'salt', type: 'bytes32' },
          ],
          QuoteRequestV2: [
            { name: 'issuedAt', type: 'uint256' },
            { name: 'slippage', type: 'uint16' },
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenInAddress', type: 'address' },
            { name: 'tokenOutAddress', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'referrerFeeToken', type: 'uint8' },
            { name: 'referrerFee', type: 'uint16' },
            { name: 'referrerFeeTo', type: 'address' },
            { name: 'payWithSCNR', type: 'bool' },
          ],
        },
      },
      version: SignTypedDataVersion.V4,
    })

    const url = new URL('https://api.swapscanner.io/api/v2/quote')
    url.searchParams.set('salt', salt)
    url.searchParams.set('referrer', referrerAccount)
    url.searchParams.set('signature', signature)
    Object.entries(message).forEach(([key, value]) => url.searchParams.set(key, value as any))

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      console.error('/api/quote', errorText)
      throw new Error(`Failed to fetch quote: ${errorText}`)
    }

    const data = (await response.json()) as SsQuote

    const approvalTxs = data?.quote.errors?.find(
      (error) => error.message === 'insufficient_input_token_allowance' && error.tx?.type === 'approve',
    )?.tx?.txs
    const swapTxs = data.quote.swapTx.txs

    const quoteResponse: QuoteResponse = {
      type: approvalTxs ? 'approve' : data.quote.swapTx.type,
      recipient: data.quote.output.recipient.toLowerCase() as Address,
      input: {
        address: data.input.address.toLowerCase() as Address,
        amount: data.input.amount,
      },
      output: {
        address: data.output.address.toLowerCase() as Address,
        minimumAmount: data.quote.output.minimumAmount,
        estimatedAmountDeductingFee: data.quote.output.estimatedAmountDeductingFee,
      },
      priceImpact: data.quote.priceImpact,
      fees: data.quote.fees.map((fee) => ({
        type: fee.type,

        address: fee.fee.address.toLowerCase() as Address,
        amount: fee.fee.amount,
      })),
      tx: approvalTxs?.eth || swapTxs.eth,
    }

    res.status(200).json(quoteResponse)
  } catch (err) {
    console.error('/api/ss/quote', referrerAccount, err)

    throw err
  }
}

export default handler
