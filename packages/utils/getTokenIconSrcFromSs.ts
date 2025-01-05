import { Address, getAddress } from 'viem'

export default function getTokenIconSrcFromSs(address?: Address | string) {
  try {
    if (!address) return null

    return address ? `https://api.swapscanner.io/v0/tokens/${getAddress(address).toLocaleLowerCase()}/icon` : null
  } catch (e) {
    console.error(e)

    return null
  }
}
