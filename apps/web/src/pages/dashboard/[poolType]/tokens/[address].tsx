import { GetStaticPaths, GetStaticProps } from 'next'
import { DashboardPoolType } from 'pages/dashboard'
import { getTokenStaticPaths, getTokenStaticProps } from 'utils/pageUtils'
import { Address } from 'viem'
import TokenDetail from 'views/Dashboard/components/Detail/Token'

const TokenDetailPage = ({ poolType, address }: { poolType: DashboardPoolType; address: Address }) => {
  if (!address || !poolType) {
    return null
  }

  return <TokenDetail poolType={poolType} address={address} />
}

TokenDetailPage.Layout = ({ children }) => <>{children}</>
TokenDetailPage.chains = [] // set all

export default TokenDetailPage

export const getStaticPaths: GetStaticPaths = getTokenStaticPaths()
export const getStaticProps: GetStaticProps = getTokenStaticProps()
