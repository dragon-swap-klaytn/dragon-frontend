import { WKLAY_ADDRESS } from 'lib/graph-queries/const'
import { Address } from 'viem'

export const unwrapWKAIAAdress = (address: Address) => {
  if (address.toLowerCase() === WKLAY_ADDRESS) {
    return 'KAIA'
  }

  return address
}
