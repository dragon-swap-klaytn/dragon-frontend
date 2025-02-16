import { gql, request } from 'graphql-request'
import { BATCH_SIZE, subgraphUrls } from 'lib/graph-queries/const'
import { TokenAccData, TokenRaw } from 'lib/graph-queries/types'
import { overrideToken } from 'lib/graph-queries/utils'

export const getV3Tokens = async <AccOnly extends boolean = false>({
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
            totalValueLocked
            totalValueLockedUSD
            volume
            volumeUSD
            txCount
            ${
              accOnly
                ? ''
                : `
              symbol
              name
              decimals
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
  const { tokens } = await request(subgraphUrls.v3Exchange, document, variables)

  // Recursively fetch more tokens if the API returned exactly `BATCH_SIZE` items.
  if (tokens.length === BATCH_SIZE) {
    const nextPools = await getV3Tokens({ blockNumber, accOnly, skip: skip + BATCH_SIZE })
    return [...tokens, ...nextPools] // Merge current batch with next batch.
  }

  return accOnly
    ? tokens.map(
        (token) =>
          ({
            id: token.id,
            priceUSD: +token.derivedUSD,
            tvl: +token.totalValueLocked,
            tvlUSD: +token.totalValueLockedUSD,
            volume: +token.volume,
            volumeUSD: +token.volumeUSD,
            txCount: +token.txCount,
          } as TokenAccData),
      )
    : tokens.map((token) => {
        const tokenSimple = overrideToken(token)

        return {
          ...tokenSimple,
          priceUSD: +token.derivedUSD,
          tvl: +token.totalValueLocked,
          tvlUSD: +token.totalValueLockedUSD,
          volume: +token.volume,
          volumeUSD: +token.volumeUSD,
          txCount: +token.txCount,
        } as TokenRaw
      })
}
