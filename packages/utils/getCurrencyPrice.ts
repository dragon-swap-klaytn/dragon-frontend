import { ChainId } from '@pancakeswap/chains'
import { ZERO_ADDRESS } from '@pancakeswap/uikit'

// duck typing for native currency, token, token info
export type CurrencyParams =
  | {
      chainId: ChainId
      address: `0x${string}`
      isNative?: false
    }
  | {
      chainId: ChainId
      isNative: true
    }

export type CurrencyKey = `${number}:${string}`

export type CurrencyUsdResult = Record<CurrencyKey, number>

export function getCurrencyKey(currencyParams?: CurrencyParams): CurrencyKey | undefined {
  if (!currencyParams) {
    return undefined
  }

  if ('isNative' in currencyParams && currencyParams.isNative === true) {
    return `${currencyParams.chainId}:${ZERO_ADDRESS}`
  }
  const { chainId, address } = currencyParams
  return `${chainId}:${address.toLowerCase()}`
}

export function getCurrencyListKey(currencyListParams?: CurrencyParams[]): string | undefined {
  if (!currencyListParams) {
    return undefined
  }

  const currencyKeys = currencyListParams.map(getCurrencyKey).filter((key): key is CurrencyKey => !!key)

  const uniqueKeys = [...new Set(currencyKeys)]

  return uniqueKeys.join(',')
}

export async function getCurrencyUsdPrice(currencyParams?: CurrencyParams) {
  const prices = await getCurrencyListUsdPrice(currencyParams && [currencyParams])
  const key = getCurrencyKey(currencyParams)
  return (key && prices[key]) ?? 0
}

type PriceMap = Record<string, number>
export async function fetchCurrencyPriceMap(): Promise<PriceMap> {
  const priceMap = await fetch('/api/tokens/prices')
    .then((res) => res.json())
    .catch((e) => {
      console.error('Failed to fetch prices', e)
      return {}
    })

  return priceMap as PriceMap
}

export async function getCurrencyListUsdPrice(currencyListParams?: CurrencyParams[]): Promise<CurrencyUsdResult> {
  if (!currencyListParams) {
    const priceMap = await fetchCurrencyPriceMap()
    return priceMap
  }

  if (currencyListParams.some((c) => c.chainId !== ChainId.KLAYTN)) {
    throw new Error('Contains an invalid token')
  }

  const priceMap = await fetchCurrencyPriceMap()

  return currencyListParams.reduce((acc, currency) => {
    const key = getCurrencyKey(currency)
    if (!key) {
      return acc
    }

    const [_, address] = key.split(':')

    const price = priceMap[address]
    if (!price) {
      return acc
    }

    return {
      ...acc,
      [key]: price,
    }
  }, {} as CurrencyUsdResult)
}
