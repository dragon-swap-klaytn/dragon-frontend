import { SegmentedControl, Spinner } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PoolType } from 'types'
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
  poolType: PoolType
  address: string
}

export function PoolChart({ poolType, address }: PoolChartProps) {
  const [chartType, setChartType] = useState<ChartType>('volume')
  const [tooltipContent, setTooltipContent] = useState<{ label: string; date: string } | null>(null)
  const { chartData } = usePoolChartData({ type: poolType, address }, { length: 120 })

  const data = useMemo(() => {
    if (!chartData) return null

    const volumeData: ChartDataElement[] = []
    const tvlData: ChartDataElement[] = []
    const txData: ChartDataElement[] = []

    chartData.forEach(({ timestamp, volumeUSD, tvlUSD, txCount }) => {
      const time = timestampToDate(timestamp)
      volumeData.push({ time, value: volumeUSD })
      tvlData.push({ time, value: tvlUSD })
      txData.push({ time, value: txCount })
    })

    return {
      volume: volumeData,
      TVL: tvlData,
      tx: txData,
    }
  }, [chartData])

  const resetTooltip = useCallback(() => {
    if (!data) return

    const item = data[chartType][data[chartType].length - 1]
    const formattedValue = chartType === 'tx' ? item.value.toLocaleString() : formatDollarAmount(item.value)

    setTooltipContent({
      label: formattedValue,
      date: `${dayjs(item.time).format('MMM D, YYYY')} (UTC)`,
    })
  }, [data, chartType])

  useEffect(() => {
    resetTooltip()
  }, [chartType, resetTooltip])

  const onMouseHover = useCallback(
    (value: number, label: string) => {
      const formattedValue = chartType === 'tx' ? value.toLocaleString() : formatDollarAmount(value)

      setTooltipContent({
        label: formattedValue,
        date: `${label} (UTC)`,
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
