import { SegmentedControl, Spinner } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BarChart from 'views/Dashboard/components/BarChart/alt'
import CandleChart from 'views/Dashboard/components/CandleChart'
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

type CandleChartDataElement = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

type TokenChartProps = {
  address: string
}

export function TokenV2Chart({ address }: TokenChartProps) {
  const [chartType, setChartType] = useState<ChartType>('volume')
  const [tooltipContent, setTooltipContent] = useState<{ label: string; date: string } | null>(null)
  const { chartData } = useTokenChartData({ type: 'v2', address })

  const data = useMemo(() => {
    if (!chartData) return null

    const volumeData: ChartDataElement[] = []
    const tvlData: ChartDataElement[] = []
    const txData: ChartDataElement[] = []
    const priceData: CandleChartDataElement[] = []

    chartData.forEach((elem, i) => {
      const time = timestampToDate(elem.timestamp)
      volumeData.push({ time, value: elem.volumeUSD })
      tvlData.push({ time, value: elem.tvlUSD })
      txData.push({ time, value: elem.txCount })
      if (i !== 0) {
        const prevPrice = chartData[i - 1].priceUSD
        priceData.push({
          time: Math.round(elem.timestamp / 1000),
          open: prevPrice,
          high: Math.max(prevPrice, elem.priceUSD),
          low: Math.min(prevPrice, elem.priceUSD),
          close: elem.priceUSD,
        })
      }
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
        : chartType === 'price'
        ? formatDollarAmount((item as CandleChartDataElement).close)
        : formatDollarAmount((item as ChartDataElement).value)

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
        date: label,
      })
    },
    [chartType],
  )

  const onMouseLeave = resetTooltip

  if (!data) {
    return <Spinner />
  }

  const Chart = chartType === 'TVL' ? LineChart : chartType === 'price' ? CandleChart : BarChart

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
