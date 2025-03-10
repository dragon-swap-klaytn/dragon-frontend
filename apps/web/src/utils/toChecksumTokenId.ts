import { ChainId, Native } from '@pancakeswap/sdk'
import { WKLAY_ADDRESS } from 'lib/graph-queries/const'
import { Address } from 'viem'

export default function toChecksumTokenId(address: Address) {
  if (address.toLowerCase() === WKLAY_ADDRESS.toLowerCase()) {
    const nativeToken = Native.onChain(ChainId.KLAYTN)
    return nativeToken.symbol
  }

  return address
}
