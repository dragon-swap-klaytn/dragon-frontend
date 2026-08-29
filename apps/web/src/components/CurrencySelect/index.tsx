import { useTranslation } from '@pancakeswap/localization'
import { BoxProps, useModal } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CaretDownIcon } from '@phosphor-icons/react'
import CurrencySearchModal, { CurrencySearchModalProps } from 'components/SearchModal/CurrencySearchModal'
import { useStablecoinPrice } from 'hooks/useBUSDPrice'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useAccount } from 'wagmi'
import { CurrencyLogo } from '../Logo'

interface CurrencySelectProps extends CurrencySearchModalProps, BoxProps {
  hideBalance?: boolean
}

export const CurrencySelect = ({
  onCurrencySelect,
  selectedCurrency,
  showCommonBases,
  commonBasesType,
  hideBalance,
}: CurrencySelectProps) => {
  const { address: account } = useAccount()

  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    !hideBalance && selectedCurrency ? selectedCurrency : undefined,
  )

  const { t } = useTranslation()

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={selectedCurrency}
      showCommonBases={showCommonBases}
      commonBasesType={commonBasesType}
    />,
  )

  const price = useStablecoinPrice(
    account && !hideBalance && selectedCurrencyBalance && selectedCurrency ? selectedCurrency : undefined,
  )
  const quoted = selectedCurrencyBalance && price?.quote(selectedCurrencyBalance)

  return (
    <div className="w-full">
      <button
        type="button"
        className="flex items-center py-1 pl-1 pr-2 rounded-[20px] bg-neutral justify-between hover:opacity-70 w-full"
        onClick={onPresentCurrencyModal}
      >
        {!selectedCurrency ? (
          <span className="text-on-surface leading-7 pl-3">{t('Select')}</span>
        ) : (
          <div className="flex items-center space-x-2">
            <CurrencyLogo currency={selectedCurrency} size={28} />

            <span className="font-bold text-on-surface">
              {selectedCurrency && selectedCurrency.symbol && selectedCurrency.symbol.length > 20
                ? `${selectedCurrency.symbol.slice(0, 4)}...${selectedCurrency.symbol.slice(
                    selectedCurrency.symbol.length - 5,
                    selectedCurrency.symbol.length,
                  )}`
                : selectedCurrency?.symbol}
            </span>
          </div>
        )}

        <CaretDownIcon size={16} className="text-on-surface ml-2" />
      </button>

      {account && !!selectedCurrency && !hideBalance && (
        <div className="flex items-start w-full space-x-2 justify-between text-xs text-on-surface px-1 mt-1">
          <h5>{t('Balance')}:</h5>

          <div className="flex flex-col items-end">
            <span className="text-on-surface">{formatAmount(selectedCurrencyBalance, 6) ?? t('Loading')}</span>

            {quoted?.toExact() && Number.isFinite(+quoted.toExact()) && (
              <span className="text-on-surface-subtlest">~${formatNumber(+quoted.toExact())}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
