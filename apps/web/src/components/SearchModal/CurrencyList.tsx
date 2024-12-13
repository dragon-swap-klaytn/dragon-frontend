import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Token } from '@pancakeswap/sdk'
import { QuestionHelper, Text } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { ArrowRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { LightGreyCard } from 'components/Card'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { styled } from 'styled-components'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { fiatCurrencyMap } from 'views/BuyCrypto/constants'
import { useAccount } from 'wagmi'
import { useIsUserAddedToken } from '../../hooks/Tokens'
import { useCombinedActiveList } from '../../state/lists/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { isTokenOnList } from '../../utils'
import { RowBetween } from '../Layout/Row'
import ImportRow from './ImportRow'

function currencyKey(currency: Currency): string {
  return currency?.isToken ? currency.address : currency?.isNative ? currency.symbol : ''
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <StyledBalanceText title={balance.toExact()}>{formatAmount(balance, 4)}</StyledBalanceText>
}

const MenuItem = styled(RowBetween)<{ disabled: boolean; selected: boolean }>`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) minmax(0, 72px);
  grid-gap: 8px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.colors.background};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
}: // otherSelected,
// style,
// onRampFlow,
// mode,
{
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  // otherSelected: boolean
  // style: CSSProperties
  // onRampFlow: boolean
  // mode: string
}) {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const key = currencyKey(currency)
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)

  const balance = useCurrencyBalance(account ?? undefined, currency)

  //   const MenuItem = styled(RowBetween)<{ disabled: boolean; selected: boolean }>`
  //   padding: 4px 20px;
  //   height: 56px;
  //   display: grid;
  //   grid-template-columns: auto minmax(auto, 1fr) minmax(0, 72px);
  //   grid-gap: 8px;
  //   cursor: ${({ disabled }) => !disabled && 'pointer'};
  //   pointer-events: ${({ disabled }) => disabled && 'none'};
  //   &:hover {
  //     background-color: ${({ theme, disabled }) => !disabled && theme.colors.background};
  //   }
  //   opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
  // `

  // only show add or remove buttons if not on selected list
  return (
    <button
      // style={style}
      // className={`token-item-${key}`}
      type="button"
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      // selected={otherSelected}
      className={clsx('flex items-center justify-between w-full p-3 hover:opacity-70 rounded-md', {
        'bg-surface-container-highest': isSelected,
      })}
    >
      <div className="flex items-center space-x-2">
        <CurrencyLogo currency={currency} size="24px" />
        <div className="flex flex-col items-start">
          <span className="font-bold text-sm">{currency?.symbol}</span>

          <span className="text-xs max-w-40 overflow-hidden text-ellipsis text-gray-400 whitespace-nowrap">
            {!isOnSelectedList && customAdded && `${t('Added by user')} •`} {currency?.name}
          </span>
        </div>
      </div>

      {/* <Column>
        <Text bold>{currency?.symbol}</Text>
        <Text color="textSubtle" small ellipsis maxWidth="200px">
          {!isOnSelectedList && customAdded && `${t('Added by user')} •`} {currency?.name}
        </Text>
      </Column> */}

      <span className="text-right">{balance ? <Balance balance={balance} /> : <ArrowRight size={20} />}</span>
      {/* <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account && !onRampFlow ? <CircleLoader /> : <ArrowForwardIcon />}
      </RowFixed> */}
    </button>
  )
}

export default function CurrencyList({
  height,
  currencies,
  inactiveCurrencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showNative,
  showImportView,
  setImportToken,
  breakIndex,
  mode,
}: {
  height: number | string
  currencies: Currency[]
  inactiveCurrencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showNative: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
  breakIndex: number | undefined
  mode: string
}) {
  const native = useNativeCurrency()

  const itemData: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = showNative
      ? [native, ...currencies, ...inactiveCurrencies]
      : [...currencies, ...inactiveCurrencies]
    if (breakIndex !== undefined) {
      formatted = [...formatted.slice(0, breakIndex), undefined, ...formatted.slice(breakIndex, formatted.length)]
    }
    return formatted.sort((a, b) => {
      if (!a || !b) return 0

      return a.symbol.localeCompare(b.symbol)
    })
  }, [breakIndex, currencies, inactiveCurrencies, showNative, native])

  const { chainId } = useActiveChainId()

  const { t } = useTranslation()

  const Row = useCallback(
    // ({ data, index, style }) => {
    ({ index }) => {
      const currency: any = itemData[index]
      const isFiat = Boolean(Object.keys(fiatCurrencyMap).includes(currency?.symbol))

      // the alternative to making a fiat currency token list
      // with class methods
      let isSelected = false
      let otherSelected = false
      if (!isFiat && mode !== 'onramp-input') {
        isSelected = Boolean(selectedCurrency && currency && selectedCurrency.equals(currency))
        otherSelected = Boolean(otherCurrency && currency && otherCurrency.equals(currency))
      } else {
        isSelected = Boolean(selectedCurrency?.symbol && currency && selectedCurrency?.symbol === currency?.symbol)
        otherSelected = Boolean(otherCurrency?.symbol && currency && otherCurrency?.symbol === currency?.symbol)
      }
      const handleSelect = () => onCurrencySelect(currency)
      // const handleSelect = () => {
      //   console.log('__onclick')
      // }

      const token = wrappedCurrency(currency, chainId)

      const showImport = index > currencies.length

      if (index === breakIndex || !itemData) {
        return (
          // <FixedContentRow style={style}>
          <FixedContentRow>
            <LightGreyCard padding="8px 12px" borderRadius="8px">
              <RowBetween>
                <Text small>{t('Expanded results from inactive Token Lists')}</Text>
                <QuestionHelper
                  text={t(
                    "Tokens from inactive lists. Import specific tokens below or click 'Manage' to activate more lists.",
                  )}
                  ml="4px"
                />
              </RowBetween>
            </LightGreyCard>
          </FixedContentRow>
        )
      }

      if (showImport && token) {
        return (
          <ImportRow
            onCurrencySelect={handleSelect}
            token={token}
            showImportView={showImportView}
            setImportToken={setImportToken}
            dim
          />
        )
      }

      return <CurrencyRow currency={currency} isSelected={isSelected} onSelect={handleSelect} />
    },
    [
      selectedCurrency,
      otherCurrency,
      chainId,
      currencies.length,
      breakIndex,
      onCurrencySelect,
      t,
      showImportView,
      setImportToken,
      mode,
      itemData,
    ],
  )

  const itemKey = useCallback((index: number, data: any) => `${currencyKey(data[index])}-${index}`, [])

  return (
    // <FixedSizeList
    //   height={height}
    //   ref={fixedListRef as any}
    //   width="100%"
    //   itemData={itemData}
    //   itemCount={itemData.length}
    //   itemSize={36}
    //   itemKey={itemKey}
    // >
    //   {Row}
    // </FixedSizeList>
    <div className="flex flex-col overflow-y-auto max-h-[400px]">{itemData.map((_, index) => Row({ index }))}</div>
  )
}
