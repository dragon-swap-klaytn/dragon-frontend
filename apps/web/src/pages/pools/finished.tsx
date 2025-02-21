import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { getDefaultStaticProps } from 'utils/pageUtils'
import { FarmsV3PageLayout } from 'views/Farms'

const FarmsFinishedPage = () => {
  return null
}

FarmsFinishedPage.Layout = FarmsV3PageLayout
FarmsFinishedPage.chains = SUPPORT_FARMS

export default FarmsFinishedPage

export const getStaticProps = getDefaultStaticProps(['common'])
