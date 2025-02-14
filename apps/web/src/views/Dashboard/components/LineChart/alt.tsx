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
  height?: string
  minHeight?: string
  onMouseHover: (value: number, label: string) => void
  onMouseLeave: () => void
  topLeft?: ReactNode
  topRight?: ReactNode
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
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
  minHeight = 'min-h-[300px]',
  height,
}: LineChartProps) => {
  const { theme } = useTheme()

  return (
    <div className={clsx('w-full flex bg-transparent flex-col', minHeight, height)}>
      <div className="flex items-center space-x-2 justify-between w-full">
        {topLeft ?? null}
        {topRight ?? null}
      </div>
      {data?.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onMouseLeave={onMouseLeave}
          >
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
                onMouseHover(props.payload.value, dayjs(props.payload.time).format('MMM D, YYYY'))

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
