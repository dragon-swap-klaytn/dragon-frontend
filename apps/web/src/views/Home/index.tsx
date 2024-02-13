import { useTranslation } from '@pancakeswap/localization'
import { Box, PageSection, useMatchBreakpoints } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import Hero from './components/Hero'

const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 48px;
  }
`

const DragonSwapBanner = styled(PageSection)`
  padding-top: 0px;
  .main_top_banner_section {
    padding-top: 0px;
    border-radius: 30px;
    img {
      height: 200px;
      border-radius: 30px;
    }
  }
`

const Home: React.FC<React.PropsWithChildren> = () => {
  const { theme } = useTheme()
  const HomeSectionContainerStyles = { margin: '0', width: '100%', maxWidth: '968px', padding: '0px 16px' }
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <Box
      style={{
        width: isMobile ? '100vw' : 'calc(100vw - 8px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        height: '100%',
      }}
    >
      <style jsx global>
        {`
          #home-1 {
            height: 100%;
          }
          #home-1 .page-bg {
            // background: linear-gradient(139.5deg, #cce4f7 0%, #edf6fa 100%);
            height: 100%;
            // justify-content: center;
          }
          [data-theme='dark'] #home-1 .page-bg {
            background: radial-gradient(103.12% 50% at 50% 50%, #21193a 0%, #191326 100%);
          }
        `}
      </style>
      {/* <DragonSwapBanner>
        <section className="main_top_banner_section">
          <img src="/images/dragon_main_banner.png" alt="mainBanner" />
        </section>
      </DragonSwapBanner> */}
      <StyledHeroSection
        innerProps={{ style: { margin: '0', width: '100%', overflow: 'visible', padding: '16px' } }}
        containerProps={{
          id: 'home-1',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <Hero />
      </StyledHeroSection>
    </Box>
  )
}

export default Home
