import { useModal } from '@pancakeswap/uikit'
import { Swap as SwapUI } from '@pancakeswap/widgets-internal'

import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/sdk'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { memo, useState } from 'react'

import { useIsMounted } from '@pancakeswap/hooks'
import { formatPrice } from '@pancakeswap/utils/formatFractions'
// import { SwapInfoLabel } from '@pancakeswap/widgets-internal/swap/SwapInfo'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import Loading from 'components/Common/Loading'
import SettingsModal from '../../../../components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from '../../../../components/Menu/GlobalSettings/types'
import { useIsWrapping } from '../hooks'

interface Props {
  showSlippage?: boolean
  priceLoading?: boolean
  price?: Price<Currency, Currency> | null
}

export const PricingAndSlippage = memo(function PricingAndSlippage({
  priceLoading,
  price,
  showSlippage = true,
}: Props) {
  const { t } = useTranslation()
  const [allowedSlippage] = useUserSlippage()
  const isWrapping = useIsWrapping()
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  const [showInverted, setShowInverted] = useState<boolean>(false)
  const formattedPrice = showInverted ? formatPrice(price, 6) : formatPrice(price?.invert(), 6)
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)

  const isMounted = useIsMounted()
  // const allowedSlippage = showSlippage ? allowedSlippage : undefined

  if (isWrapping) {
    return null
  }

  const priceNode = price ? (
    <>
      <SwapUI.InfoLabel>{t('Price')}</SwapUI.InfoLabel>
      <SwapUI.TradePrice price={price} loading={priceLoading} />
    </>
  ) : null

  return (
    // <SwapUI.Info
    //   price={priceNode}
    //   allowedSlippage={showSlippage ? allowedSlippage : undefined}
    //   onSlippageClick={onPresentSettingsModal}
    // />

    // <AutoColumn gap="sm" py="0px" px="16px">
    <div className="flex flex-col py-0 px-2 space-y-1">
      {/* <RowBetween alignItems="center">{price}</RowBetween> */}
      <p className="flex items-center justify-between space-x-4">
        <span className="text-on-surface-accent text-[13px]">{t('Price')}</span>

        {/* <Text
      fontSize="14px"
      style={{ justifyContent: "center", alignItems: "center", display: "flex", opacity: loading ? 0.6 : 1 }}
    > */}
        <span
          className={clsx('text-sm flex items-center justify-center space-x-1', {
            'opacity-60': priceLoading,
          })}
        >
          {show ? (
            // <div className="flex items-center space-x-1">
            <>
              <span className="text-[13px] text-on-surface-primary">
                {`1 ${showInverted ? price?.baseCurrency?.symbol : price?.quoteCurrency?.symbol}`}
              </span>
              {/* <SyncAltIcon width="14px" height="14px" color="textSubtle" ml="4px" mr="4px" /> */}

              {priceLoading ? (
                // <AtomBox className={SwapCSS.iconButtonClass}>
                //   <Loading width="12px" height="12px" />
                // </AtomBox>
                <Loading size={16} />
              ) : (
                // <AtomBox
                //   role="button"
                //   className={SwapCSS.iconButtonClass}
                //   onClick={() => setShowInverted(!showInverted)}
                // >
                //   <AutoRenewIcon width="14px" />
                // </AtomBox>
                <button
                  type="button"
                  className="text-sm text-on-surface-tertiary hover:opacity-70"
                  onClick={() => setShowInverted(!showInverted)}
                >
                  <ArrowsLeftRight size={16} />
                </button>
              )}

              <span className="text-[13px] text-on-surface-primary">
                {`${formattedPrice} ${showInverted ? price?.quoteCurrency?.symbol : price?.baseCurrency?.symbol}`}
              </span>
            </>
          ) : (
            '-'
          )}
        </span>
      </p>
      {typeof allowedSlippage === 'number' && (
        // <RowBetween alignItems="center">
        <button
          type="button"
          className="flex items-center w-full justify-between hover:opacity-70 text-[13px]"
          onClick={onPresentSettingsModal}
        >
          <span className="text-[13px]">{t('Slippage Tolerance')}</span>

          {isMounted && Boolean(showSlippage && allowedSlippage) && <span>{allowedSlippage / 100}%</span>}
        </button>
      )}
    </div>
  )
})
