import { useTranslation } from '@pancakeswap/localization'
import { SegmentedControl } from '@pancakeswap/uikit'
import { ArrowDown, ArrowUp } from '@phosphor-icons/react'
import dayjs from 'dayjs'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ProtocolV3Data } from 'protocol-data/get-cached-protocol-data'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PoolType } from 'types'
import Header from 'views/Dashboard/components/Header'
import useOverviewData from 'views/Dashboard/hooks/useOverviewData'
import useTransformedVolumeData from 'views/Dashboard/hooks/useTransformedVolumeData'
import Pools from 'views/Dashboard/Pools'
import Tokens from 'views/Dashboard/Tokens'
import Transactions from 'views/Dashboard/Transactions'
import BarChart from './components/BarChart/alt'
import LineChart from './components/LineChart/alt'
import { VolumeWindow } from './types'
import { getPercentChange } from './utils/data'
import { timestampToDate } from './utils/date'
import { formatDollarAmount } from './utils/numbers'

export default function Overview<T extends PoolType>({ poolType = 'v3' as T }: { poolType?: T }) {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()

  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [leftLabel, setLeftLabel] = useState<string | undefined>()
  const [rightLabel, setRightLabel] = useState<string | undefined>()
  const now = dayjs()

  const { protocolData, chartData: overviewChartData } = useOverviewData(poolType)

  useEffect(() => {
    setLiquidityHover(undefined)
    setVolumeHover(undefined)
  }, [chainId, poolType])

  // const prevPoolTypeRef = useRef<PoolType>(poolType)
  const tvlUSD = protocolData?.tvlUSD.current
  const tvlUSDChangeRate24H = getPercentChange(
    protocolData?.tvlUSD.current.toString(),
    protocolData?.tvlUSD['24H'].toString(),
  )

  useEffect(() => {
    if (!tvlUSD) return
    if (liquidityHover !== undefined) return

    setLiquidityHover(tvlUSD)
  }, [liquidityHover, tvlUSD])

  const formattedTvlData = useMemo(() => {
    if (!overviewChartData) {
      return []
    }

    return overviewChartData.map((day) => {
      return {
        time: timestampToDate(day.timestamp),
        value: day.tvlUSD,
      }
    })
  }, [overviewChartData])

  const formattedVolumeData = useMemo(() => {
    if (!overviewChartData) {
      return []
    }

    return overviewChartData.map((day) => {
      return {
        time: timestampToDate(day.timestamp),
        value: day.volumeUSD,
      }
    })
  }, [overviewChartData])

  const weeklyVolumeData = useTransformedVolumeData(overviewChartData, 'week')
  const monthlyVolumeData = useTransformedVolumeData(overviewChartData, 'month')
  const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily)
  const [volumeWindowStr, setVolumeWindowStr] = useState<'D' | 'W' | 'M'>('D')
  useEffect(() => {
    if (volumeWindowStr === 'D') setVolumeWindow(VolumeWindow.daily)
    if (volumeWindowStr === 'W') setVolumeWindow(VolumeWindow.weekly)
    if (volumeWindowStr === 'M') setVolumeWindow(VolumeWindow.monthly)
  }, [volumeWindowStr])
  const tvlValue = useMemo(() => formatDollarAmount(liquidityHover, 2, true), [liquidityHover])

  const tvlChartMoveHandler = useCallback(
    (value: number, time: string) => {
      setLiquidityHover(value)
      setLeftLabel(time)
    },
    [setLiquidityHover, setLeftLabel],
  )
  const tvlChartLeaveHandler = useCallback(() => {
    setLiquidityHover(undefined)
    setLeftLabel(undefined)
  }, [setLiquidityHover, setLeftLabel])

  const volumeChartMoveHandler = useCallback(
    (value: number, time: string) => {
      setVolumeHover(value)
      setRightLabel(time)
    },
    [setVolumeHover, setRightLabel],
  )
  const volumeChartLeaveHandler = useCallback(() => {
    setVolumeHover(undefined)
    setRightLabel(undefined)
  }, [setVolumeHover, setRightLabel])

  return (
    <>
      <div className="flex flex-col space-y-3 w-full">
        <Header title={t('DragonSwap Info & Analytics')} />

        <div className="flex flex-wrap items-center gap-3">
          {!!protocolData && (
            <OverviewData
              title={t('Volume 24H')}
              value={formatDollarAmount(protocolData.volumeUSD.total - protocolData.volumeUSD['24H'])}
              diff={getPercentChange(
                (protocolData.volumeUSD.total - protocolData.volumeUSD['24H']).toString(),
                (protocolData.volumeUSD['24H'] - protocolData.volumeUSD['48H']).toString(),
              )}
            />
          )}

          {poolType === 'v3' && protocolData && (
            <OverviewData
              title={t('Fees 24H')}
              value={formatDollarAmount(
                (protocolData as ProtocolV3Data).feeUSD.total - (protocolData as ProtocolV3Data).feeUSD['24H'],
              )}
              diff={getPercentChange(
                (
                  (protocolData as ProtocolV3Data).feeUSD.total - (protocolData as ProtocolV3Data).feeUSD['24H']
                ).toString(),
                (
                  (protocolData as ProtocolV3Data).feeUSD['24H'] - (protocolData as ProtocolV3Data).feeUSD['48H']
                ).toString(),
              )}
            />
          )}

          <OverviewData title={t('TVL')} value={formatDollarAmount(tvlUSD)} diff={tvlUSDChangeRate24H} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 w-full">
        <div className="rounded-xl p-6 bg-neutral w-full">
          <LineChart
            data={formattedTvlData}
            heightClassName="h-[220px]"
            minHeightClassName="min-h-[332px]"
            onMouseMove={tvlChartMoveHandler}
            onMouseLeave={tvlChartLeaveHandler}
            topLeft={
              <ChartHeader title={t('TVL')} value={tvlValue} date={`${leftLabel ?? now.format('MMM D, YYYY')} (UTC)`} />
            }
          />
        </div>
        <div className="rounded-xl p-6 bg-neutral w-full">
          <BarChart
            heightClassName="h-[200px]"
            minHeightClassName="h-[332px]"
            data={
              volumeWindow === VolumeWindow.monthly
                ? monthlyVolumeData
                : volumeWindow === VolumeWindow.weekly
                ? weeklyVolumeData
                : formattedVolumeData
            }
            onMouseMove={volumeChartMoveHandler}
            onMouseLeave={volumeChartLeaveHandler}
            label={rightLabel}
            activeWindow={volumeWindow}
            topRight={
              <SegmentedControl options={['D', 'W', 'M']} value={volumeWindowStr} onChange={setVolumeWindowStr} />
            }
            topLeft={
              <ChartHeader
                title={t('Volume')}
                value={
                  volumeHover
                    ? formatDollarAmount(volumeHover)
                    : formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value, 2)
                }
                date={`${rightLabel ?? now.format('MMM D, YYYY')} (UTC)`}
              />
            }
          />
        </div>
      </div>

      <div className="flex flex-col items-center mt-8 space-y-8 w-full">
        <Tokens poolType={poolType} />
        <Pools poolType={poolType} />
        <Transactions poolType={poolType} />
      </div>
    </>
  )
}

function ChartHeader({ title, value, date }: { title: string; value: string; date: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm text-on-surface">{title}</h4>
      <span className="text-[32px] text-on-surface">{value}</span>
      <span className="text-sm text-on-surface-subtlest">{date}</span>
    </div>
  )
}

function OverviewData({ title, value, diff }: { title: string; value: string; diff?: number }) {
  return (
    <div className="flex items-center space-x-1 text-sm">
      <h5 className="text-on-surface-subtle">
        {title}: {value}
      </h5>

      {diff !== undefined && (
        <span className="text-on-surface-brand flex items-center">
          ({diff < 0 ? <ArrowDown /> : <ArrowUp />}
          {Math.abs(diff).toFixed(2)}%)
        </span>
      )}
    </div>
  )
}
