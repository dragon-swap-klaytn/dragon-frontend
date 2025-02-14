import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getBlocksFromTimestamps } from 'utils/getBlocksFromTimestamps'
import { Block } from 'views/Dashboard/types'

/**
 * for a given array of timestamps, returns block entities
 * @param timestamps
 * @param sortDirection
 * @param skipCount
 */
export const useBlocksFromTimestamps = (
  timestamps: number[],
  sortDirection: 'asc' | 'desc' = 'desc',
  skipCount = 1000,
): {
  blocks?: Block[]
  error: boolean
} => {
  const [blocks, setBlocks] = useState<Block[]>()
  const [error, setError] = useState(false)

  const timestampsString = JSON.stringify(timestamps)
  const blocksString = blocks ? JSON.stringify(blocks) : undefined

  useEffect(() => {
    const fetchData = async () => {
      const timestampsArray = JSON.parse(timestampsString)
      const result = await getBlocksFromTimestamps(timestampsArray, sortDirection, skipCount)
      if (result.length === 0) {
        setError(true)
      } else {
        setBlocks(result)
      }
    }
    const blocksArray = blocksString ? JSON.parse(blocksString) : undefined
    if (!blocksArray && !error) {
      fetchData()
    }
  }, [blocksString, error, skipCount, sortDirection, timestampsString])

  return {
    blocks,
    error,
  }
}

export const useBlockFromTimeStampQuery = (
  timestamps: number[],
  sortDirection: 'asc' | 'desc' | undefined = 'desc',
  skipCount: number | undefined = 1000,
) => {
  const timestampsString = JSON.stringify(timestamps)
  const timestampsArray = JSON.parse(timestampsString)
  const { data } = useQuery(
    [`dashboard/blocks/${timestampsString}`],
    () => getBlocksFromTimestamps(timestampsArray, sortDirection, skipCount),
    {
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  )
  return { blocks: data }
}
