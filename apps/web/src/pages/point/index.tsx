/* eslint-disable react/button-has-type */
import { Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { SUPPORT_FARMS } from 'config/constants/supportChains'

import { styled } from 'styled-components'

const StyledText = styled(Text)``

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
`

const PointLayout = ({ children }) => {
  const { isMobile } = useMatchBreakpoints()
  return (
    <>
      <StyledDiv>
        <section>
          <StyledText color="#3277DC" fontWeight={600} fontSize={isMobile ? '40px' : '64px'}>
            Coming Soon
          </StyledText>
          {/* <Link href="/">Back Home</Link> */}
        </section>
      </StyledDiv>

      {children}
    </>
  )
}
PointLayout.chains = SUPPORT_FARMS
export default PointLayout
