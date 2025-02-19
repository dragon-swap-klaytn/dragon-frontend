import { VALID_ADDRESS_REGEX } from '@pancakeswap/uikit'
import { getAddress } from 'viem'

export const duplicateChecksumPriceMap = (priceMap: Record<string, number>) => ({
  ...priceMap,
  ...Object.fromEntries(
    Object.entries(priceMap)
      .filter(([address]) => VALID_ADDRESS_REGEX.test(address))
      .flatMap(([address, price]) => [
        [getAddress(address), price],
        [address.toLowerCase(), price],
      ]),
  ),
})
