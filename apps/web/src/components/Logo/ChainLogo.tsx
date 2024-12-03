import { HelpIcon } from '@pancakeswap/uikit'
import Image from 'next/image'
import { memo } from 'react'
import { getChainIcon } from 'utils'
import { isChainSupported } from 'utils/wagmi'

export const ChainLogo = memo(
  ({ chainId, width = 24, height = 24 }: { chainId: number; width?: number; height?: number }) => {
    if (isChainSupported(chainId)) {
      return (
        <Image
          alt={`chain-${chainId}`}
          style={{ maxHeight: `${height}px`, borderRadius: '6px' }}
          src={getChainIcon(chainId)}
          width={width}
          height={height}
          unoptimized
        />
      )
    }

    return <HelpIcon width={width} height={height} />
  },
)
