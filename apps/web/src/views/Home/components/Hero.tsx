import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

import ConnectWalletButton from 'components/ConnectWalletButton'
import { ASSET_CDN } from 'config/constants/endpoints'
import useTheme from 'hooks/useTheme'
import { useLayoutEffect, useRef } from 'react'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'
import { useDrawCanvas } from '../hooks/useDrawCanvas'
import { useDrawSequenceImages } from '../hooks/useDrawSequence'
import { checkIsIOS, useIsIOS } from '../hooks/useIsIOS'

const BgWrapper = styled.div`
  z-index: -1;
  overflow: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0px;
  left: 0px;
`

const InnerWrapper = styled.div`
  position: absolute;
  width: 100%;
  bottom: -3px;
`

const BunnyWrapper = styled.div`
  width: 100%;
  > span {
    overflow: visible !important; // make sure the next-image pre-build blur image not be cropped
  }
`

const CakeBox = styled.div`
  width: 300px;
  height: 300px;
  > canvas {
    transform: scale(0.33) translate(-50%, -50%);
    transform-origin: top left;
    &.is-ios {
      transform: scale(0.75) translate(-50%, -50%);
    }
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 500px;
    height: 500px;
    > canvas {
      transform: scale(0.45) translate(-50%, -50%);
      &.is-ios {
        transform: scale(1) translate(-50%, -50%);
      }
    }
    transform-origin: center center;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    > canvas {
      transform: scale(0.6) translate(-50%, -50%);
      transform-origin: top left;
      &.is-ios {
        transform: scale(1) translate(-50%, -50%);
      }
    }
    ${({ theme }) => theme.mediaQueries.lg} {
      > canvas {
        &.is-ios {
          transform: scale(1.45) translate(-50%, -52%);
        }
      }
    }
    position: relative;
    width: 605px;
    height: 736px;
    overflow: hidden;
    margin-bottom: -100px;
    margin-right: -100px;
  }
`

const DragonSwapImage = styled.div`
  border-radius: 21px;
  width: 100%;

  .dragonswap_banner {
    width: 100%;
    img {
      border-radius: 21px;
    }
  }
`

const StyledText = styled(Text)`
  font-size: 32px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 40px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 64px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    font-size: 55px;
  }
`

const width = 1080
const height = 1080

const Hero = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { theme } = useTheme()
  const { isMobile, isXs, isMd } = useMatchBreakpoints()
  const videoRef = useRef<HTMLVideoElement>(null)
  const starVideoRef = useRef<HTMLVideoElement>(null)
  const cakeVideoRef = useRef<HTMLVideoElement>(null)
  const rock01VideoRef = useRef<HTMLVideoElement>(null)
  const rock02VideoRef = useRef<HTMLVideoElement>(null)
  const rock03VideoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const internalRef = useRef(0)
  const seqInternalRef = useRef(0)
  const { isIOS } = useIsIOS()
  const { drawImage, isVideoPlaying } = useDrawCanvas(
    videoRef,
    canvasRef,
    internalRef,
    width,
    height,
    () => {
      if (isVideoPlaying.current === false) {
        isVideoPlaying.current = true
        internalRef.current = window.requestAnimationFrame(() => {
          drawImage?.()
        })
      }
    },
    () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 3
        videoRef.current.play()
      }
    },
    [starVideoRef, cakeVideoRef, rock01VideoRef, rock02VideoRef, rock03VideoRef],
  )

  useLayoutEffect(() => {
    starVideoRef.current?.play()
    cakeVideoRef.current?.play()
    rock01VideoRef.current?.play()
    rock02VideoRef.current?.play()
    setTimeout(() => {
      rock03VideoRef.current?.play()
    }, 3000)
    return () => {
      clearInterval(seqInternalRef.current)
      cancelAnimationFrame(internalRef.current)
    }
  }, [])

  const { drawSequenceImage, playing } = useDrawSequenceImages(
    `${ASSET_CDN}/web/landing/hero-sequence`,
    checkIsIOS() || isMobile ? 70 : 0,
    canvasRef,
    seqInternalRef,
    () => clearInterval(seqInternalRef.current),
    () => {
      if (playing.current === false) {
        playing.current = true
        seqInternalRef.current = window.setInterval(() => {
          drawSequenceImage(500, 500)
        }, 1000 / 15)
      }
    },
    true,
  )

  return (
    <>
      <style jsx global>
        {`
          .slide-svg-dark {
            display: none;
          }
          .slide-svg-light {
            display: block;
          }
          [data-theme='dark'] .slide-svg-dark {
            display: block;
          }
          [data-theme='dark'] .slide-svg-light {
            display: none;
          }
        `}
      </style>
      <DragonSwapImage>
        <div className="dragonswap_banner">
          <img src="/images/dragon_main_banner.png" alt="mainBanner" />
        </div>
      </DragonSwapImage>
      <Flex
        position="relative"
        flexDirection={['column-reverse', null, null, 'row']}
        alignItems={['flex-start', null, null, 'flex-start']}
        justifyContent="center"
        mt={['50px', null, '80px']}
        pl={['0px', '0px', '0px', '0px']}
        id="homepage-hero"
      >
        <Flex flex="1" flexDirection="column">
          <Text textAlign={isMobile || isMd ? 'center' : 'left'} pr={isMobile ? 0 : '10px'} mb="16px">
            <StyledText display="inline-block" lineHeight="110%" fontWeight={600} color="text" mr="8px">
              {t('For Klaytn & Finschia')}
            </StyledText>
            <StyledText
              display="inline-block"
              fontWeight={600}
              lineHeight="110%"
              color="#3277DC"
              mr={isMobile ? 0 : '8px'}
            >
              {t('Dragon Swap')}
            </StyledText>
            {isMobile && <br />}
            {/* <StyledText display="inline-block" lineHeight="110%" fontWeight={600} color="text">
              {t('DEX')}
            </StyledText> */}
          </Text>
          <Text
            mb="24px"
            color={theme.isDark ? '#B8ADD2' : '#7A6EAA'}
            maxWidth={600}
            fontSize={['20px', '20px', null, '23px']}
            textAlign={isMobile ? 'center' : 'left'}
            lineHeight="110%"
            fontWeight={600}
          >
            {t(' Trade, earn, and own crypto on the all-in-one DEX')}
          </Text>

          <Flex justifyContent={isMobile || isMd ? 'center' : 'start'}>
            {!account && <ConnectWalletButton style={{ borderRadius: isXs ? 12 : undefined }} scale="md" mr="8px" />}
            <NextLinkFromReactRouter to="/swap">
              <Button
                scale="md"
                style={{ borderRadius: isXs ? 12 : undefined }}
                variant={!account ? 'secondary' : 'primary'}
              >
                {t('Trade Now')}
              </Button>
            </NextLinkFromReactRouter>
          </Flex>
        </Flex>
        <Flex
          height={['100%', null, null, '100%']}
          width={['100%', null, null, '100%']}
          flex={[null, null, null, '1']}
          mb={['24px', null, null, '0']}
          position="relative"
        />
      </Flex>
    </>
  )
}

export default Hero
