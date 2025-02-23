import { SegmentedControl, Spinner } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BarChart from 'views/Dashboard/components/BarChart/alt'
import LineChart from 'views/Dashboard/components/LineChart/alt'
import useTokenChartData from 'views/Dashboard/hooks/useTokenChartData'
import { timestampToDate } from 'views/Dashboard/utils/date'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'

type ChartType = 'volume' | 'TVL' | 'tx' | 'price'
const CHART_TYPES: ChartType[] = ['volume', 'TVL', 'tx', 'price']

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

type TokenChartProps = {
  address: string
}

export function TokenV2Chart({ address }: TokenChartProps) {
  const [chartType, setChartType] = useState<ChartType>('volume')
  const [tooltipContent, setTooltipContent] = useState<{ label: string; date: string } | null>(null)
  const { chartData } = useTokenChartData({ type: 'v2', address }, { length: 120 })

  const data = useMemo(() => {
    if (!chartData) return null

    const volumeData: ChartDataElement[] = []
    const tvlData: ChartDataElement[] = []
    const txData: ChartDataElement[] = []
    const priceData: ChartDataElement[] = []

    chartData.forEach((elem) => {
      const time = timestampToDate(elem.timestamp)
      volumeData.push({ time, value: elem.volumeUSD })
      tvlData.push({ time, value: elem.tvlUSD })
      txData.push({ time, value: elem.txCount })
      priceData.push({ time, value: elem.priceUSD })
    })

    return {
      volume: volumeData,
      TVL: tvlData,
      tx: txData,
      price: priceData,
    }
  }, [chartData])

  const resetTooltip = useCallback(() => {
    if (!data) return

    const item = data[chartType][data[chartType].length - 1]
    const formattedValue =
      chartType === 'tx'
        ? (item as ChartDataElement).value.toLocaleString()
        : formatDollarAmount((item as ChartDataElement).value)

    setTooltipContent({
      label: formattedValue,
      date: `${dayjs(item.time).format('MMM D, YYYY')} (UTC)`,
    })
  }, [data, chartType])

  useEffect(() => {
    resetTooltip()
  }, [chartType, resetTooltip])

  const onMouseMove = useCallback(
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

  const Chart = chartType === 'volume' ? BarChart : LineChart

  return (
    <Chart
      data={data[chartType]}
      topLeft={tooltipContent ? <TooltipContent {...tooltipContent} /> : null}
      topRight={<SegmentedControl options={CHART_TYPES} value={chartType} onChange={setChartType} />}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      margin={{ top: 16 }}
    />
  )
}
