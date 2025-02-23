import fetchAllV2TokenAddresses from 'views/Dashboard/data/v2/token/tokenAddresses'
import fetchTokenDataByAddresses from 'views/Dashboard/data/v2/token/tokenDataByAddresses'
import { fetchTopV2TokenAddresses } from 'views/Dashboard/data/v2/token/topTokens'
import { Block } from 'views/Dashboard/types'

export default async function fetchV2Tokens({
  blocks,
  showAll = false,
  addresses,
}: {
  blocks?: Block[]
  showAll?: boolean
  addresses?: string[]
}) {
  try {
    const tokenAddress = addresses
      ? { addresses }
      : showAll
      ? await fetchAllV2TokenAddresses()
      : await fetchTopV2TokenAddresses()
    const data = await fetchTokenDataByAddresses(tokenAddress.addresses ?? [], blocks ?? [])
    return data
  } catch (e) {
    console.error(e)
    return {
      data: {},
      error: true,
    }
  }
}
