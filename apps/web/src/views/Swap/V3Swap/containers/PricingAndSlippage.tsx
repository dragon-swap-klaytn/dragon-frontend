import { Loading, useModal } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/sdk'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { memo, useState } from 'react'

import { useIsMounted } from '@pancakeswap/hooks'
import { formatPrice } from '@pancakeswap/utils/formatFractions'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import clsx from 'clsx'
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

  if (isWrapping) {
    return null
  }

  return (
    <div className="flex flex-col py-0 px-2 space-y-1">
      <p className="flex items-center justify-between space-x-4">
        <span className="text-on-surface-brand text-[13px]">{t('Price')}</span>

        <span
          className={clsx('text-sm flex items-center justify-center space-x-1', {
            'opacity-60': priceLoading,
          })}
        >
          {show ? (
            <>
              <span className="text-[13px] text-on-surface">
                {`1 ${showInverted ? price?.baseCurrency?.symbol : price?.quoteCurrency?.symbol}`}
              </span>

              {priceLoading ? (
                <Loading size={16} className="text-on-surface-subtle" />
              ) : (
                <button
                  type="button"
                  className="text-sm text-on-surface-subtlest hover:opacity-70"
                  onClick={() => setShowInverted(!showInverted)}
                >
                  <ArrowsLeftRight size={16} />
                </button>
              )}

              <span className="text-[13px] text-on-surface">
                {`${formattedPrice} ${showInverted ? price?.quoteCurrency?.symbol : price?.baseCurrency?.symbol}`}
              </span>
            </>
          ) : (
            <span className="text-[13px] text-on-surface">-</span>
          )}
        </span>
      </p>
      {typeof allowedSlippage === 'number' && (
        <button
          type="button"
          className="flex items-center w-full justify-between hover:opacity-70 text-[13px] text-on-surface"
          onClick={onPresentSettingsModal}
        >
          <span className="text-[13px]">{t('Slippage Tolerance')}</span>

          {isMounted && Boolean(showSlippage && allowedSlippage) && <span>{allowedSlippage / 100}%</span>}
        </button>
      )}
    </div>
  )
})
