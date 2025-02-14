import { ChainId } from '@pancakeswap/chains'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { InfoDataSource } from 'views/Dashboard/types'

export default function getTokenInfoPath(
  chainId: ChainId,
  address: string,
  dataSource: InfoDataSource = InfoDataSource.V3,
  stableSwapPath = '',
) {
  return `/info${dataSource === InfoDataSource.V3 ? '/v3' : ''}/tokens/${address}?chain=${
    CHAIN_QUERY_NAME[chainId]
  }${stableSwapPath.replace('?', '&')}`
}
