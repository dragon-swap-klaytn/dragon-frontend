import { ChainId } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/sdk'
import { TokenAddressMap } from '@pancakeswap/token-lists'
import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import getTokenIconSrcFromSs from '@pancakeswap/utils/getTokenIconSrcFromSs'
import { ASSET_CDN } from 'config/constants/endpoints'
import memoize from 'lodash/memoize'
import { Address, getAddress } from 'viem'
import { bsc } from 'wagmi/chains'

// returns the checksummed address if the address is valid, otherwise returns undefined
export const safeGetAddress = memoize((value: any): Address | undefined => {
  try {
    let value_ = value
    if (typeof value === 'string' && !value.startsWith('0x')) {
      value_ = `0x${value}`
    }
    return getAddress(value_)
  } catch {
    return undefined
  }
})

export function getBlockExploreLink(
  data: string | number,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainIdOverride?: number,
): string {
  const blockExplorer = 'https://kaiascope.com'
  switch (type) {
    case 'transaction': {
      return `${blockExplorer}/tx/${data}`
    }
    case 'token': {
      return `${blockExplorer}/token/${data}`
    }
    case 'block': {
      return `${blockExplorer}/block/${data}`
    }
    case 'countdown': {
      return `${blockExplorer}/block/countdown/${data}`
    }
    default: {
      return `${blockExplorer}/address/${data}`
    }
  }
}

export function getBlockExploreName(chainIdOverride?: number) {
  return 'KaiaScope'
}

export function getBscScanLinkForNft(collectionAddress: string, tokenId: string): string {
  return `${bsc.blockExplorers.default.url}/token/${collectionAddress}?a=${tokenId}`
}

// add 10%
export function calculateGasMargin(value: bigint, margin = 1000n): bigint {
  return (value * (10000n + margin)) / 10000n
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap<ChainId>, currency?: Currency): boolean {
  if (currency?.isNative) return true
  return Boolean(currency?.isToken && defaultTokens[currency.chainId]?.[currency.address])
}

export function getChainIcon(chainId: ChainId) {
  return (
    {
      8217:
        getTokenIconSrcFromSs(ZERO_ADDRESS) ||
        'https://cdn.prod.website-files.com/666642b50954b5d26bc84836/6667a85f241d5c033f976181_KAIA%20256.png',
      1001:
        getTokenIconSrcFromSs(ZERO_ADDRESS) ||
        'https://cdn.prod.website-files.com/666642b50954b5d26bc84836/6667a85f241d5c033f976181_KAIA%20256.png',
    }[chainId] ?? `${ASSET_CDN}/web/chains/${chainId}.png`
  )
}
