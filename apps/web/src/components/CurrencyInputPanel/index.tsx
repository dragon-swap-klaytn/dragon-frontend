import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Pair, Percent, Token } from '@pancakeswap/sdk'
import { Skeleton, useModal } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo, DoubleCurrencyLogo } from '@pancakeswap/widgets-internal'
import { memo, PropsWithChildren, useCallback, useEffect, useMemo } from 'react'
import { safeGetAddress } from 'utils'

import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { useStablecoinPriceAmount } from 'hooks/useBUSDPrice'
import { StablePair } from 'views/AddLiquidity/AddStableLiquidity/hooks/useStableLPDerivedMintInfo'

import { CaretDown } from '@phosphor-icons/react'
import clsx from 'clsx'
import Loading from 'components/Common/Loading'
import NumberFormat from 'components/Common/NumberFormat'
import { FiatLogo } from 'components/Logo/CurrencyLogo'
import { useTokenLogo } from 'hooks/useTokenLogo'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { ButtonOnClickType } from 'types'
import { useAccount } from 'wagmi'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

// const InputRow = styled.div<{ selected: boolean }>`
//   display: flex;
//   flex-flow: row nowrap;
//   align-items: center;
//   justify-content: flex-end;
//   padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
// `
// const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
//   padding-left: 0;
//   padding-right: 0;
// `

