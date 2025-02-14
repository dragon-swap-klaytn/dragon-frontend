import { ChainId, SUBGRAPH_START_BLOCK } from '@pancakeswap/chains'
import { getBlocksFromTimestamps } from 'utils/getBlocksFromTimestamps'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import fetchV3TokenDataByAddresses from 'views/Dashboard/data/v3/token/tokenDataByAddresses'

export const fetchAceTokenPrice = async (tokenAddress: string) => {
  const [t24, t48, t7d] = getDeltaTimestamps()
  const timestampsString = JSON.stringify([t24, t48, t7d])
  const timestampsArray = JSON.parse(timestampsString)

  const blocks = await getBlocksFromTimestamps(timestampsArray, 'desc', 1000)

  // const result = await fetchedTokenDatas(
  const result = await fetchV3TokenDataByAddresses(
    [tokenAddress.toLowerCase()],
    blocks?.filter((d) => d.number >= SUBGRAPH_START_BLOCK[ChainId.KLAYTN]),
  )

  return result?.data?.[tokenAddress?.toLowerCase()]?.priceUSD ?? 0
}
