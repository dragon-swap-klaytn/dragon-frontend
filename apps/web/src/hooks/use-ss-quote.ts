import { QuoteResponse } from 'pages/api/ss/quote'
import useSWR from 'swr'

export default function useSsQuote({
  slippage,
  from,
  to,
  tokenInAddress,
  tokenOutAddress,
  amount,
  enable = false,
}: {
  slippage: string
  from: string
  to: string
  tokenInAddress: string
  tokenOutAddress: string
  amount: string
  enable: boolean
}) {
  const searchParams = new URLSearchParams({
    slippage,
    from,
    to,
    tokenInAddress,
    tokenOutAddress,
    amount,
  })

  const quoteEnable = Boolean(slippage && from && to && tokenInAddress && tokenOutAddress && amount && enable)

  const { data, mutate, error, isLoading, isValidating } = useSWR(
    quoteEnable ? `/api/ss/quote?${searchParams.toString()}` : null,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Failed to fetch quote: ${res.statusText}`)
      }

      return res.json() as Promise<QuoteResponse>
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 30_000,
      dedupingInterval: 30_000,
    },
  )

  return {
    ssQuote: data,
    refreshSsQuote: mutate,
    ssQuoteError: error,
    ssQuoteIsLoading: isLoading || isValidating || (!data && !error),
  }
}
