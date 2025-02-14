import { Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import React, { ReactNode } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { RowBetween } from '../Row'

dayjs.extend(utc)

export type LineChartProps = {
  data: any[]
  color?: string
  heightClassName?: string
  minHeightClassName?: string
  onMouseHover?: (value: number, label: string) => void
  onMouseLeave?: () => void
  topLeft?: ReactNode
  topRight?: ReactNode
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
  margin?: {
    top?: number
    right?: number
    left?: number
    bottom?: number
  }
} & React.HTMLAttributes<HTMLDivElement>

const Chart = ({
  data,
  color = '#f97316',
  onMouseHover,
  onMouseLeave,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeightClassName,
  heightClassName,
  margin,
}: LineChartProps) => {
  const { theme } = useTheme()

  return (
    <div className={clsx('w-full h-full flex bg-transparent flex-col', minHeightClassName, heightClassName)}>
      <div className="flex items-start space-x-2 justify-between w-full">
        {topLeft ?? null}
        {topRight ?? null}
      </div>
      {data?.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={margin} onMouseLeave={onMouseLeave}>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={darken(0.36, color)} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(time) => dayjs(time).format('DD')}
              minTickGap={10}
            />
            <Tooltip
              cursor={{ stroke: theme.colors.backgroundAlt2 }}
              contentStyle={{ display: 'none' }}
              formatter={(v, n, props) => {
                if (onMouseHover) onMouseHover(props.payload.value, dayjs(props.payload.time).format('MMM D, YYYY'))

                return [v, n]
              }}
            />
            <Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween>
    </div>
  )
}

export default Chart
