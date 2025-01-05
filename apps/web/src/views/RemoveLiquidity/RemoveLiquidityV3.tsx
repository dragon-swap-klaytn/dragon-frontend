import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, WNATIVE } from '@pancakeswap/sdk'
import { CAKE_SYMBOL } from '@pancakeswap/tokens'
import {
  ButtonV2,
  CurrencyLogoWithAmount,
  CurrencyLogoWithSymbol,
  PercentageSlider,
  useModal,
} from '@pancakeswap/uikit'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'

import { useDebouncedChangeHandler } from '@pancakeswap/hooks'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { MasterChefV3, NonfungiblePositionManager } from '@pancakeswap/v3-sdk'
import { AppBody, AppHeader } from 'components/App'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import { CurrencyLogo } from 'components/Logo'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import useLocalSelector from 'contexts/LocalRedux/useSelector'
import { useStablecoinPrice } from 'hooks/useBUSDPrice'
import { useMasterchefV3, useV3NFTPositionManagerContract } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useDerivedV3BurnInfo } from 'hooks/v3/useDerivedV3BurnInfo'
import { useV3PositionFromTokenId, useV3TokenIdsByAccount } from 'hooks/v3/useV3Positions'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { hexToBigInt } from 'viem'
import Page from 'views/Page'
import { useSendTransaction, useWalletClient } from 'wagmi'

import { RangeTag } from 'components/RangeTag'
import { calculateGasMargin } from 'utils'
import { basisPointsToPercent } from 'utils/exchange'
import { formatCurrencyAmount, formatRawAmount } from 'utils/formatCurrencyAmount'
import { getViemClients } from 'utils/viem'

import { ArrowDown } from '@phosphor-icons/react'
import Chip from 'components/Common/Chip'
import Notification from 'components/Common/Notification'
import ToggleSwitch from 'components/Common/ToggleSwitch'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { useBurnV3ActionHandlers } from './form/hooks'

// redirect invalid tokenIds
export default function RemoveLiquidityV3() {
  const router = useRouter()

  const { tokenId } = router.query

  const parsedTokenId = useMemo(() => {
    try {
      return BigInt(tokenId as string)
    } catch {
      return undefined
    }
  }, [tokenId])

  return <Remove tokenId={parsedTokenId} />
}

