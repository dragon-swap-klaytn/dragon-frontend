import BigNumber from 'bignumber.js'
import { gql } from 'graphql-request'
import { getBlockNumberOfTimestamp } from 'lib/node-queries/get-block-number-of-timestamp'
import _toLower from 'lodash/toLower'
import { stableSwapClient } from './graphql'

export const getAprsForStableFarm = async (stableSwapAddress?: string): Promise<BigNumber> => {
  try {
    const block7d = await getBlockNumberOfTimestamp(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const { virtualPriceAtLatestBlock, virtualPriceOneDayAgo: virtualPrice7DayAgo } = await stableSwapClient.request(
      gql`
        query virtualPriceStableSwap($stableSwapAddress: String, $blockDayAgo: Int!) {
          virtualPriceAtLatestBlock: pair(id: $stableSwapAddress) {
            virtualPrice
          }
          virtualPriceOneDayAgo: pair(id: $stableSwapAddress, block: { number: $blockDayAgo }) {
            virtualPrice
          }
        }
      `,
      { stableSwapAddress: _toLower(stableSwapAddress), blockDayAgo: Number(block7d) },
    )

    const virtualPrice = virtualPriceAtLatestBlock?.virtualPrice
    const preVirtualPrice = virtualPrice7DayAgo?.virtualPrice

    const current = new BigNumber(virtualPrice)
    const prev = new BigNumber(preVirtualPrice)

    const result = current.minus(prev).div(current).plus(1).pow(52).minus(1).times(100)

    if (result.isFinite() && result.isGreaterThan(0)) {
      return result
    }
    return new BigNumber(0)
  } catch (error) {
    console.error(error, '[LP APR Update] getAprsForStableFarm error')
  }

  return new BigNumber('0')
}
