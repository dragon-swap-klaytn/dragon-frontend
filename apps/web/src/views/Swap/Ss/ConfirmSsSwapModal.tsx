import { Trans, useTranslation } from '@pancakeswap/localization'
import {
  ButtonV2,
  CurrencyLogo,
  CurrencyLogoWithSymbol,
  Dots,
  ExternalLink,
  InjectedModalProps,
  Notification,
  QuestionHelper,
  Spinner,
  TruncatedText,
  useToast,
  ZERO_ADDRESS,
} from '@pancakeswap/uikit'
import {
  Dispatch,
  lazy,
  memo,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { SwapPendingModalContent } from '@pancakeswap/widgets-internal'

import { Currency, CurrencyAmount, Percent, Price } from '@pancakeswap/swap-sdk-core'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { ArrowDownIcon, ArrowsLeftRightIcon } from '@phosphor-icons/react'
import { ToastDescriptionWithTx } from 'components/Toast'
import { SS_REFERRER_FEE_DENOMINATOR, SS_REFERRER_FEE_NUMERATOR } from 'const'
import { useCurrency, useTokenMap } from 'hooks/Tokens'
import useA2AConnectorQRUri from 'hooks/useA2AConnectorQRUri'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useCatchTxError from 'hooks/useCatchTxError'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTokenPrices from 'hooks/useTokenPrices'
import { QuoteResponse } from 'pages/api/ss/quote'
import { KeyedMutator } from 'swr'
import { calculateGasMargin } from 'utils'
import { basisPointsToPercent } from 'utils/exchange'
import { viemClients } from 'utils/viem'
import { Address, hexToBigInt } from 'viem'
import ConfirmSsSwapModalContainer from 'views/Swap/Ss/ConfirmSsSwapModalContainer'
import { useSendFeeDelegatedTx } from 'views/Swap/V3Swap/hooks/useSendFeeDelegatedTx'
import { formatExecutionPrice } from 'views/Swap/V3Swap/utils/exchange'
import FormattedPriceImpact from 'views/Swap/components/FormattedPriceImpact'
import { useWalletClient } from 'wagmi'

const QRCodeSVG = lazy(() => import('qrcode.react').then((module) => ({ default: module.QRCodeSVG })))

function countDecimalPlaces(num: number) {
  const str = num.toString()
  if (!str.includes('.')) return 0
  return str.split('.')[1].length
}

interface ConfirmSsSwapModalProps {
  quote?: QuoteResponse
  refreshQuote: KeyedMutator<QuoteResponse>
  refreshing?: boolean
}

export const ConfirmSsSwapModal = memo<InjectedModalProps & ConfirmSsSwapModalProps>(function ConfirmSsSwapModalComp({
  quote,
  refreshQuote,
  refreshing = false,
  onDismiss,
}) {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()
  const { qrUri, requestKey, cancelKlipRequest, initKlipRequest } = useA2AConnectorQRUri()

  const handleDismiss = useCallback(() => {
    onDismiss?.()

    if (requestKey) {
      cancelKlipRequest()
    }
  }, [onDismiss, requestKey, cancelKlipRequest])

  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  const onDone = useCallback(() => {
    if (!quote) {
      return
    }

    initKlipRequest()

    if (quote.type === 'approve') {
      refreshQuote()
    }

    if (quote.type === 'swap') {
      handleDismiss()
    }
  }, [refreshQuote, quote, handleDismiss, initKlipRequest, qrUri, requestKey])

  const [innerQuote, setInnerQuote] = useState<QuoteResponse | undefined>(quote)
  useEffect(() => {
    if (attemptingTxn) {
      return
    }

    setInnerQuote(quote)
  }, [quote, attemptingTxn])

  const currencyA = useCurrency(innerQuote?.input.address)
  const currencyB = useCurrency(innerQuote?.output.address)

  const [title, setTitle] = useState<string>('')
  const modalContent = useMemo(() => {
    if (!innerQuote && (!currencyA || !currencyB)) {
      return <LoadingQuote />
    }

    if (innerQuote?.type === 'approve' && currencyA) {
      setTitle(t('Enable spending {{symbol}}', { symbol: `${currencyA.symbol}` }))
    }
    if (innerQuote?.type === 'swap') {
      setTitle(t('Confirm Swap'))
    }

    if (attemptingTxn) {
      if (innerQuote?.type === 'approve') {
        return <ApproveModalContent qrUri={qrUri} />
      }

      if (innerQuote?.type === 'swap' && currencyA && currencyB) {
        const amountA = +innerQuote.input.amount / 10 ** currencyA.decimals
        const amountB = +innerQuote.output.estimatedAmountDeductingFee / 10 ** currencyB.decimals

        return (
          <SwapPendingModalContent
            currencyA={currencyA}
            currencyB={currencyB}
            amountA={amountA.toString()}
            amountB={amountB.toString()}
            qrUri={qrUri}
          />
        )
      }
    }

    if (!quote) {
      return <LoadingQuote />
    }

    return <SsSwapContent quote={quote} onDone={onDone} setAttemptingTxn={setAttemptingTxn} />
  }, [quote, currencyA, currencyB, attemptingTxn, t, qrUri, onDone, innerQuote])

  if (!chainId) return null

  return (
    <ConfirmSsSwapModalContainer
      handleDismiss={handleDismiss}
      title={title}
      refreshQuote={refreshQuote}
      refreshing={refreshing}
    >
      {modalContent}
    </ConfirmSsSwapModalContainer>
  )
})

function LoadingQuote() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col w-full items-center justify-center space-y-3">
      <Spinner />

      <Dots className="text-sm">{t('Currently retrieving the quote')}</Dots>
    </div>
  )
}

