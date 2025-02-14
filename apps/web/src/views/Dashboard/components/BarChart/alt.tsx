import { RowBetween, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { ReactNode } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { VolumeWindow } from '../../types'

dayjs.extend(utc)

export type LineChartProps = {
  data: any[]
  color?: string
  height?: string
  minHeight?: string
  onMouseHover: (value: number, label: string) => void
  onMouseLeave: () => void
  label?: string
  activeWindow?: VolumeWindow
  topLeft?: ReactNode
  topRight?: ReactNode
  bottomLeft?: ReactNode
  bottomRight?: ReactNode
} & React.HTMLAttributes<HTMLDivElement>

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
  onMouseHover,
  onMouseLeave,
  label,
  activeWindow,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = 'min-h-[300px]',
  height,
}: LineChartProps) => {
  const now = dayjs()

  return (
    <div className={clsx('w-full flex bg-transparent flex-col', minHeight, height)}>
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
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(time) => dayjs(time).format(activeWindow === VolumeWindow.monthly ? 'MMM' : 'DD')}
              minTickGap={10}
            />
            <Tooltip
              cursor={{ fill: color, opacity: 0.2 }}
              contentStyle={{ display: 'none' }}
              formatter={(v, n, props) => {
                const formattedTime = dayjs(props.payload.time).format('MMM D')
                const formattedTimeDaily = dayjs(props.payload.time).format('MMM D, YYYY')
                const formattedTimePlusWeek = dayjs(props.payload.time).add(1, 'week')
                const formattedTimePlusMonth = dayjs(props.payload.time).add(1, 'month')

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

                onMouseHover(props.payload.value, _time)

                return [v, n]
              }}
            />
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
