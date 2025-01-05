import { Currency } from '@pancakeswap/sdk'
import { CaretRight } from '@phosphor-icons/react'
import { Fragment, memo } from 'react'
import { unwrappedToken } from 'utils/wrappedCurrency'

export default memo(function SwapRoute({ path }: { path: Currency[] }) {
  return (
    <div className="flex flex-wrap w-full justify-end items-center text-on-surface-primary">
      {path?.map((token, i) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = token.isToken ? unwrappedToken(token) : token
        return (
          // There might be same token appear more than once
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={`${currency?.symbol}_${i}`}>
            <span>{currency?.symbol}</span>
            {!isLastItem && <CaretRight size={12} />}
          </Fragment>
        )
      })}
    </div>
  )
})