function SsSwapContent({
  quote,
  onDone,
  setAttemptingTxn,
}: {
  quote: QuoteResponse
  onDone: () => void
  setAttemptingTxn: Dispatch<SetStateAction<boolean>>
}) {
  const { t } = useTranslation()

  const { tokenMap } = useTokenMap()
  const native = useNativeCurrency()
  const inputCurrency = quote.input.address === ZERO_ADDRESS ? native : tokenMap?.[quote.input.address]
  const outputCurrency = quote.output.address === ZERO_ADDRESS ? native : tokenMap?.[quote.output.address]

  const [showInverted, setShowInverted] = useState<boolean>(false)

  const minimumAmount = outputCurrency ? CurrencyAmount.fromRawAmount(outputCurrency, quote.output.minimumAmount) : null
  const inputAmount = inputCurrency ? CurrencyAmount.fromRawAmount(inputCurrency, quote.input.amount) : null
  const outputAmount = outputCurrency
    ? CurrencyAmount.fromRawAmount(outputCurrency, quote.output.estimatedAmountDeductingFee)
    : null

  const { prices } = useTokenPrices({
    source: 'swapscanner',
  })

  const executionPriceDisplay = useMemo(() => {
    if (!inputCurrency || !outputCurrency || !inputAmount || !outputAmount || !prices) {
      return '-'
    }

    const priceInIO = new Price(
      inputAmount.currency,
      outputAmount.currency,
      inputAmount.quotient,
      outputAmount.quotient,
    )

    return formatExecutionPrice(priceInIO, inputAmount, outputAmount, showInverted)
  }, [inputAmount, outputAmount, showInverted, inputCurrency, outputCurrency, prices])

  const priceImpact = useMemo(() => {
    if (!quote.priceImpact) return new Percent(0, 100)
    const decimals = countDecimalPlaces(quote.priceImpact)

    return new Percent((quote.priceImpact * 10 ** decimals).toFixed(0), 10 ** decimals)
  }, [quote.priceImpact])

  const tradeInfoText = useMemo(() => {
    return t('Output is estimated. You will receive at least {{amount}} {{symbol}} or the transaction will revert.', {
      amount: formatAmount(minimumAmount, 6),
      symbol: outputCurrency?.symbol,
    })
  }, [t, minimumAmount, outputCurrency])

  const [allowedSlippage] = useUserSlippage()

  const { data: signer } = useWalletClient()
  const { sendTx } = useSendFeeDelegatedTx()
  const { loading, setLoading, fetchWithCatchTxError } = useCatchTxError()
  const { toastSuccess } = useToast()
  const { chainId } = useActiveChainId()
  const publicClient = viemClients[chainId as keyof typeof viemClients]

  const executeQuote = useCallback(async () => {
    try {
      if (!quote) {
        return
      }

      const { data, to, value, from } = quote.tx

      const txn = {
        to,
        data,
        value: hexToBigInt(value),
        account: from,
        chain: signer?.chain,
      }

      setAttemptingTxn(true)
      const resp = await fetchWithCatchTxError(() =>
        publicClient.estimateGas(txn).then((estimate) => {
          const newTxn = {
            ...txn,
            gas: calculateGasMargin(estimate),
          }

          return sendTx(newTxn)
        }),
      )

      if (resp?.status) {
        toastSuccess(`${t('Swap Completed')}!`, <ToastDescriptionWithTx txHash={resp.transactionHash} />)

        onDone()
      }

      setAttemptingTxn(false)
    } catch (error) {
      console.error('Error fetching quote:', error)
      throw error
    }
  }, [quote, t, publicClient, sendTx, fetchWithCatchTxError, toastSuccess, signer?.chain, onDone, setAttemptingTxn])

  return (
    <div className="flex flex-col items-center">
      <Notification className="text-sm break-keep mb-4" variant="positive">
        <Trans
          i18nKey="<b>Swapscanner</b> aggregates all DEXs on the Kaia chain to provide the best swap quotes, and this swap is executed based on those quotes."
          components={{
            b: <span className="font-bold" />,
          }}
        />
      </Notification>

      <div className="flex flex-col items-center space-y-3 w-full">
        <TokenAmountRow amount={inputAmount} currency={inputCurrency || undefined} />
        <ArrowDownIcon size={24} className="text-gray-50" />
        <TokenAmountRow amount={outputAmount} currency={outputCurrency || undefined} />
      </div>

      <p className="text-center text-on-surface text-sm mt-4 break-keep">{tradeInfoText}</p>

      <div className="mt-4 w-full">
        <div className="flex flex-col space-y-3 p-4 bg-neutral rounded-[20px] text-on-surface">
          <SwapModalFooterContainer>
            <SwapModalFooterTitle title={t('Price')} />

            <div className="flex items-center space-x-2 text-sm">
              <span className="whitespace-nowrap">{executionPriceDisplay}</span>

              <button type="button" onClick={() => setShowInverted(!showInverted)}>
                <ArrowsLeftRightIcon size={16} />
              </button>
            </div>
          </SwapModalFooterContainer>

          <SwapModalFooterContainer>
            <SwapModalFooterTitle title={t('Slippage Tolerance')} />

            <div className="text-sm">
              {typeof allowedSlippage === 'number'
                ? `${basisPointsToPercent(allowedSlippage).toFixed(2)}%`
                : allowedSlippage}
            </div>
          </SwapModalFooterContainer>

          <SwapModalFooterContainer>
            <SwapModalFooterTitle
              title={t('Minimum received')}
              questionHelperText={t(
                'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
              )}
            />

            <div className="flex items-center space-x-1 text-sm whitespace-nowrap">
              <span>{formatAmount(minimumAmount, 4) ?? '-'}</span>
              <span>{outputCurrency?.symbol}</span>
            </div>
          </SwapModalFooterContainer>

          <SwapModalFooterContainer>
            <SwapModalFooterTitle
              title={t('Price Impact')}
              questionHelperText={t('The difference between the market price and your price due to trade size.')}
            />

            <FormattedPriceImpact priceImpact={priceImpact} />
          </SwapModalFooterContainer>

          <SwapModalFooterContainer>
            <SwapModalFooterTitle
              title={t('Trading Fee')}
              questionHelperText={
                <div className="text-sm">
                  <p className="mb-2 break-keep">
                    {t('The swap fee consists of the DragonSwap fee and the Swapscanner fee.')}
                  </p>
                  <p className="mb-1 break-keep">
                    {t('- DragonSwap fee: {{fee}}% of the input token', {
                      fee: +SS_REFERRER_FEE_NUMERATOR / +SS_REFERRER_FEE_DENOMINATOR,
                    })}
                  </p>

                  <ExternalLink href={t('Swapscanner-fee-link')}>{t('- Swapscanner fee')}</ExternalLink>
                </div>
              }
            />

            {quote.fees.length > 0 && (
              <div className="flex flex-col items-end space-y-2 text-sm">
                {quote.fees.map((fee) => {
                  const feeCurrency =
                    fee.address === ZERO_ADDRESS ? native : tokenMap?.[fee.address.toLowerCase() as Address]
                  if (!feeCurrency) return null

                  const feeAmount = CurrencyAmount.fromRawAmount(feeCurrency, fee.amount)

                  return (
                    <div key={`${fee.type}-${fee.address}`} className="flex items-center space-x-2">
                      <span className="text-sm">{`${formatAmount(feeAmount, 6)} ${feeCurrency.symbol}`}</span>
                      <CurrencyLogo currency={feeCurrency} size={24} />
                    </div>
                  )
                })}{' '}
              </div>
            )}
          </SwapModalFooterContainer>
        </div>

        <ButtonV2 className="mt-3" variant="primary" onClick={executeQuote} fullWidth>
          {quote.type === 'swap' ? t('Confirm Swap') : t('Confirm Approval')}
        </ButtonV2>
      </div>
    </div>
  )
}

