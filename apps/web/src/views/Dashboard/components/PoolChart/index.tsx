import { SegmentedControl, Spinner } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BarChart from 'views/Dashboard/components/BarChart/alt'
import LineChart from 'views/Dashboard/components/LineChart/alt'
import usePoolChartData from 'views/Dashboard/hooks/usePoolChartData'
import { timestampToDate } from 'views/Dashboard/utils/date'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'

type ChartType = 'volume' | 'TVL' | 'tx'
const CHART_TYPES: ChartType[] = ['volume', 'TVL', 'tx']

function TooltipContent({ label, date }: { label: string; date: string }) {
  return (
    <div className="space-y-2">
      <div className="text-3xl">{label}</div>
      <div className="text-xs">{date}</div>
    </div>
  )
}

type ChartDataElement = {
  time: string
  value: number
}

type PoolChartProps = {
  poolType: 'v2' | 'v3'
  address: string
}

export function PoolChart({ poolType, address }: PoolChartProps) {
  const [chartType, setChartType] = useState<ChartType>('volume')
  const [tooltipContent, setTooltipContent] = useState<{ label: string; date: string } | null>(null)
  const { chartData } = usePoolChartData({ type: poolType, address })

  const data = useMemo(() => {
    if (!chartData) return null

    const volumeData: ChartDataElement[] = []
    const TVLData: ChartDataElement[] = []
    const txData: ChartDataElement[] = []

    chartData.forEach(({ timestamp, volumeUSD, tvlUSD, txCount }) => {
      const time = timestampToDate(timestamp)
      volumeData.push({ time, value: volumeUSD })
      TVLData.push({ time, value: tvlUSD })
      txData.push({ time, value: txCount })
    })

    setTooltipContent({
      label: formatDollarAmount(volumeData[volumeData.length - 1].value),
      date: `${dayjs(volumeData[volumeData.length - 1].time).format('MMM D, YYYY')} (UTC)`,
    })

    return {
      volume: volumeData,
      TVL: TVLData,
      tx: txData,
    }
  }, [chartData])

  const resetTooltip = useCallback(() => {
    if (!data) return

    setTooltipContent({
      label: formatDollarAmount(data[chartType][data[chartType].length - 1].value),
      date: `${dayjs(data[chartType][data[chartType].length - 1].time).format('MMM D, YYYY')} (UTC)`,
    })
  }, [data, chartType])

  useEffect(() => {
    resetTooltip()
  }, [chartType, resetTooltip])

  const onMouseHover = useCallback(
    (value: number, label: string) => {
      const formatedValue = chartType === 'tx' ? value.toLocaleString() : formatDollarAmount(value)

      setTooltipContent({
        label: formatedValue,
        date: label,
      })
    },
    [chartType],
  )

  const onMouseLeave = resetTooltip

  if (!data) {
    return <Spinner />
  }

  const Chart = chartType === 'TVL' ? LineChart : BarChart

  return (
    <Chart
      data={data[chartType]}
      topLeft={tooltipContent ? <TooltipContent {...tooltipContent} /> : null}
      topRight={<SegmentedControl options={CHART_TYPES} value={chartType} onChange={setChartType} />}
      onMouseHover={onMouseHover}
      onMouseLeave={onMouseLeave}
      margin={{ top: 16 }}
    />
  )
}
