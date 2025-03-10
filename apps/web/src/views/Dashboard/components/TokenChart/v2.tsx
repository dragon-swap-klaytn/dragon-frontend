import { SegmentedControl, Spinner } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import BarChart from 'views/Dashboard/components/BarChart/alt'
import LineChart from 'views/Dashboard/components/LineChart/alt'
import { TokenRate } from 'views/Dashboard/components/TokenRate'
import useTokenChartData from 'views/Dashboard/hooks/useTokenChartData'
import { timestampToDate } from 'views/Dashboard/utils/date'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'

type ChartType = 'volume' | 'TVL' | 'tx' | 'price'
const CHART_TYPES: ChartType[] = ['volume', 'TVL', 'tx', 'price']

function TooltipContent({ label, date }: { label: ReactNode; date: string }) {
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
  const [tooltipContent, setTooltipContent] = useState<{ label: ReactNode; date: string } | null>(null)
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

  const formatValue = useCallback(
    (value: number) => {
      switch (chartType) {
        case 'tx': {
          return value.toLocaleString()
        }
        case 'price': {
          return (
            <TokenRate prefix="$" rate={value} className="text-inherit" hiddenDigitClassName="text-lg leading-none" />
          )
        }
        default: {
          return formatDollarAmountV2({ num: value, withDollarSign: true })
        }
      }
    },
    [chartType],
  )

  const resetTooltip = useCallback(() => {
    if (!data) return

    const item = data[chartType][data[chartType].length - 1]
    const formattedValue = formatValue(item.value)

    setTooltipContent({
      label: formattedValue,
      date: `${dayjs(item.time).format('MMM D, YYYY')} (UTC)`,
    })
  }, [data, chartType, formatValue])

  useEffect(() => {
    resetTooltip()
  }, [chartType, resetTooltip])

  const onMouseMove = useCallback(
    (value: number, label: string) => {
      const formattedValue = formatValue(value)

      setTooltipContent({
        label: formattedValue,
        date: `${label} (UTC)`,
      })
    },
    [formatValue],
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