interface CurrencyInputPanelProps {
  value: string | undefined
  onUserInput: (value: string) => void
  onInputBlur?: () => void
  onPercentInput?: (percent: number) => void
  onMax?: () => void
  showQuickInputButton?: boolean
  showMaxButton: boolean
  maxAmount?: CurrencyAmount<Currency>
  lpPercent?: string
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | StablePair | null
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  commonBasesType?: string
  showSearchInput?: boolean
  beforeButton?: React.ReactNode
  disabled?: boolean
  error?: boolean | string
  showUSDPrice?: boolean
  tokensToShow?: Token[]
  currencyLoading?: boolean
  inputLoading?: boolean
  title?: React.ReactNode
  hideBalanceComp?: boolean
}
const CurrencyInputPanel = memo(function CurrencyInputPanel({
  value,
  onUserInput,
  onInputBlur,
  onPercentInput,
  onMax,
  showQuickInputButton = false,
  showMaxButton,
  maxAmount,
  lpPercent,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  beforeButton,
  pair = null, // used for double token logo
  otherCurrency,
  id,
  showCommonBases,
  commonBasesType,
  showSearchInput,
  disabled,
  error,
  showUSDPrice,
  tokensToShow,
  currencyLoading,
  inputLoading,
  title,
  hideBalanceComp,
}: CurrencyInputPanelProps) {
  const { address: account } = useAccount()

  useEffect(() => {
    console.log('label', label)
  }, [label])

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { t } = useTranslation()

  const mode = id
  const token = pair ? pair.liquidityToken : currency?.isToken ? currency : null
  const tokenAddress = token ? safeGetAddress(token.address) : null

  const amountInDollar = useStablecoinPriceAmount(
    showUSDPrice ? currency ?? undefined : undefined,
    value !== undefined && Number.isFinite(+value) ? +value : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(value !== undefined && Number.isFinite(+value)),
    },
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
      commonBasesType={commonBasesType}
      showSearchInput={showSearchInput}
      tokensToShow={tokensToShow}
      mode={mode}
    />,
  )

  const percentAmount = useMemo(
    () => ({
      25: maxAmount ? maxAmount.multiply(new Percent(25, 100)).toExact() : undefined,
      50: maxAmount ? maxAmount.multiply(new Percent(50, 100)).toExact() : undefined,
      75: maxAmount ? maxAmount.multiply(new Percent(75, 100)).toExact() : undefined,
    }),
    [maxAmount],
  )

  const handleUserInput = useCallback(
    (val: string) => {
      onUserInput(val)
    },
    [onUserInput],
  )

  const onCurrencySelectClick = useCallback(() => {
    if (!disableCurrencySelect) {
      onPresentCurrencyModal()
    }
  }, [onPresentCurrencyModal, disableCurrencySelect])

  const isAtPercentMax = (maxAmount && value === maxAmount.toExact()) || (lpPercent && lpPercent === '100')

  const balance = !hideBalance && !!currency ? formatAmount(selectedCurrencyBalance, 6) : undefined

  const tokenLogo = useTokenLogo(token)
  const isToInput = useMemo(() => ['To', 'To (estimated)'].includes(label || ''), [label])

  useEffect(() => {
    console.log('currency')
    console.log(currency)
  }, [currency])

  // const InputRow = styled.div<{ selected: boolean }>`
  //   display: flex;
  //   flex-flow: row nowrap;
  //   align-items: center;
  //   justify-content: flex-end;
  //   padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
  // `
  // const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  //   padding-left: 0;
  //   padding-right: 0;
  // `

  return (
    <div className="relative rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        {title}
        <div className="flex items-center">
          {beforeButton}

          <button
            type="button"
            className="hover:opacity-70"
            // selected={!!currency}
            onClick={onCurrencySelectClick}
          >
            {/* <div className='flex items-center space-x-2'>
                {currency && <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />}
              
              </div> */}
            {/* <Flex alignItems="center" justifyContent="space-between"> */}
            <div className="flex items-center py-1 pl-1 pr-2 rounded-[20px] bg-surface-container-highest">
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
              ) : currency ? (
                id === 'onramp-input' ? (
                  <FiatLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
                ) : (
                  <CurrencyLogo currency={currency} size="28px" style={{ marginRight: '8px' }} />
                )
              ) : currencyLoading ? (
                <Skeleton width="24px" height="24px" variant="circle" />
              ) : null}
              {currencyLoading ? null : pair ? (
                // <Text id="pair" bold>
                <span className="text-xs font-bold">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </span>
              ) : (
                // <Text id="pair" bold>
                <span className="font-bold text-white">
                  {(currency && currency.symbol && currency.symbol.length > 10
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length,
                      )}`
                    : currency?.symbol) || t('Select a currency')}
                </span>
              )}
              {/* {!currencyLoading && !disableCurrencySelect && <ArrowDropDownIcon />} */}
              {!currencyLoading && !disableCurrencySelect && <CaretDown size={16} className="text-white ml-2" />}
            </div>
          </button>
          {/* 
          {token && tokenAddress ? (
            // <Flex style={{ gap: '4px' }} ml="4px" alignItems="center">
            <div className="flex items-center space-x-1 ml-1">
              <CopyButton
                width="16px"
                buttonColor="textSubtle"
                text={tokenAddress}
                tooltipMessage={t('Token address copied')}
              />
              <AddToWalletButton
                variant="text"
                p="0"
                height="auto"
                width="fit-content"
                tokenAddress={tokenAddress}
                tokenSymbol={token.symbol}
                tokenDecimals={token.decimals}
                tokenLogo={tokenLogo}
              />
            </div>
          ) : null} */}
        </div>
        {account && !hideBalanceComp && (
          <button
            type="button"
            className={clsx('text-xs text-on-surface-secondary mr-2', {
              'hover:opacity-70': !disabled && !isToInput,
              'cursor-default': disabled || isToInput,
            })}
            onClick={!disabled ? onMax : undefined}
            // color="textSubtle"
            // fontSize="12px"
            // ellipsis
            // title={!hideBalance && !!currency ? t('Balance: %balance%', { balance: balance ?? t('Loading') }) : ' -'}
            // style={{ display: 'inline', cursor: 'pointer' }}
          >
            {!hideBalance && !!currency
              ? (balance?.replace('.', '')?.length || 0) > 12
                ? balance
                : t('Balance: %balance%', { balance: balance ?? t('Loading') })
              : ' -'}
          </button>
        )}
      </div>
      <div
        className="flex flex-col flex-nowrap relative bg-surface-container-highest rounded-2xl z-10"
        // display="flex"
        // flexDirection="column"
        // flexWrap="nowrap"
        // position="relative"
        // backgroundColor="formBackground"
        // zIndex="1"
        // className="bg-surface-container-highest rounded-2xl"
      >
        {/* <AtomBox
          as="label"
          className={clsx(
            // SwapCSS.inputContainerVariants({
            //   showBridgeWarning: !!showBridgeWarning,
            //   error: Boolean(error),
            // }),
            'bg-surface-container-highest',
          )}
        > */}
        {/* <AtomBox
          display="flex"
          flexDirection="row"
          flexWrap="nowrap"
          color="text"
          fontSize="12px"
          lineHeight="16px"
          px="16px"
          pt="12px"
        > */}
        <div
          className="flex flex-nowrap px-4 pt-3"
          // display="flex"
          // flexDirection="row"
          // flexWrap="nowrap"
          // color="text"
          // fontSize="12px"
          // lineHeight="16px"
          // px="16px"
          // pt="12px"
        >
          <NumberFormat
            // error={error ?? false}
            disabled={disabled}
            // loading={inputLoading}
            className="text-white text-lg bg-surface-container-highest w-full text-right focus:outline-none"
            value={value}
            onBlur={onInputBlur}
            onChange={(e) => {
              console.log('__e?', e.target.value)
              onUserInput(e.target.value.replace(/,/g, ''))
            }}
            thousandSeparator
            allowNegative={false}
            decimalScale={2}
            placeholder="0.00"
          />
          {/* <NumericalInput
              error={Boolean(error)}
              disabled={disabled}
              loading={loading}
              className="token-amount-input text-white text-lg"
              value={value}
              onBlur={onInputBlur}
              onUserInput={(val) => {
                onUserInput(val);
                console.log("__origin?", val);
              }}
            /> */}
        </div>

        {!!showUSDPrice && (
          // <Flex justifyContent="flex-end" mr="1rem">
          <div className="flex items-center justify-end">
            {/* <Flex maxWidth="200px"> */}
            <div className="max-w-[200px] pr-4">
              {inputLoading ? (
                // <Loading width="14px" height="14px" />
                <Loading size={16} className="text-on-surface-secondary" />
              ) : showUSDPrice && Number.isFinite(amountInDollar ?? 0) ? (
                // <Text fontSize="12px" color="textSubtle" ellipsis>
                <p className="text-xs text-on-surface-tertiary">
                  {`${amountInDollar ? `~${formatNumber(amountInDollar)}` : 0} USD`}
                </p>
              ) : (
                // <Box height="18px" />
                <></>
              )}
            </div>
          </div>
        )}

        {/* // const InputRow = styled.div<{ selected: boolean }>`
  //   display: flex;
  //   flex-flow: row nowrap;
  //   align-items: center;
  //   justify-content: flex-end;
  //   padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
  // ` */}

        {!isToInput && account ? (
          // <InputRow selected={disableCurrencySelect}>
          <div className="flex flex-nowrap items-center justify-end mt-2.5 pb-4 px-3">
            {currency && selectedCurrencyBalance?.greaterThan(0) && !disabled && (
              // <Flex alignItems="right" justifyContent="right">
              <div className="flex items-center justify-end space-x-2">
                {maxAmount?.greaterThan(0) &&
                  showQuickInputButton &&
                  onPercentInput &&
                  [25, 50, 75].map((percent) => {
                    // const isAtCurrentPercent =
                    //   (maxAmount && value !== '0' && value === percentAmount[percent]) ||
                    //   (lpPercent && lpPercent === percent.toString())

                    return (
                      <PercentageButton key={`btn_quickCurrency${percent}`} onClick={() => onPercentInput(percent)}>
                        {percent}%
                      </PercentageButton>
                    )
                  })}
                {maxAmount?.greaterThan(0) && showMaxButton && (
                  <PercentageButton
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onMax?.()
                    }}
                  >
                    {t('Max')}
                  </PercentageButton>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="pb-3" />
        )}

        {/* </AtomBox> */}

        {error ? <p className="pb-2 text-xs text-red-500">{error}</p> : null}

        {disabled && (
          // <AtomBox role="presentation" position="absolute" inset="0px" backgroundColor="backgroundAlt" opacity="0.6" />
          <div className="absolute inset-0 bg-red-600 opacity-50" />
        )}
      </div>
    </div>

    // <SwapUI.CurrencyInputPanel
    //   id={id}
    //   disabled={disabled}
    //   error={error as boolean}
    //   value={value}
    //   onInputBlur={onInputBlur}
    //   onUserInput={handleUserInput}
    //   loading={inputLoading}
    //   top={

    //   }
    //   bottom={

    //   }
    // />
  )
})

export default CurrencyInputPanel

function PercentageButton({
  children,
  onClick,
}: PropsWithChildren<{
  onClick: ButtonOnClickType
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[13px] bg-surface-container-high px-2 py-1 text-white rounded-2xl hover:opacity-70"
    >
      {children}
    </button>
  )
}
