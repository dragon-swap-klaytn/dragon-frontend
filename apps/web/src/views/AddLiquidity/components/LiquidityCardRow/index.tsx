import { Card, Flex, SyncAltIcon, Tag, Text } from '@pancakeswap/uikit'
import { Pool } from '@pancakeswap/v3-sdk'
import { useMemo } from 'react'
import { styled } from 'styled-components'

import { Currency, Percent } from '@pancakeswap/sdk'
import DoubleCurrencyLogo from 'components/Logo/DoubleLogo'

const TagCell = styled(Flex)`
  padding: 8px 0;

  ${({ theme }) => theme.mediaQueries.sm} {
    position: absolute;
    right: 16px;
    top: 45%;
  }
`

interface LiquidityCardRowProps {
  link?: string
  currency0: Currency
  currency1: Currency
  pairText: string | React.ReactElement
  feeAmount?: number
  hasMerkl?: boolean
  tokenId?: bigint
  tags: React.ReactElement
  subtitle: string
  onSwitch?: () => void
}

export const LiquidityCardRow = ({
  link,
  currency0,
  currency1,
  pairText,
  feeAmount,
  tags,
  subtitle,
  tokenId,
  onSwitch,
  hasMerkl,
}: LiquidityCardRowProps) => {
  const poolAddress = useMemo(
    () =>
      currency0 && currency0 && feeAmount ? Pool.getAddress(currency0.wrapped, currency1.wrapped, feeAmount) : null,
    [currency0, currency1, feeAmount],
  )

  const content = (
    <Flex justifyContent="space-between" p="16px">
      <Flex flexDirection="column">
        <Flex alignItems="center" mb="4px" flexWrap="wrap">
          <Flex width={['100%', '100%', 'inherit']} pr="8px">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
            <Text bold ml="8px">
              {pairText}
            </Text>
          </Flex>
          {typeof tokenId !== 'undefined' && <Text mr="8px">{`(#${tokenId.toString()})`}</Text>}
          {!!feeAmount && (
            <Tag variant="secondary" mr="8px" outline>
              {new Percent(feeAmount, 1_000_000).toSignificant()}%
            </Tag>
          )}
          {/* !hasMerkl && <MerklRewardsTag poolAddress={poolAddress} /> */}
          <TagCell>{tags}</TagCell>
        </Flex>
        <Flex>
          <Text fontSize="14px" color="textSubtle">
            {subtitle}
          </Text>
          {onSwitch ? (
            <SyncAltIcon
              onClick={(e) => {
                e.preventDefault()
                onSwitch()
              }}
              ml="4px"
              color="primary"
            />
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  )

  if (link) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.preventDefault()
          window.location.href = link
        }}
      >
        <Card mb="8px" style={{ maxHeight: '150px' }}>
          {content}
        </Card>
      </div>
    )
  }

  return (
    <Card mb="8px" style={{ maxHeight: '150px' }}>
      {content}
    </Card>
  )
}