function TokenAmountRow({ amount, currency }: { amount: CurrencyAmount<Currency> | null; currency?: Currency }) {
  if (!amount) return null

  return (
    <div className="flex items-center space-x-2 text-sm justify-between w-full rounded-[20px] p-2 bg-neutral text-on-surface">
      <CurrencyLogoWithSymbol currencyA={currency ?? amount.currency} symbol={amount.currency.symbol} logoSize={28} />

      <TruncatedText className="font-bold text-right pr-2">{formatAmount(amount, 6)}</TruncatedText>
    </div>
  )
}

// const [allowedSlippage] = useUserSlippage()

function SwapModalFooterContainer({ children }: PropsWithChildren) {
  return <div className="flex items-center justify-between space-x-2 overflow-x-auto">{children}</div>
}

function SwapModalFooterTitle({ title, questionHelperText }: { title: string; questionHelperText?: ReactNode }) {
  return (
    <div className="flex items-center space-x-1">
      <h4 className="text-sm whitespace-nowrap">{title}</h4>
      {questionHelperText && <QuestionHelper text={questionHelperText} placement="top" ml="4px" />}
    </div>
  )
}

const ApproveModalContent = ({ qrUri }: { qrUri?: string }) => {
  const { t } = useTranslation()

  return (
    <div className="w-full flex flex-col items-center space-y-7">
      {qrUri ? (
        <Suspense fallback={<Spinner />}>
          <QRCodeSVG value={qrUri} size={144} level="H" includeMargin />
        </Suspense>
      ) : (
        <Spinner />
      )}

      <Dots className="text-sm">{t('waiting approve')}</Dots>
    </div>
  )
}
