import { ChainId } from '@pancakeswap/chains'
import { Pair } from '@pancakeswap/sdk'
import { useQuery } from '@tanstack/react-query'
import { SLOW_INTERVAL } from 'config/constants'
import { LP_HOLDERS_FEE, WEEKS_IN_YEAR } from 'config/constants/info'
import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { getBlockNumberOfTimestamp } from 'lib/node-queries/get-block-number-of-timestamp'
import { getChangeForPeriod } from 'utils/getChangeForPeriod'

// interface PoolReserveVolume {
//   reserveUSD: string
//   volumeUSD: string
// }

// interface PoolReserveVolumeResponse {
//   now: PoolReserveVolume[]
//   oneDayAgo: PoolReserveVolume[]
//   twoDaysAgo: PoolReserveVolume[]
//   oneWeekAgo: PoolReserveVolume[]
//   twoWeeksAgo: PoolReserveVolume[]
// }

export const useLPApr = (pair?: Pair | null) => {
  const { data: poolData } = useQuery(
    ['LP7dApr', pair?.liquidityToken.address],
    async () => {
      if (!pair) return undefined
      const block7d = await getBlockNumberOfTimestamp(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const { error, data } = await fetchPoolVolumeAndReserveData(
        Number(block7d),
        pair.liquidityToken.address.toLowerCase(),
      )
      if (error) return null
      const current = data?.now[0]?.volumeUSD !== undefined ? parseFloat(data?.now[0]?.volumeUSD) : undefined
      const currentReserveUSD =
        data?.now[0]?.reserveUSD !== undefined ? parseFloat(data?.now[0]?.reserveUSD) : undefined
      const week = data?.oneWeekAgo[0]?.volumeUSD !== undefined ? parseFloat(data?.oneWeekAgo[0]?.volumeUSD) : undefined
      const [volumeUSDWeek] = getChangeForPeriod(current, week)
      const liquidityUSD = currentReserveUSD || 0
      const lpApr7d = liquidityUSD > 0 ? (volumeUSDWeek * LP_HOLDERS_FEE * WEEKS_IN_YEAR * 100) / liquidityUSD : 0
      return lpApr7d ? { lpApr7d } : undefined
    },
    {
      enabled: Boolean(pair && pair.chainId === ChainId.KLAYTN),
      refetchInterval: SLOW_INTERVAL,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  )

  return poolData
}
const fetchPoolVolumeAndReserveData = async (block7d: number, poolAddress: string) => {
  try {
    const query = gql`
      query pools {
        now: ${POOL_AT_BLOCK(null, poolAddress)}
        oneWeekAgo: ${POOL_AT_BLOCK(block7d, poolAddress)}
      }
    `

    const data = await request(subgraphUrls.v3Exchange, query)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch pool data', error)
    return { error: true }
  }
}
const POOL_AT_BLOCK = (block: number | null, pool: string) => {
  const addressesString = `["${pool}"]`
  const blockString = block ? `block: {number: ${block}}` : ``
  return `pairs(
    where: { id_in: ${addressesString} }
    ${blockString}
    orderBy: trackedReserveETH
    orderDirection: desc
  ) {
    reserveUSD
    volumeUSD
  }`
}
