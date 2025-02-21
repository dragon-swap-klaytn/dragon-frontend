import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { getDefaultStaticProps } from 'utils/pageUtils'
import { FarmsV3PageLayout } from 'views/Farms'

const FarmsHistoryPage = () => {
  return null
}

FarmsHistoryPage.Layout = FarmsV3PageLayout
FarmsHistoryPage.chains = SUPPORT_FARMS

export default FarmsHistoryPage

export const getStaticProps = getDefaultStaticProps(['common'])
