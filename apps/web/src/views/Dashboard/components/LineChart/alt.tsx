import { Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import { HTMLAttributes, ReactNode } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

dayjs.extend(utc)

export type LineChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'onMouseMove'> & {
  data: any[]
  color?: string
  heightClassName?: string
  minHeightClassName?: string
  onMouseMove?: (value: number, label: string) => void
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
}

const Chart = ({
  data,
  color = '#f97316',
  onMouseMove,
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
    <div
      className={clsx(
        'w-full h-full flex bg-transparent flex-col justify-center items-center',
        minHeightClassName,
        heightClassName,
      )}
    >
      <div className="flex items-start space-x-2 justify-between w-full">
        {topLeft ?? null}
        {topRight ?? null}
      </div>
      {data?.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <ResponsiveContainer width="98%" height="100%">
          <AreaChart
            data={data}
            margin={margin}
            onMouseLeave={onMouseLeave}
            onMouseMove={(state) => {
              if (onMouseMove && state?.activePayload && state.activePayload.length > 0) {
                const { payload } = state.activePayload[0]

                onMouseMove(payload.value, dayjs(payload.time).format('MMM D, YYYY'))
              }
            }}
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
            <Tooltip cursor={{ stroke: theme.colors.backgroundAlt2 }} contentStyle={{ display: 'none' }} />
            <Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <div className="flex items-end space-x-2 justify-between w-full">
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </div>
    </div>
  )
}

export default Chart
