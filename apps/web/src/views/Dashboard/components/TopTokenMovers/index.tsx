import { useTranslation } from '@pancakeswap/localization'
import { CurrencyLogo, Spinner } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

import { useActiveChainId } from 'hooks/useActiveChainId'
import { useEffect, useMemo, useRef } from 'react'
import { styled } from 'styled-components'
import { formatAmount } from 'utils/formatInfoNumbers'
import Percent from 'views/Dashboard/components/Percent'
import { V2TokenData, V3TokenData } from 'views/Dashboard/types'
import { TOKEN_HIDE, v3InfoPath } from '../../constants'

const CardWrapper = styled(NextLinkFromReactRouter)`
  display: inline-block;
  min-width: 190px;
  margin-left: 16px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

export const ScrollableRow = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`

// .no-scrollbar {
//   overflow: auto;
//   scrollbar-width: none; /* Firefox */
// }

// .no-scrollbar::-webkit-scrollbar {
//   display: none; /* Chrome, Safari */
// }

const DataCard = ({ tokenData }: { tokenData: V3TokenData | V2TokenData }) => {
  return (
    <CardWrapper to={`/${v3InfoPath}/tokens/${tokenData.address}`}>
      <div className="border border-border rounded-xl p-4 flex items-center space-x-2">
        <CurrencyLogo address={tokenData.address} size={32} />

        <div className="flex flex-col items-start space-y-1">
          <span className="text-sm text-on-surface">{tokenData.symbol}</span>

          <span className="flex items-center text-sm text-on-surface space-x-2">
            <span>{formatAmount(tokenData.priceUSD)}</span>
            <Percent value={tokenData.priceUSDChange} />
          </span>
        </div>
      </div>
    </CardWrapper>
  )
}

export default function TopTokenMovers({
  tokens,
}: {
  tokens?: {
    [address: string]: V3TokenData | V2TokenData
  }
}) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()

  const topPriceIncrease = useMemo(() => {
    if (!tokens) return undefined

    return Object.values(tokens)
      .filter((d) => d?.exists)
      .filter((x) => !!x && !TOKEN_HIDE?.[chainId]?.includes(x.address))
      .sort((a, b) => b.priceUSDChange - a.priceUSDChange)
  }, [tokens, chainId])

  const increaseRef = useRef<HTMLDivElement>(null)
  const moveLeftRef = useRef<boolean>(true)

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (increaseRef.current) {
        if (increaseRef.current.scrollLeft === increaseRef.current.scrollWidth - increaseRef.current.clientWidth) {
          moveLeftRef.current = false
        } else if (increaseRef.current.scrollLeft === 0) {
          moveLeftRef.current = true
        }
        increaseRef.current.scrollTo(
          moveLeftRef.current ? increaseRef.current.scrollLeft + 1 : increaseRef.current.scrollLeft - 1,
          0,
        )
      }
    }, 30)

    return () => {
      clearInterval(scrollInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-start space-y-5 w-full">
      <h4 className="text-xl text-on-surface">{t('Top Movers')}</h4>

      <div className="bg-surface-raised rounded-xl p-6 w-full">
        {!topPriceIncrease ? (
          <div className="h-40 flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <ScrollableRow ref={increaseRef}>
            {topPriceIncrease.map((entry) =>
              entry ? <DataCard key={`top-card-token-${entry?.address}`} tokenData={entry} /> : null,
            )}
          </ScrollableRow>
        )}
      </div>
    </div>
  )
}
