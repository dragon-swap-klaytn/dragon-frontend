import { DashboardPoolType } from 'pages/dashboard'
import { Address } from 'viem'

import { useTranslation } from '@pancakeswap/localization'
import {
  AutoColumn,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CurrencyLogo,
  ExternalLink,
  Flex,
  Heading,
  Message,
  MessageText,
  Spinner,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

import Page from 'components/Layout/Page'
import { TabToggle } from 'components/TabToggle'
import { CHAIN_QUERY_NAME } from 'config/chains'
import dayjs from 'dayjs'
import { useActiveChainId } from 'hooks/useActiveChainId'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'

import truncateHash from '@pancakeswap/utils/truncateHash'
import { styled } from 'styled-components'
import { ONE_HOUR_SECONDS } from 'views/Dashboard/constants'
import useTokenChartData from 'views/Dashboard/hooks/useTokenChartData'
import useTokenPriceData from 'views/Dashboard/hooks/useTokenPriceData'
import useTokensData from 'views/Dashboard/hooks/useTokensData'
import { PriceChartEntry, V2TokenChartEntry, V2TokenData, V3TokenChartEntry, V3TokenData } from 'views/Dashboard/types'
import { currentTimestamp } from 'views/Dashboard/utils'
import { unixToDate } from 'views/Dashboard/utils/date'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'
import BarChart from '../BarChart/alt'
import Percent from '../Percent'
import PoolTable from '../PoolTable'
import { MonoSpace } from '../shared'

const CandleChart = dynamic(() => import('../CandleChart'), {
  ssr: false,
})

const LineChart = dynamic(() => import('../LineChart/alt'), {
  ssr: false,
})

const ContentLayout = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

const DEFAULT_TIME_WINDOW = dayjs.duration(1, 'weeks')

type TokenDetailProps = {
  poolType: DashboardPoolType
  address: Address
}

export default function TokenDetail({ poolType, address }: TokenDetailProps) {
  const { isXs, isSm } = useMatchBreakpoints()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const { t } = useTranslation()
  const tokensData = useTokensData({
    poolType,
    addresses: [address],
  })

  const tokenData = useMemo(() => tokensData?.[address], [tokensData, address])
  const chartData = useTokenChartData(address, poolType)

  const formattedTvlData = useMemo(() => {
    if (!chartData) return []

    return chartData.map((day: V3TokenChartEntry | V2TokenChartEntry) => {
      return {
        time: unixToDate(day.date),
        value:
          poolType === 'v3' ? (day as V3TokenChartEntry).totalValueLockedUSD : (day as V2TokenChartEntry).liquidityUSD,
      }
    })
  }, [chartData, poolType])

  const formattedVolumeData = useMemo(() => {
    if (!chartData) return []

    return chartData.map((day) => {
      return {
        time: unixToDate(day.date),
        value: day.volumeUSD,
      }
    })
  }, [chartData])

  // chart labels
  const [view, setView] = useState(ChartView.TVL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  // pricing data
  const priceData = useTokenPriceData({
    address,
    interval: ONE_HOUR_SECONDS,
    timeWindow: DEFAULT_TIME_WINDOW,
    poolType,
  })

  const adjustedToCurrent = useMemo(() => {
    if (!priceData || !tokenData) return undefined

    const adjusted: PriceChartEntry[] = Object.assign([], priceData)
    adjusted.push({
      time: currentTimestamp() / 1000,
      open: priceData[priceData.length - 1].close,
      close: tokenData[address]?.priceUSD,
      high: tokenData[address]?.priceUSD,
      low: priceData[priceData.length - 1].close,
    })
    return adjusted
  }, [priceData, tokenData, address])

  const tvlUSD = useMemo(() => {
    if (!tokenData) {
      return undefined
    }

    if (poolType === 'v3') {
      return (tokenData as V3TokenData).tvlUSD
    }

    return (tokenData as V2TokenData).liquidityUSD
  }, [tokenData, poolType])

  const tvlUSDChange = useMemo(() => {
    if (!tokenData) {
      return undefined
    }

    if (poolType === 'v3') {
      return (tokenData as V3TokenData).tvlUSDChange
    }

    return (tokenData as V2TokenData).liquidityUSDChange
  }, [tokenData, poolType])

  const { chainId } = useActiveChainId()
  const mouseHoverHandler = useCallback(
    (value: number, time: string) => {
      setLatestValue(value)
      setValueLabel(time)
    },
    [setLatestValue, setValueLabel],
  )
  const mouseLeaveHandler = useCallback(() => {
    setLatestValue(undefined)
    setValueLabel(undefined)
  }, [setLatestValue, setValueLabel])

  return (
    <Page>
      {tokenData ? (
        !tokenData.exists ? (
          <Card>
            <Box p="16px">
              <Text>
                {t('No pair has been created with this token yet. Create one')}
                <NextLinkFromReactRouter style={{ display: 'inline', marginLeft: '6px' }} to={`/add/${address}`}>
                  {t('here.')}
                </NextLinkFromReactRouter>
              </Text>
            </Box>
          </Card>
        ) : (
          <AutoColumn gap="32px">
            <AutoColumn gap="32px">
              <Flex justifyContent="space-between" mb="24px" flexDirection={['column', 'column', 'row']}>
                <Breadcrumbs mb="32px">
                  {/* <NextLinkFromReactRouter to={`/${v3InfoPath}${chainPath}${infoTypeParam}`}> */}
                  <NextLinkFromReactRouter to="/">
                    <Text color="primary">{t('Info')}</Text>
                  </NextLinkFromReactRouter>
                  {/* <NextLinkFromReactRouter to={`/${v3InfoPath}${chainPath}/tokens${infoTypeParam}`}> */}
                  <NextLinkFromReactRouter to="/">
                    <Text color="primary">{t('Tokens')}</Text>
                  </NextLinkFromReactRouter>
                  <Flex>
                    <Text mr="8px">{tokenData.symbol}</Text>
                    <Text>{`(${truncateHash(address)})`}</Text>
                  </Flex>
                </Breadcrumbs>
                <Flex justifyContent={[null, null, 'flex-end']} mt={['8px', '8px', 0]}>
                  <ExternalLink href={getBlockExploreLink(address, 'address')}>
                    {t('View on %site%', { site: getBlockExploreName() })}
                  </ExternalLink>
                  {/* [Comment] if you want to show coin marketcap link, remove commnet after register api key */}
                  {/* {cmcLink && (
                    <StyledCMCLink href={cmcLink} rel="noopener noreferrer nofollow" target="_blank">
                      <Image src="/images/CMC-logo.svg" height={22} width={22} alt={t('View token on CoinMarketCap')} />
                    </StyledCMCLink>
                  )} */}
                  {/* <SaveIcon fill={watchlistTokens.includes(address)} onClick={() => addWatchlistToken(address)} /> */}
                </Flex>
              </Flex>
              <Flex justifyContent="space-between" flexDirection={['column', 'column', 'column', 'row']}>
                <Flex flexDirection="column" mb={['8px', null]}>
                  <Flex alignItems="center">
                    <CurrencyLogo size={32} address={address} />
                    <Text
                      ml="12px"
                      bold
                      lineHeight="0.7"
                      fontSize={isXs || isSm ? '24px' : '40px'}
                      id="info-token-name-title"
                    >
                      {address === '0x5C13E303a62Fc5DEdf5B52D66873f2E59fEdADC2'
                        ? 'Tether USD(Wormhole)'
                        : address === '0x608792Deb376CCE1c9FA4D0E6B7b44f507CfFa6A'
                        ? 'USD Coin(Wormhole)'
                        : address === '0x9025095263d1E548dc890A7589A4C78038aC40ab'
                        ? 'Tether USD(Stargate)'
                        : address === '0xE2053BCf56D2030d2470Fb454574237cF9ee3D4B'
                        ? 'Bridged USDC(Stargate)'
                        : tokenData.name === 'Korean Won tOt'
                        ? 'KRWO'
                        : tokenData.name}
                    </Text>
                    <Text ml="12px" lineHeight="1" color="textSubtle" fontSize={isXs || isSm ? '14px' : '20px'}>
                      (
                      {address === '0x5C13E303a62Fc5DEdf5B52D66873f2E59fEdADC2'
                        ? 'USDT(Wormhole)'
                        : address === '0x608792Deb376CCE1c9FA4D0E6B7b44f507CfFa6A'
                        ? 'USDC(Wormhole)'
                        : address === '0x9025095263d1E548dc890A7589A4C78038aC40ab'
                        ? 'USDT(Stargate)'
                        : address === '0xE2053BCf56D2030d2470Fb454574237cF9ee3D4B'
                        ? 'USDC(Stargate)'
                        : tokenData.symbol}
                      )
                    </Text>
                  </Flex>
                  <Flex mt="8px" ml="46px" alignItems="center">
                    <Text mr="16px" bold fontSize="24px">
                      ${formatAmount(tokenData.priceUSD, { notation: 'standard' })}
                    </Text>
                    <Percent value={tokenData.priceUSDChange} />
                  </Flex>
                </Flex>
                <Flex>
                  <NextLinkFromReactRouter to={`/add/${address}?chain=${CHAIN_QUERY_NAME[chainId]}`}>
                    <Button mr="8px" variant="secondary">
                      {t('Add Liquidity')}
                    </Button>
                  </NextLinkFromReactRouter>
                  <NextLinkFromReactRouter to={`/swap?outputCurrency=${address}`}>
                    <Button>{t('Trade')}</Button>
                  </NextLinkFromReactRouter>
                </Flex>
              </Flex>
            </AutoColumn>
            {tvlUSD && tvlUSD <= 0 && (
              <Message variant="warning">
                <MessageText fontSize="16px">
                  {t('TVL is currently too low to represent the data correctly')}
                </MessageText>
              </Message>
            )}
            <ContentLayout>
              <Card>
                <Box p="24px">
                  <Text bold small color="secondary" fontSize="12px" textTransform="uppercase">
                    {t('TVL')}
                  </Text>
                  <Text bold fontSize="24px">
                    ${formatAmount(tvlUSD)}
                  </Text>
                  <Percent value={tvlUSDChange} />

                  <Text mt="24px" bold color="secondary" fontSize="12px" textTransform="uppercase">
                    {t('Volume 24H')}
                  </Text>
                  <Text bold fontSize="24px" textTransform="uppercase">
                    ${formatAmount(tokenData.volumeUSD)}
                  </Text>
                  <Percent value={tokenData.volumeUSDChange} />

                  <Text mt="24px" bold color="secondary" fontSize="12px" textTransform="uppercase">
                    {t('Volume 7D')}
                  </Text>
                  <Text bold fontSize="24px">
                    ${formatAmount(tokenData.volumeUSDWeek)}
                  </Text>

                  <Text mt="24px" bold color="secondary" fontSize="12px" textTransform="uppercase">
                    {t('Transactions 24H')}
                  </Text>
                  <Text bold fontSize="24px">
                    {formatAmount(tokenData.txCount, { isInteger: true })}
                  </Text>
                </Box>
              </Card>
              <div className="bg-surface-raised">
                <div className="bg-surface-raised">
                  <TabToggle isActive={view === ChartView.VOL} onClick={() => setView(ChartView.VOL)}>
                    <Text>{t('Volume')}</Text>
                  </TabToggle>
                  <TabToggle isActive={view === ChartView.TVL} onClick={() => setView(ChartView.TVL)}>
                    <Text>{t('Liquidity')}</Text>
                  </TabToggle>
                  <TabToggle isActive={view === ChartView.PRICE} onClick={() => setView(ChartView.PRICE)}>
                    <Text>{t('Price')}</Text>
                  </TabToggle>
                </div>
                <div className="flex items-center space-x-2 text-on-surface">
                  <span>
                    {latestValue
                      ? formatDollarAmount(latestValue, 2)
                      : view === ChartView.VOL
                      ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                      : view === ChartView.TVL
                      ? formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)
                      : formatDollarAmount(tokenData.priceUSD, 2)}
                  </span>
                  <span>
                    {valueLabel ? (
                      <MonoSpace>{valueLabel}</MonoSpace>
                    ) : (
                      <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                    )}
                  </span>
                </div>
                <div className="bg-surface-raised">
                  {view === ChartView.TVL ? (
                    <LineChart
                      data={formattedTvlData}
                      color="#9A6AFF"
                      minHeight="min-h-[340px]"
                      height="h-[300px]"
                      onMouseHover={mouseHoverHandler}
                      onMouseLeave={mouseLeaveHandler}
                    />
                  ) : view === ChartView.VOL ? (
                    <BarChart
                      data={formattedVolumeData}
                      color="#1FC7D4"
                      minHeight="min-h-[340px]"
                      onMouseHover={mouseHoverHandler}
                      onMouseLeave={mouseLeaveHandler}
                    />
                  ) : view === ChartView.PRICE ? (
                    <CandleChart data={adjustedToCurrent} setValue={setLatestValue} setLabel={setValueLabel} />
                  ) : null}
                </div>
              </div>
            </ContentLayout>

            <Heading>{t('Pairs')}</Heading>
            <PoolTable poolType={poolType} />
          </AutoColumn>
        )
      ) : (
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      )}
    </Page>
  )
}
