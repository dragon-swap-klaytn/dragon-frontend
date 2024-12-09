import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, Flex } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import AffiliatesProgramLayout from 'views/AffiliatesProgram/components/AffiliatesProgramLayout'
import AffiliateLinks from 'views/AffiliatesProgram/components/Dashboard/AffiliateLinks'
import NonAffiliateModal from 'views/AffiliatesProgram/components/Dashboard/AffiliateModal/NonAffiliateModal'
import Banner from 'views/AffiliatesProgram/components/Dashboard/Banner'
import CommissionInfo from 'views/AffiliatesProgram/components/Dashboard/CommissionInfo'
import LoginButton from 'views/AffiliatesProgram/components/Dashboard/LoginButton'
import MyReferralLink from 'views/AffiliatesProgram/components/Dashboard/MyReferralLink'
import Reward from 'views/AffiliatesProgram/components/Dashboard/Reward'
import useAuthAffiliate from 'views/AffiliatesProgram/hooks/useAuthAffiliate'
import useAuthAffiliateExist from 'views/AffiliatesProgram/hooks/useAuthAffiliateExist'
import useUserInfo from 'views/AffiliatesProgram/hooks/useUserInfo'
import { useAccount } from 'wagmi'

const Dashboard = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { isAffiliate, affiliate, refresh } = useAuthAffiliate()
  const { isAffiliateExist } = useAuthAffiliateExist()
  const { userInfo } = useUserInfo()

  return (
    <AffiliatesProgramLayout>
      <NonAffiliateModal />
      <Banner title={t('Dashboard')} subTitle={t('Manage your affiliate link, see how much you’ve earned')} />
      {!account ? (
        <ConnectWalletButton />
      ) : (
        <Flex
          padding="0 16px"
          m={['24px 0', '24px 0', '24px 0', '68px 0 24px 0']}
          justifyContent={['center']}
          flexDirection={['column', 'column', 'column', 'column', 'column', 'row']}
        >
          {isAffiliate && <CommissionInfo affiliate={affiliate} />}
          <Flex
            flexDirection="column"
            width={['100%', '100%', '100%', '100%', '100%', '700px']}
            m={['32px 0 0 0', '32px 0 0 0', '32px 0 0 0', '32px 0 0 0', '32px 0 0 0', '0 0 0 32px']}
          >
            <Card mb="16px">
              {isAffiliateExist && (
                <Box padding={['24px']}>
                  {!isAffiliate ? (
                    <LoginButton />
                  ) : (
                    <>
                      <MyReferralLink affiliate={affiliate} refreshAffiliateInfo={refresh} />
                      <AffiliateLinks affiliate={affiliate} />
                    </>
                  )}
                </Box>
              )}
              <Reward
                isAffiliate={isAffiliate}
                userRewardFeeUSD={userInfo.availableFeeUSD}
                affiliateRewardFeeUSD={affiliate.availableFeeUSD}
                refreshAuthAffiliate={refresh}
              />
            </Card>
          </Flex>
        </Flex>
      )}
    </AffiliatesProgramLayout>
  )
}

Dashboard.chains = []

export default Dashboard
