/* eslint-disable no-console */
import { ChainId } from '@pancakeswap/chains'
import { gql } from 'graphql-request'
import { useQuery } from '@tanstack/react-query'

import { v3Clients } from 'utils/graphql'

export interface UsePoolAvgInfoParams {
  address?: string
  chainId?: ChainId
}

export const sumArray = (dataToCalculate: number[]): number => {
  const data = [...dataToCalculate]
  // Remove the highest and lowest volume to be more accurate
  if (data.length > 3) {
    // data = data.sort((a: number, b: number) => a - b).slice(1, data.length - 1)
  }

  return data.reduce((result, val) => result + val)
}
export const averageArray = (dataToCalculate: number[]): number => {
  const data = [...dataToCalculate]
  // Remove the highest and lowest volume to be more accurate
  if (data.length > 3) {
    // data = data.sort((a: number, b: number) => a - b).slice(1, data.length - 1)
  }

  return data.reduce((result, val) => result + val, 0) / data.length
}

interface Info {
  volumeUSD: number
  tvlUSD: number
  feeUSD: number
}

const defaultInfo: Info = {
  volumeUSD: 0,
  tvlUSD: 0,
  feeUSD: 0,
}

export function usePoolAvgInfo({ address = '', chainId }: UsePoolAvgInfoParams) {
  const { data } = useQuery(
    [address, chainId],
    async () => {
      if (!chainId) return undefined
      const client = v3Clients[chainId]
      if (!client) {
        console.log('[Failed] Trading volume', address, chainId)
        return defaultInfo
      }

      const query = gql`
        query getVolume($hours: Int!, $address: ID!) {
          poolHourDatas(first: $hours, orderBy: periodStartUnix, orderDirection: desc, where: { pool: $address }) {
            volumeUSD
            tvlUSD
            feesUSD
            protocolFeesUSD
          }
        }
      `
      // TODO : 7 days?
      const { poolHourDatas } = await client.request(query, {
        hours: 24,
        address: address.toLocaleLowerCase(),
      })
      const volumes = poolHourDatas.map((d: { volumeUSD: string }) => Number(d.volumeUSD))
      const feeUSDs = poolHourDatas.map(
        (d: { feesUSD: string; protocolFeesUSD: string }) => Number(d.feesUSD) - Number(d.protocolFeesUSD),
      )

      return {
        volumeUSD: sumArray(volumes),
        tvlUSD: parseFloat(poolHourDatas[0]?.tvlUSD) || 0,
        feeUSD: sumArray(feeUSDs),
      }
    },
    {
      enabled: Boolean(address && chainId),
      refetchOnWindowFocus: false,
    },
  )

  return data || defaultInfo
}