function Remove({ tokenId }: { tokenId?: bigint }) {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  // flag for receiving WNATIVE
  const [receiveWNATIVE, setReceiveWNATIVE] = useState(false)
  const nativeCurrency = useNativeCurrency()
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  const { percent } = useLocalSelector<{ percent: number }>((s) => s) as { percent: number }

  const { account, chainId } = useAccountActiveChain()
  const addTransaction = useTransactionAdder()

  const { data: walletClient } = useWalletClient()

  const masterchefV3 = useMasterchefV3()
  const { tokenIds: stakedTokenIds, loading: tokenIdsInMCv3Loading } = useV3TokenIdsByAccount(
    masterchefV3?.address,
    account,
  )

  const { position } = useV3PositionFromTokenId(tokenId)

  const {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
    outOfRange,
    error,
  } = useDerivedV3BurnInfo(position, percent, receiveWNATIVE)

  const { onPercentSelect } = useBurnV3ActionHandlers()

  // boilerplate for the slider
  const [percentForSlider, onPercentSelectForSlider] = useDebouncedChangeHandler(percent, onPercentSelect)

  const handleChangePercent = useCallback(
    (value) => onPercentSelectForSlider(Math.ceil(value)),
    [onPercentSelectForSlider],
  )

  const [allowedSlippage] = useUserSlippage() // custom from users
  // const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_V3_LIQUIDITY_SLIPPAGE_TOLERANCE) // custom from users

  const deadline = useTransactionDeadline() // custom from users settings
  const [attemptingTxn, setAttemptingTxn] = useState(false)
  const [txnHash, setTxnHash] = useState<string | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const { sendTransactionAsync } = useSendTransaction()

  const positionManager = useV3NFTPositionManagerContract()

  const isStakedInMCv3 = useMemo(
    () => Boolean(tokenId && stakedTokenIds.find((id) => id === tokenId)),
    [tokenId, stakedTokenIds],
  )

  const manager = isStakedInMCv3 ? masterchefV3 : positionManager
  const interfaceManager = isStakedInMCv3 ? MasterChefV3 : NonfungiblePositionManager

  const onRemove = useCallback(async () => {
    if (
      tokenIdsInMCv3Loading ||
      !interfaceManager ||
      !manager ||
      !liquidityValue0 ||
      !liquidityValue1 ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage ||
      !tokenId ||
      !walletClient
    ) {
      return
    }

    setAttemptingTxn(true)

    // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
    // vast majority of cases
    const { calldata, value } = interfaceManager.removeCallParameters(positionSDK, {
      tokenId: tokenId.toString(),
      liquidityPercentage,
      slippageTolerance: basisPointsToPercent(allowedSlippage),
      deadline: deadline.toString(),
      collectOptions: {
        expectedCurrencyOwed0: feeValue0 ?? CurrencyAmount.fromRawAmount(liquidityValue0.currency, 0),
        expectedCurrencyOwed1: feeValue1 ?? CurrencyAmount.fromRawAmount(liquidityValue1.currency, 0),
        recipient: account,
      },
    })

    const txn = {
      to: manager.address,
      data: calldata,
      value: hexToBigInt(value),
      account,
    }

    const publicClient = getViemClients({ chainId })

    publicClient?.estimateGas(txn).then((gas) => {
      sendTransactionAsync({
        ...txn,
        gas: calculateGasMargin(gas),
        chainId,
      })
        .then((response) => {
          const amount0 = formatRawAmount(liquidityValue0.quotient.toString(), liquidityValue0.currency.decimals, 4)
          const amount1 = formatRawAmount(liquidityValue1.quotient.toString(), liquidityValue1.currency.decimals, 4)

          setTxnHash(response.hash)
          setAttemptingTxn(false)
          addTransaction(response, {
            type: 'remove-liquidity-v3',
            summary: `Remove ${amount0} ${liquidityValue0.currency.symbol} and ${amount1} ${liquidityValue1.currency.symbol}`,
          })
        })
        .catch((err) => {
          if (isUserRejected(err)) {
            setErrorMessage(t('Transaction rejected'))
          } else {
            setErrorMessage(transactionErrorToUserReadableMessage(err, t))
          }
          setAttemptingTxn(false)
          console.error(err)
        })
    })
  }, [
    tokenIdsInMCv3Loading,
    interfaceManager,
    manager,
    liquidityValue0,
    liquidityValue1,
    deadline,
    account,
    chainId,
    positionSDK,
    liquidityPercentage,
    tokenId,
    allowedSlippage,
    feeValue0,
    feeValue1,
    addTransaction,
    walletClient,
    sendTransactionAsync,
    t,
  ])

  const removed = position?.liquidity === 0n

  const price0 = useStablecoinPrice(liquidityValue0?.currency?.wrapped ?? undefined, { enabled: !!feeValue0 })
  const price1 = useStablecoinPrice(liquidityValue1?.currency?.wrapped ?? undefined, { enabled: !!feeValue1 })

  const modalHeader = useCallback(() => {
    return (
      <>
        <div className="flex flex-col space-y-2">
          <RemoveLiquidityContent
            title={`${t('Pooled')} ${liquidityValue0?.currency?.symbol}`}
            amount={liquidityValue0}
            currency={liquidityValue0?.currency}
          />
          <RemoveLiquidityContent
            title={`${t('Pooled')} ${liquidityValue1?.currency?.symbol}`}
            amount={liquidityValue1}
            currency={liquidityValue1?.currency}
          />
        </div>

        {feeValue0?.greaterThan(0) || feeValue1?.greaterThan(0) ? (
          <>
            <p className="text-sm text-on-surface-primary mt-4">
              {t('You will also collect fees earned from this position.')}
            </p>

            <div className="flex flex-col space-y-2 mt-2">
              <RemoveLiquidityContent
                title={`${feeValue0?.currency?.symbol} ${t('Fees Earned')}`}
                amount={feeValue0}
                currency={feeValue0?.currency}
              />

              <RemoveLiquidityContent
                title={`${feeValue1?.currency?.symbol} ${t('Fees Earned')}`}
                amount={feeValue1}
                currency={feeValue1?.currency}
              />
            </div>
          </>
        ) : null}
      </>
    )
  }, [feeValue0, feeValue1, liquidityValue0, liquidityValue1, t])

  const router = useRouter()

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txnHash) {
      if (percentForSlider === 100) {
        router.push('/liquidity')
      } else {
        onPercentSelectForSlider(0)
      }
    }
    setAttemptingTxn(false)
    setTxnHash('')
    setErrorMessage(undefined)
  }, [onPercentSelectForSlider, percentForSlider, router, txnHash])

  const pendingText = useMemo(
    () =>
      t('Removing %amountA% %symbolA% and %amountB% %symbolB%', {
        amountA: liquidityValue0?.toSignificant(6),
        symbolA: liquidityValue0?.currency?.symbol,
        amountB: liquidityValue1?.toSignificant(6),
        symbolB: liquidityValue1?.currency?.symbol,
      }),
    [liquidityValue0, liquidityValue1, t],
  )

  const [onPresentRemoveLiquidityModal] = useModal(
    <TransactionConfirmationModal
      title={t('Remove Liquidity')}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txnHash ?? ''}
      style={{
        minHeight: 'auto',
      }}
      errorMessage={errorMessage}
      content={() => (
        <ConfirmationModalContent
          topContent={modalHeader}
          bottomContent={() => (
            <ButtonV2 fullWidth onClick={onRemove} className="mt-6" variant="primary">
              {t('Remove')}
            </ButtonV2>
          )}
        />
      )}
      pendingText={pendingText}
    />,
    true,
    true,
    'TransactionConfirmationModalRemoveLiquidity',
  )

  const showCollectAsWNative = Boolean(
    liquidityValue0?.currency &&
      liquidityValue1?.currency &&
      (liquidityValue0.currency.isNative ||
        liquidityValue1.currency.isNative ||
        WNATIVE[liquidityValue0.currency.chainId]?.equals(liquidityValue0.currency.wrapped) ||
        WNATIVE[liquidityValue1.currency.chainId]?.equals(liquidityValue1.currency.wrapped)),
  )

  return (
    <Page>
      <AppBody>
        <AppHeader
          backTo={`/liquidity/${tokenId}`}
          title={t('Remove %assetA%-%assetB% Liquidity', {
            assetA: liquidityValue0?.currency?.symbol ?? '',
            assetB: liquidityValue1?.currency?.symbol ?? '',
          })}
          noConfig
        />
        <div className="p-4">
          <div className="flex items-center space-x-w w-full justify-between">
            <div className="flex flex-col items-start space-y-1">
              <CurrencyLogoWithSymbol
                currencyA={liquidityValue0?.currency}
                currencyB={liquidityValue1?.currency}
                symbol={`${liquidityValue0?.currency?.symbol}-${liquidityValue1?.currency?.symbol} LP`}
                symbolClassName="text-on-surface-primary"
              />
              <h4 className="text-sm text-on-surface-tertiary">#{tokenId?.toString()}</h4>
            </div>

            <div className="flex items-center space-x-2">
              {isStakedInMCv3 && <Chip color="orange">{t('Farming')}</Chip>}
              {liquidityValue0 && liquidityValue1 ? <RangeTag removed={removed} outOfRange={outOfRange} /> : null}
            </div>
          </div>

          <div className="mt-4">
            <SectionTitle>{t('Amount of Liquidity to Remove')}</SectionTitle>

            <PercentageSlider
              percentForSlider={percentForSlider}
              handleChangePercent={handleChangePercent}
              onPercentSelect={(p) => onPercentSelect(p === 'Max' ? 100 : +p)}
              className="mt-2"
            />
          </div>

          <ArrowDown size={24} className="text-on-surface-primary my-4 mx-auto" />

          <div>
            <SectionTitle>{t('You will receive')}</SectionTitle>

            <div className="p-4 mt-2 rounded-2xl bg-surface-container-highest">
              <CurrencyLogoWithAmount
                currencyA={liquidityValue0?.currency}
                symbol={`${t('Pooled')} ${liquidityValue0?.currency?.symbol}`}
                amount={formatCurrencyAmount(liquidityValue0, 4, locale)}
                value={
                  price0 && liquidityValue0
                    ? `~$${price0.quote(liquidityValue0.wrapped).toFixed(2, { groupSeparator: ',' })}`
                    : ''
                }
              />

              <CurrencyLogoWithAmount
                currencyA={liquidityValue1?.currency}
                symbol={`${t('Pooled')} ${liquidityValue1?.currency?.symbol}`}
                amount={formatCurrencyAmount(liquidityValue1, 4, locale)}
                value={
                  price1 && liquidityValue1
                    ? `~$${price1.quote(liquidityValue1.wrapped).toFixed(2, { groupSeparator: ',' })}`
                    : ''
                }
                className="mt-3"
              />

              <div className="border w-full my-4 border-on-surface-tertiary" />

              <CurrencyLogoWithAmount
                currencyA={feeValue0?.currency}
                symbol={`${feeValue0?.currency?.symbol} ${t('Fee Earned')}`}
                amount={formatCurrencyAmount(feeValue0, 4, locale)}
                value={
                  price0 && feeValue0 ? `~$${price0.quote(feeValue0.wrapped).toFixed(2, { groupSeparator: ',' })}` : ''
                }
              />
              <CurrencyLogoWithAmount
                currencyA={feeValue1?.currency}
                symbol={`${feeValue1?.currency?.symbol} ${t('Fee Earned')}`}
                amount={formatCurrencyAmount(feeValue1, 4, locale)}
                value={
                  price1 && feeValue1 ? `~$${price1.quote(feeValue1.wrapped).toFixed(2, { groupSeparator: ',' })}` : ''
                }
                className="mt-3"
              />
            </div>
          </div>

          {showCollectAsWNative && (
            <div className="mt-1 w-full flex items-center space-x-2 justify-end">
              <h5 className="text-sm text-on-surface-tertiary">
                {t('Collect as')} {nativeWrappedSymbol}
              </h5>

              <ToggleSwitch
                activated={receiveWNATIVE}
                setActivated={() => setReceiveWNATIVE((prevState) => !prevState)}
              />
            </div>
          )}

          {isStakedInMCv3 ? (
            <Notification variant="info" className="mt-4">
              {t(
                'This liquidity position is currently staking in the Farm. Adding or removing liquidity will also harvest any unclaimed %cake% to your wallet.',
                {
                  cake: CAKE_SYMBOL,
                },
              )}
            </Notification>
          ) : null}

          <ButtonV2
            disabled={attemptingTxn || removed || Boolean(error)}
            fullWidth
            onClick={onPresentRemoveLiquidityModal}
            className="mt-4"
            variant="primary"
          >
            {removed ? t('Closed') : error ?? t('Remove')}
          </ButtonV2>
        </div>
      </AppBody>
    </Page>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs text-surface-orange">{children}</h3>
}

function RemoveLiquidityContent({
  title,
  amount,
  currency,
}: {
  title: string
  amount?: CurrencyAmount<Currency>
  currency?: Currency
}) {
  return (
    <div className="flex items-center space-x-2 justify-between">
      <h5 className="text-sm text-on-surface-primary">{title} :</h5>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-on-surface-primary">
          {amount && <FormattedCurrencyAmount currencyAmount={amount} />}
        </span>
        <CurrencyLogo size={20} currency={currency} />
      </div>
    </div>
  )
}
