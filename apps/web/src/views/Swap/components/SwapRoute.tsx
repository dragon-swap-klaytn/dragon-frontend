import { Currency } from '@pancakeswap/sdk'
import { CaretRight } from '@phosphor-icons/react'
import { Fragment, memo } from 'react'
import { unwrappedToken } from 'utils/wrappedCurrency'

export default memo(function SwapRoute({ path }: { path: Currency[] }) {
  return (
    // <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
    <div className="flex flex-wrap w-full justify-end items-center">
      {path.map((token, i) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = token.isToken ? unwrappedToken(token) : token
        return (
          // There might be same token appear more than once
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={`${currency?.symbol}_${i}`}>
            {/* <Flex alignItems="end"> */}
            {/* <div className="flex items-end"> */}
            {/* <Text fontSize="14px" ml="0.125rem" mr="0.125rem" color="textSubtle"> */}
            <span>{currency?.symbol}</span>
            {/* </div> */}
            {/* {!isLastItem && <ChevronRightIcon width="12px" />} */}
            {!isLastItem && <CaretRight size={12} />}
          </Fragment>
        )
      })}
    </div>
  )
})
