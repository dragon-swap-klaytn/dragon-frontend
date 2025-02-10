import { gql, request } from 'graphql-request'
import { BATCH_SIZE, subgraphUrls } from 'lib/graph-queries/const'
import { TokenAccData, TokenRaw } from 'lib/graph-queries/types'

export const getV2Tokens = async <AccOnly extends boolean = false>({
  blockNumber,
  accOnly,
  skip = 0,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
  accOnly?: AccOnly // Optional flag to fetch simplified data.
  skip?: number // Default `skip` value is `0`, allowing pagination.
} = {}): Promise<(AccOnly extends true ? TokenAccData : TokenRaw)[]> => {
  const document = gql`
        query ($first: Int, $skip: Int, ${blockNumber !== undefined ? '$blockNumber: Int' : ''}) {
          tokens(
            first: $first,
            skip: $skip,
            ${blockNumber !== undefined ? 'block: { number: $blockNumber }' : ''}
          ) {
            id
            derivedUSD
            tradeVolume
            tradeVolumeUSD
            totalTransactions
            ${
              accOnly
                ? ''
                : `
              symbol
              name
              decimals
              totalLiquidity
            `
            }
          }
        }
      `

  // Define query variables safely
  const variables: Record<string, number> = { first: BATCH_SIZE, skip }
  if (blockNumber !== undefined) {
    variables.blockNumber = blockNumber
  }

  // Fetch the tokens from the subgraph.
  const { tokens } = await request(subgraphUrls.v2Exchange, document, variables)

  // Recursively fetch more tokens if the API returned exactly `BATCH_SIZE` items.
  if (tokens.length === BATCH_SIZE) {
    const nextPools = await getV2Tokens({ blockNumber, accOnly, skip: skip + BATCH_SIZE })
    return [...tokens, ...nextPools] // Merge current batch with next batch.
  }

  return accOnly
    ? tokens.map(
        (token) =>
          ({
            id: token.id,
            priceUSD: +token.derivedUSD,
            volume: +token.tradeVolume,
            volumeUSD: +token.tradeVolumeUSD,
            txCount: +token.totalTransactions,
          } as TokenAccData),
      )
    : tokens.map((token) => {
        const tvl = +token.totalLiquidity
        const tvlUSD = tvl * +token.derivedUSD

        return {
          id: token.id,
          symbol: token.symbol,
          name: token.name,
          decimals: +token.decimals,
          priceUSD: +token.derivedUSD,
          tvl,
          tvlUSD,
          volume: +token.tradeVolume,
          volumeUSD: +token.tradeVolumeUSD,
          txCount: +token.totalTransactions,
        } as TokenRaw
      })
}
