import { Currency } from '@pancakeswap/swap-sdk-core'
import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import { useStablecoinPriceAmount } from 'hooks/useBUSDPrice'
import useTokenPrices from 'hooks/useTokenPrices'
import { useMemo } from 'react'

export default function useMaxDepositAmount({
  base,
  quote,
}: {
  base: {
    currency?: Currency
    amount: number
    maxAmount: number
  }
  quote: {
    currency?: Currency
    amount: number
    maxAmount: number
  }
}): {
  type: string
  needed: string
  swapAmount: number
  baseToken: {
    address: string | undefined
    symbol: string | undefined
    tokenAmount: number
  }
  quoteToken: {
    address: string | undefined
    symbol: string | undefined
    tokenAmount: number
  }
} | null {
  const isAMax = base.amount === base.maxAmount
  const isBMax = quote.amount === quote.maxAmount

  const tokenAPrice =
    useStablecoinPriceAmount(base.currency, 1, {
      enabled: Boolean(base.currency),
    }) || 0
  const tokenBPrice =
    useStablecoinPriceAmount(quote.currency, 1, {
      enabled: Boolean(quote.currency),
    }) || 0

  const { prices } = useTokenPrices({
    source: 'swapscanner',
  })

  const maxSwapToken = useMemo(() => {
    if (!prices) {
      return null
    }
    if (!isAMax && !isBMax) {
      return null
    }
    if (base.amount <= base.maxAmount && quote.amount <= quote.maxAmount) {
      return null
    }

    const tokenA = base.currency?.isNative ? ZERO_ADDRESS : base.currency?.wrapped.address.toLowerCase()
    const tokenB = quote.currency?.isNative ? ZERO_ADDRESS : quote.currency?.wrapped.address.toLowerCase()

    if (!tokenA || !tokenB) {
      return null
    }

    if (!prices[tokenA] || !prices[tokenB]) {
      return null
    }

    const tokenADecimals = base.currency?.decimals ?? 18
    const tokenBDecimals = quote.currency?.decimals ?? 18

    const tokenAValue = base.amount * (tokenAPrice || 0)
    const tokenBValue = quote.amount * (tokenBPrice || 0)

    const tokenAValueRate = tokenAValue / (tokenAValue + tokenBValue)
    const tokenBVAlueRate = tokenBValue / (tokenAValue + tokenBValue)

    const tokenATotalValue = base.maxAmount * tokenAPrice
    const tokenBTotalVAlue = quote.maxAmount * tokenBPrice
    const totalValue = tokenATotalValue + tokenBTotalVAlue

    const tokenAInput = +((totalValue * tokenAValueRate) / tokenAPrice).toFixed(tokenADecimals)
    const tokenBInput = +((totalValue * tokenBVAlueRate) / tokenBPrice).toFixed(tokenBDecimals)

    const returnData = {
      baseToken: {
        address: base.currency?.isNative ? ZERO_ADDRESS : base.currency?.wrapped.address.toLowerCase(),
        symbol: base.currency?.symbol,
        tokenAmount: tokenAInput,
      },
      quoteToken: {
        address: quote.currency?.isNative ? ZERO_ADDRESS : quote.currency?.wrapped.address.toLowerCase(),
        symbol: quote.currency?.symbol,
        tokenAmount: tokenBInput,
      },
    }

    if (base.maxAmount < tokenAInput) {
      const neededTokenAAmount = tokenAInput - base.maxAmount

      return {
        ...returnData,
        type: 'base',
        needed: neededTokenAAmount.toFixed(tokenBDecimals),
        swapAmount: +((neededTokenAAmount * tokenAPrice) / tokenBPrice).toFixed(tokenBDecimals),
      }
    }

    if (quote.maxAmount < tokenBInput) {
      const neededTokenBAmount = tokenBInput - quote.maxAmount

      return {
        ...returnData,
        type: 'quote',
        needed: neededTokenBAmount.toFixed(tokenADecimals),
        swapAmount: +((neededTokenBAmount * tokenBPrice) / tokenAPrice).toFixed(tokenADecimals),
      }
    }

    return null
  }, [
    base.maxAmount,
    quote.maxAmount,
    tokenAPrice,
    tokenBPrice,
    isAMax,
    isBMax,
    base.amount,
    quote.amount,
    base.currency,
    quote.currency,
    prices,
  ])

  return maxSwapToken
}
