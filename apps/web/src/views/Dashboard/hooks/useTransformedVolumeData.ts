import { useMemo } from 'react'

import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { PancakeDayDataV2, PancakeDayDataV3 } from 'lib/graph-queries/types'
import { GenericChartEntry } from '../types'
import { timestampToDate } from '../utils/date'

dayjs.extend(weekOfYear)

function timestampToType(timestamp: number, type: 'month' | 'week') {
  const date = dayjs(timestamp).utc()

  switch (type) {
    case 'month':
      return date.format('YYYY-MM')
    case 'week':
      // eslint-disable-next-line no-case-declarations
      let week = date.week().toString()
      if (week.length === 1) {
        week = `0${week}`
      }
      return `${date.year()}-${week}`
    default:
      return ''
  }
}

export default function useTransformedVolumeData(
  chartData: PancakeDayDataV3[] | PancakeDayDataV2[] | undefined,
  type: 'month' | 'week',
) {
  return useMemo(() => {
    if (!chartData) return []

    const data: Record<string, GenericChartEntry> = {}

    chartData.forEach(({ timestamp, volumeUSD }: { timestamp: number; volumeUSD: number }) => {
      const group = timestampToType(timestamp, type)
      if (data[group]) {
        data[group].value += volumeUSD
      } else {
        data[group] = {
          time: timestampToDate(timestamp),
          value: volumeUSD,
        }
      }
    })

    return Object.values(data)
  }, [chartData, type])
}
