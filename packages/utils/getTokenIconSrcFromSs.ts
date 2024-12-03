import { getAddress } from 'viem'

export default function getTokenIconSrcFromSs(address?: string) {
  return address ? `https://api.swapscanner.io/v0/tokens/${getAddress(address).toLocaleLowerCase()}/icon` : null
}
