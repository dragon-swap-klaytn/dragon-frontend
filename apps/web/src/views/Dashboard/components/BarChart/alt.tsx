import { RowBetween, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { HTMLAttributes, ReactNode } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { VolumeWindow } from '../../types'

dayjs.extend(utc)

export type BarChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'onMouseMove'> & {
  data: any[]
  color?: string
  heightClassName?: string
  minHeightClassName?: string
  onMouseMove?: (value: number, label: string) => void
  onMouseLeave?: () => void
  label?: string
  activeWindow?: VolumeWindow
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
}

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  )
}

const Chart = ({
  data,
  color = '#f97316',
  onMouseMove,
  onMouseLeave,
  label,
  activeWindow,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeightClassName,
  heightClassName,
  margin,
}: BarChartProps) => {
  const now = dayjs()

  return (
    <div className={clsx('w-full h-full flex bg-transparent flex-col', minHeightClassName, heightClassName)}>
      <div className="w-full flex items-start space-x-2 justify-between">
        {topLeft ?? null}
        {topRight ?? null}
      </div>
      {data?.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={margin}
            onMouseLeave={onMouseLeave}
            onMouseMove={(state) => {
              if (onMouseMove && state?.activePayload && state.activePayload.length > 0) {
                const { payload } = state.activePayload[0]

                const formattedTime = dayjs(payload.time).format('MMM D')
                const formattedTimeDaily = dayjs(payload.time).format('MMM D, YYYY')
                const formattedTimePlusWeek = dayjs(payload.time).add(1, 'week')
                const formattedTimePlusMonth = dayjs(payload.time).add(1, 'month')

                let _time = ''
                if (label !== formattedTime) {
                  if (activeWindow === VolumeWindow.weekly) {
                    const isCurrent = formattedTimePlusWeek.isAfter(now)
                    _time = `${formattedTime}-${
                      isCurrent ? now.format('MMM D, YYYY') : formattedTimePlusWeek.format('MMM D, YYYY')
                    }`
                  } else if (activeWindow === VolumeWindow.monthly) {
                    const isCurrent = formattedTimePlusMonth.isAfter(now)
                    _time = `${formattedTime}-${
                      isCurrent ? now.format('MMM D, YYYY') : formattedTimePlusMonth.format('MMM D, YYYY')
                    }`
                  } else {
                    _time = formattedTimeDaily
                  }
                }

                onMouseMove(payload.value, _time)
              }
            }}
          >
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(time) => dayjs(time).format(activeWindow === VolumeWindow.monthly ? 'MMM' : 'DD')}
              minTickGap={10}
            />
            <Tooltip cursor={{ fill: color, opacity: 0.2 }} contentStyle={{ display: 'none' }} />
            <Bar
              dataKey="value"
              fill={color}
              shape={(props) => {
                return <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />
              }}
            />
          </BarChart>
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
