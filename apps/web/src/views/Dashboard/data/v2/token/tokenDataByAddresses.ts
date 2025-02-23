/* eslint-disable no-param-reassign */
import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { getChangeForPeriod } from 'utils/getChangeForPeriod'
import { Block, V2TokenData } from 'views/Dashboard/types'
import getAmountChange from 'views/Dashboard/utils/getAmountChange'
import getPercentChange from 'views/Dashboard/utils/getPercentChange'

interface TokenFields {
  id: string
  symbol: string
  name: string
  decimals: string
  derivedBNB: string // Price in BNB per token
  derivedETH: string // Price in ETH per token
  derivedUSD: string // Price in USD per token
  tradeVolumeUSD: string
  totalTransactions: string
  totalLiquidity: string
}

interface FormattedTokenFields
  extends Omit<
    TokenFields,
    'derivedETH' | 'derivedBNB' | 'derivedUSD' | 'tradeVolumeUSD' | 'totalTransactions' | 'totalLiquidity' | 'decimals'
  > {
  derivedBNB: number
  derivedETH: number
  derivedUSD: number
  tradeVolumeUSD: number
  totalTransactions: number
  totalLiquidity: number
  decimals: number
}

interface TokenQueryResponse {
  now: TokenFields[]
  oneDayAgo: TokenFields[]
  twoDaysAgo: TokenFields[]
  oneWeekAgo: TokenFields[]
  twoWeeksAgo: TokenFields[]
}

/**
 * Main token data to display on Token page
 */
const TOKEN_AT_BLOCK = (block: number | undefined, tokens: string[]) => {
  const addressesString = `["${tokens.join('","')}"]`
  const blockString = block ? `block: {number: ${block}}` : ``
  return `tokens(
      where: {id_in: ${addressesString}}
      ${blockString}
      orderBy: tradeVolumeUSD
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      derivedETH
      derivedUSD
      tradeVolumeUSD
      totalTransactions
      totalLiquidity
    }
  `
}

const fetchTokenData = async (
  block24h: number,
  block48h: number,
  block7d: number,
  block14d: number,
  tokenAddresses: string[],
) => {
  const startBlock = 145315220
  try {
    const query = gql`
      query tokens {
        now: ${TOKEN_AT_BLOCK(undefined, tokenAddresses)}
        oneDayAgo: ${TOKEN_AT_BLOCK(block24h, tokenAddresses)}
        ${
          (Boolean(startBlock) && startBlock <= block48h) || !startBlock
            ? `twoDaysAgo: ${TOKEN_AT_BLOCK(block48h, tokenAddresses)}`
            : ''
        }
        ${
          (Boolean(startBlock) && startBlock <= block7d) || !startBlock
            ? `oneWeekAgo: ${TOKEN_AT_BLOCK(block7d, tokenAddresses)}`
            : ''
        }
        ${
          (Boolean(startBlock) && startBlock <= block14d) || !startBlock
            ? `twoWeeksAgo: ${TOKEN_AT_BLOCK(block14d, tokenAddresses)}`
            : ''
        }
      }
    `

    const data = await request<TokenQueryResponse>(subgraphUrls.v2Exchange, query)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch token data', error)
    return { error: true }
  }
}

// Transforms tokens into "0xADDRESS: { ...TokenFields }" format and cast strings to numbers
const parseTokenData = (tokens?: TokenFields[]) => {
  if (!tokens) {
    return {}
  }
  return tokens.reduce((accum: { [address: string]: FormattedTokenFields }, tokenData) => {
    const { derivedBNB, derivedUSD, tradeVolumeUSD, totalTransactions, totalLiquidity, derivedETH, decimals } =
      tokenData
    accum[tokenData.id.toLowerCase()] = {
      ...tokenData,
      derivedBNB: derivedBNB ? 0 : parseFloat(derivedBNB),
      derivedETH: derivedETH ? 0 : parseFloat(derivedETH),
      derivedUSD: parseFloat(derivedUSD),
      tradeVolumeUSD: parseFloat(tradeVolumeUSD),
      totalTransactions: parseFloat(totalTransactions),
      totalLiquidity: parseFloat(totalLiquidity),
      decimals: parseInt(decimals),
    }
    return accum
  }, {})
}

export default async function fetchTokenDataByAddresses(tokenAddresses: string[], blocks: Block[]) {
  try {
    const [block24h, block48h, block7d, block14d] = blocks ?? []

    const { data } = await fetchTokenData(
      block24h.number,
      block48h.number,
      block7d.number,
      block14d.number,
      tokenAddresses,
    )

    const parsed = parseTokenData(data?.now)
    const parsed24 = parseTokenData(data?.oneDayAgo)
    const parsed48 = parseTokenData(data?.twoDaysAgo)
    const parsed7d = parseTokenData(data?.oneWeekAgo)
    const parsed14d = parseTokenData(data?.twoWeeksAgo)

    // Calculate data and format
    const formatted = tokenAddresses.reduce((accum: { [address: string]: V2TokenData }, address) => {
      const current: FormattedTokenFields | undefined = parsed[address]
      const oneDay: FormattedTokenFields | undefined = parsed24[address]
      const twoDays: FormattedTokenFields | undefined = parsed48[address]
      const week: FormattedTokenFields | undefined = parsed7d[address]
      const twoWeeks: FormattedTokenFields | undefined = parsed14d[address]

      const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
        current?.tradeVolumeUSD,
        oneDay?.tradeVolumeUSD,
        twoDays?.tradeVolumeUSD,
      )
      const [volumeUSDWeek] = getChangeForPeriod(
        current?.tradeVolumeUSD,
        week?.tradeVolumeUSD,
        twoWeeks?.tradeVolumeUSD,
      )
      const liquidityUSD = current ? current.totalLiquidity * current.derivedUSD : 0
      const liquidityUSDOneDayAgo = oneDay ? oneDay.totalLiquidity * oneDay.derivedUSD : 0
      const liquidityUSDChange = getPercentChange(liquidityUSD, liquidityUSDOneDayAgo)
      const liquidityToken = current ? current.totalLiquidity : 0
      // Prices of tokens for now, 24h ago and 7d ago
      const priceUSD = current ? current.derivedUSD : 0
      const decimals = current ? current.decimals : 0
      const priceUSDOneDay = oneDay ? oneDay.derivedUSD : 0
      const priceUSDWeek = week ? week.derivedUSD : 0
      const priceUSDChange = getPercentChange(priceUSD, priceUSDOneDay)
      const priceUSDChangeWeek = getPercentChange(priceUSD, priceUSDWeek)
      const txCount = getAmountChange(current?.totalTransactions, oneDay?.totalTransactions)

      accum[address] = {
        exists: !!current,
        address,
        name: current?.name === 'Wrapped Klay' ? 'Wrapped Kaia' : current?.name ?? '',
        symbol: current?.symbol === 'WKLAY' ? 'WKAIA' : current?.symbol ?? '',
        volumeUSD,
        volumeUSDChange,
        volumeUSDWeek,
        txCount,
        liquidityUSD,
        liquidityUSDChange,
        liquidityToken,
        priceUSD,
        priceUSDChange,
        priceUSDChangeWeek,
        decimals,
      }
      return accum
    }, {})

    return {
      error: false,
      data: formatted,
    }
  } catch (e) {
    return {
      error: true,
      data: undefined,
    }
  }
}
