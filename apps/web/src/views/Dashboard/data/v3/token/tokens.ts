import fetchAllV3TokenAddresses from 'views/Dashboard/data/v3/token/tokenAddresses'
import fetchV3TokenDataByAddresses from 'views/Dashboard/data/v3/token/tokenDataByAddresses'
import fetchTopV3TokenAddresses from 'views/Dashboard/data/v3/token/topTokenAddresses'
import { Block } from 'views/Dashboard/types'

export default async function fetchV3Tokens({
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
      ? await fetchAllV3TokenAddresses()
      : await fetchTopV3TokenAddresses()
    const data = await fetchV3TokenDataByAddresses(tokenAddress.addresses ?? [], blocks)
    return data
  } catch (e) {
    console.error(e)
    return {
      data: {},
      error: true,
    }
  }
}
