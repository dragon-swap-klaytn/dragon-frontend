import { useTranslation } from '@pancakeswap/localization'
import { Percent, WNATIVE } from '@pancakeswap/sdk'
import { Box, ButtonV2, CurrencyLogoWithAmount, useModal, useToast, useTooltip } from '@pancakeswap/uikit'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { CommitButton } from 'components/CommitButton'
import { formattedCurrencyAmount } from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import { V2_ROUTER_ADDRESS } from 'config/constants/exchange'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useLPApr } from 'state/swap/useLPApr'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { useSignTypedData } from 'wagmi'
// import { splitSignature } from 'utils/splitSignature'
import { Hash } from 'viem'

import { usePairContract } from 'hooks/useContract'

import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useBurnActionHandlers, useDerivedBurnInfo } from 'state/burn/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils'
import { calculateSlippageAmount, useRouterContract } from 'utils/exchange'

import { ArrowDown, ArrowRight } from '@phosphor-icons/react'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { CommonBasesType } from 'components/SearchModal/types'
import { useHistory } from 'contexts/HistoryContext'
import Link from 'next/link'
import { Field } from 'state/burn/actions'
import { useRemoveLiquidityV2FormState } from 'state/burn/reducer'
import { useGasPrice } from 'state/user/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { isUserRejected, logError } from 'utils/sentry'
import { SectionTitle } from 'views/AddLiquidityV3'
import { AppBody, AppHeader } from '../../components/App'
import ConnectWalletButton from '../../components/ConnectWalletButton'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import Dots from '../../components/Loader/Dots'
import SettingsModal from '../../components/Menu/GlobalSettings/SettingsModal'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { formatAmount } from '../../utils/formatInfoNumbers'
import Page from '../Page'
import ConfirmLiquidityModal from '../Swap/components/ConfirmRemoveLiquidityModal'

export default function RemoveLiquidity({ currencyA, currencyB, currencyIdA, currencyIdB }) {
  const router = useRouter()
  const native = useNativeCurrency()

  const { account, chainId, isWrongNetwork } = useActiveWeb3React()
  const { signTypedDataAsync } = useSignTypedData()
  const { toastError } = useToast()
  const [tokenA, tokenB] = useMemo(() => [currencyA?.wrapped, currencyB?.wrapped], [currencyA, currencyB])

  const { t } = useTranslation()
  const gasPrice = useGasPrice()

  // burn state
  const { independentField, typedValue } = useRemoveLiquidityV2FormState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)

  const poolData = useLPApr(pair)
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(`Based on last 7 days' performance. Does not account for impermanent loss`),
    {
      placement: 'bottom',
    },
  )
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [{ attemptingTxn, liquidityErrorMessage, txHash }, setLiquidityState] = useState<{
    attemptingTxn: boolean
    liquidityErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    attemptingTxn: false,
    liquidityErrorMessage: undefined,
    txHash: undefined,
  })

  // txn values
  const deadline = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippage()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY
        ? typedValue
        : formattedCurrencyAmount({ currencyAmount: parsedAmounts[Field.LIQUIDITY] }),
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A
        ? typedValue
        : formattedCurrencyAmount({ currencyAmount: parsedAmounts[Field.CURRENCY_A] }),
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B
        ? typedValue
        : formattedCurrencyAmount({ currencyAmount: parsedAmounts[Field.CURRENCY_B] }),
  }

  // pair contract
  const pairContractRead = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const { approvalState, approveCallback } = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    chainId ? V2_ROUTER_ADDRESS[chainId] : undefined,
  )

  async function onAttemptToApprove() {
    if (!pairContractRead || !pair || !signTypedDataAsync || !deadline || !account)
      throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) {
      toastError(t('Error'), t('Missing liquidity amount'))
      throw new Error('missing liquidity amount')
    }

    return approveCallback().catch(() => {})

    // // try to gather a signature for permission
    // const nonce = await pairContractRead.read.nonces([account])

    // const EIP712Domain = [
    //   { name: 'name', type: 'string' },
    //   { name: 'version', type: 'string' },
    //   { name: 'chainId', type: 'uint256' },
    //   { name: 'verifyingContract', type: 'address' },
    // ]
    // const domain = {
    //   name: 'Dragon LPs',
    //   version: '1',
    //   chainId,
    //   verifyingContract: pair.liquidityToken.address as `0x${string}`,
    // }
    // const Permit = [
    //   { name: 'owner', type: 'address' },
    //   { name: 'spender', type: 'address' },
    //   { name: 'value', type: 'uint256' },
    //   { name: 'nonce', type: 'uint256' },
    //   { name: 'deadline', type: 'uint256' },
    // ]
    // const message = {
    //   owner: account,
    //   spender: chainId ? V2_ROUTER_ADDRESS[chainId] : undefined,
    //   value: liquidityAmount.quotient.toString(),
    //   nonce,
    //   deadline: Number(deadline),
    // }

    // signTypedDataAsync({
    //   // @ts-ignore
    //   domain,
    //   primaryType: 'Permit',
    //   types: {
    //     EIP712Domain,
    //     Permit,
    //   },
    //   message,
    // })
    //   .then(splitSignature)
    //   .then((signature) => {
    //     setSignatureData({
    //       v: signature.v,
    //       r: signature.r,
    //       s: signature.s,
    //       deadline: Number(deadline),
    //     })
    //   })
    //   .catch((err) => {
    //     // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
    //     if (!isUserRejected(err)) {
    //       approveCallback()
    //     }
    //   })
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, value: string) => {
      setSignatureData(null)
      return _onUserInput(field, value)
    },
    [_onUserInput],
  )

  const onLiquidityInput = useCallback((value: string): void => onUserInput(Field.LIQUIDITY, value), [onUserInput])

  // tx sending
  const addTransaction = useTransactionAdder()

  const routerContract = useRouterContract()

  async function onRemove() {
    if (!chainId || !account || !deadline || !routerContract) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      toastError(t('Error'), t('Missing currency amounts'))
      throw new Error('missing currency amounts')
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    }

    if (!currencyA || !currencyB) {
      toastError(t('Error'), t('Missing tokens'))
      throw new Error('missing tokens')
    }
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) {
      toastError(t('Error'), t('Missing liquidity amount'))
      throw new Error('missing liquidity amount')
    }

    const currencyBIsNative = currencyB?.isNative
    const oneCurrencyIsNative = currencyA?.isNative || currencyBIsNative

    if (!tokenA || !tokenB) {
      toastError(t('Error'), t('Could not wrap'))
      throw new Error('could not wrap')
    }

    let methodNames: string[]
    let args: any
    // we have approval, use normal remove liquidity
    if (approvalState === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsNative) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsNative ? tokenA.address : tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[currencyBIsNative ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsNative ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline,
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline,
        ]
      }
    }
    // we have a signature, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsNative) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsNative ? tokenA.address : tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[currencyBIsNative ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsNative ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.quotient.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ]
      }
    } else {
      toastError(t('Error'), t('Attempting to confirm without approval or a signature'))
      throw new Error('Attempting to confirm without approval or a signature')
    }

    let methodSafeGasEstimate: { methodName: string; safeGasEstimate: bigint } | undefined
    for (let i = 0; i < methodNames.length; i++) {
      let safeGasEstimate: any
      try {
        // eslint-disable-next-line no-await-in-loop
        safeGasEstimate = calculateGasMargin(await routerContract.estimateGas[methodNames[i]](args, { account }))
      } catch (e) {
        console.error(`estimateGas failed`, methodNames[i], args, e)
      }

      if (typeof safeGasEstimate === 'bigint') {
        methodSafeGasEstimate = { methodName: methodNames[i], safeGasEstimate }
        break
      }
    }

    // all estimations failed...
    if (!methodSafeGasEstimate) {
      toastError(t('Error'), t('This transaction would fail'))
    } else {
      const { methodName, safeGasEstimate } = methodSafeGasEstimate

      setLiquidityState({ attemptingTxn: true, liquidityErrorMessage: undefined, txHash: undefined })
      await routerContract.write[methodName](args, {
        gas: safeGasEstimate,
        gasPrice,
      })
        .then((response: Hash) => {
          setLiquidityState({ attemptingTxn: false, liquidityErrorMessage: undefined, txHash: response })
          const amountA = parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)
          const amountB = parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
          addTransaction(
            { hash: response },
            {
              summary: `Remove ${amountA} ${currencyA?.symbol} and ${amountB} ${currencyB?.symbol}`,
              translatableSummary: {
                text: 'Remove {{amountA}} {{symbolA}} and {{amountB}} {{symbolB}}',
                data: { amountA, symbolA: currencyA?.symbol, amountB, symbolB: currencyB?.symbol },
              },
              type: 'remove-liquidity',
            },
          )

          // back to list after all remove
          if (parsedAmounts[Field.LIQUIDITY_PERCENT].toSignificant() === '100') {
            router.push('/pools')
          }
        })
        .catch((err: any) => {
          if (err && !isUserRejected(err)) {
            logError(err)
            console.error(`Remove Liquidity failed`, err, args)
          }
          setLiquidityState({
            attemptingTxn: false,
            liquidityErrorMessage:
              err && !isUserRejected(err)
                ? t('Remove liquidity failed: {{message}}', { message: transactionErrorToUserReadableMessage(err, t) })
                : undefined,
            txHash: undefined,
          })
        })
    }
  }

  const pendingText = t('Removing {{amountA}} {{symbolA}} and {{amountB}} {{symbolB}}', {
    amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    symbolA: currencyA?.symbol ?? '',
    amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
    symbolB: currencyB?.symbol ?? '',
  })

  const oneCurrencyIsNative = currencyA?.isNative || currencyB?.isNative
  const oneCurrencyIsWNative = Boolean(
    chainId &&
      ((currencyA && WNATIVE[chainId]?.equals(currencyA)) || (currencyB && WNATIVE[chainId]?.equals(currencyB))),
  )

  const handleDismissConfirmation = useCallback(() => {
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
  }, [onUserInput, txHash])

  const [onPresentRemoveLiquidity] = useModal(
    <ConfirmLiquidityModal
      title={t('You will receive')}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txHash || ''}
      allowedSlippage={allowedSlippage}
      onRemove={onRemove}
      pendingText={pendingText}
      approval={approvalState}
      signatureData={signatureData}
      liquidityErrorMessage={liquidityErrorMessage}
      parsedAmounts={parsedAmounts}
      currencyA={currencyA}
      currencyB={currencyB}
    />,
    true,
    true,
    'removeLiquidityModal',
    [txHash, allowedSlippage, attemptingTxn, approvalState, signatureData, parsedAmounts, currencyA, currencyB],
  )

  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)
  const lpBalance = useCurrencyBalance(account ?? undefined, pair?.liquidityToken)

  return (
    <div className="p-5 md:p-8">
      <SectionTitle>{t('Amount')}</SectionTitle>

      <CurrencyInputPanel
        className="mt-2"
        value={formattedAmounts[Field.LIQUIDITY]}
        onUserInput={onLiquidityInput}
        showMaxButton
        maxAmount={lpBalance}
        onMax={() => {
          onUserInput(Field.LIQUIDITY_PERCENT, '100')
        }}
        showQuickInputButton
        onPercentInput={(percent) => {
          onUserInput(Field.LIQUIDITY_PERCENT, percent.toString())
        }}
        disableCurrencySelect
        currency={pair?.liquidityToken}
        pair={pair}
        id="liquidity-amount"
        onCurrencySelect={() => null}
        showCommonBases
        commonBasesType={CommonBasesType.LIQUIDITY}
      />

      <ArrowDown size={24} className="text-on-surface mx-auto my-6" />

      <div className="flex items-center space-x-2 justify-between w-full">
        <SectionTitle>{t('Receive')}</SectionTitle>

        {chainId && (oneCurrencyIsWNative || oneCurrencyIsNative) ? (
          <div className="flex items-center justify-end space-x-2 text-xs text-on-surface-subtle w-full">
            {oneCurrencyIsNative ? (
              <Link
                href={`/v2/remove/${currencyA?.isNative ? WNATIVE[chainId]?.address : currencyIdA}/${
                  currencyB?.isNative ? WNATIVE[chainId]?.address : currencyIdB
                }`}
                className="hover:opacity-70 underline underline-offset-2 flex items-center space-x-1"
              >
                <span>{t('Receive {{currency}}', { currency: WNATIVE[chainId]?.symbol })}</span>
                <ArrowRight size={16} />
              </Link>
            ) : oneCurrencyIsWNative ? (
              <Link
                href={`/v2/remove/${currencyA && currencyA.equals(WNATIVE[chainId]) ? native?.symbol : currencyIdA}/${
                  currencyB && currencyB.equals(WNATIVE[chainId]) ? native?.symbol : currencyIdB
                }`}
                className="hover:opacity-70 underline underline-offset-2 flex items-center space-x-1"
              >
                <span>{t('Receive {{currency}}', { currency: native?.symbol })}</span>
                <ArrowRight size={12} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-2">
        <CurrencyLogoWithAmount
          currencyA={currencyA}
          symbol={currencyA?.symbol}
          amount={`${formattedAmounts[Field.CURRENCY_A] || '0'}`}
          className="py-3 border-y border-border"
        />

        <CurrencyLogoWithAmount
          currencyA={currencyB}
          symbol={currencyB?.symbol}
          amount={`${formattedAmounts[Field.CURRENCY_B] || '0'}`}
          className="py-3 border-b border-border"
        />
      </div>

      {pair && (
        <div className="flex items-start space-x-2 w-full justify-between text-[13px] text-on-surface mt-2">
          <h5>{t('Prices')}</h5>

          <div className="flex flex-col items-end space-y-1">
            <span>
              1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
            </span>
            <span>
              1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        className="flex items-center w-full justify-between hover:opacity-70 text-[13px] text-on-surface mt-2"
        onClick={onPresentSettingsModal}
      >
        <h5 className="text-[13px]">{t('Slippage Tolerance')}</h5>

        <span>{allowedSlippage / 100}%</span>
      </button>

      {poolData && (
        <div className="flex items-start space-x-2 w-full justify-between text-[13px] text-on-surface mt-2">
          <span ref={targetRef}>{t('LP reward APR')}</span>

          {tooltipVisible && tooltip}
          <span>{formatAmount(poolData.lpApr7d)}%</span>
        </div>
      )}

      <Box position="relative" mt="16px">
        {!account ? (
          <ConnectWalletButton />
        ) : isWrongNetwork ? (
          <CommitButton width="100%" />
        ) : (
          <div className="w-full flex items-center space-x-2">
            <ButtonV2
              // variant={approvalState === ApprovalState.APPROVED || signatureData !== null ? 'success' : 'primary'}
              variant="primary"
              onClick={onAttemptToApprove}
              disabled={approvalState !== ApprovalState.NOT_APPROVED || signatureData !== null}
              fullWidth
            >
              {approvalState === ApprovalState.PENDING ? (
                <Dots>{t('Enabling')}</Dots>
              ) : approvalState === ApprovalState.APPROVED || signatureData !== null ? (
                t('Enabled')
              ) : (
                t('Enable')
              )}
            </ButtonV2>
            <ButtonV2
              variant={
                // !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                //   ? 'danger'
                //   : 'primary'
                'primary'
              }
              onClick={() => {
                setLiquidityState({
                  attemptingTxn: false,
                  liquidityErrorMessage: undefined,
                  txHash: undefined,
                })
                onPresentRemoveLiquidity()
              }}
              fullWidth
              disabled={!isValid || (signatureData === null && approvalState !== ApprovalState.APPROVED)}
            >
              {error || t('Remove')}
            </ButtonV2>
          </div>
        )}
      </Box>
    </div>
  )
}

export const RemoveLiquidityV2Layout = ({ currencyA, currencyB, children }) => {
  return (
    <RemoveLiquidityLayout currencyA={currencyA} currencyB={currencyB}>
      {children}
    </RemoveLiquidityLayout>
  )
}

export const RemoveLiquidityLayout = ({ currencyA, currencyB, children }) => {
  // const addressA = useMemo(() => {
  //   if (!currencyA) return ''
  //   return currencyA && 'isNative' in currencyA && currencyA.isNative ? currencyA.symbol : currencyA.address
  // }, [currencyA])
  // const addressB = useMemo(() => {
  //   if (!currencyB) return ''

  //   return currencyB && 'isNative' in currencyB && currencyB.isNative ? currencyB.symbol : currencyB.address
  // }, [currencyB])

  const { t } = useTranslation()
  const { backTo } = useHistory()

  return (
    <Page>
      <AppBody>
        <AppHeader
          backTo={backTo}
          title={t('Remove {{assetA}}-{{assetB}} Liquidity', {
            assetA: currencyA?.symbol ?? '',
            assetB: currencyB?.symbol ?? '',
          })}
          subtitle={t('To receive {{assetA}} and {{assetB}}', {
            assetA: currencyA?.symbol ?? '',
            assetB: currencyB?.symbol ?? '',
          })}
          noConfig
        />
        {children}
      </AppBody>
      {/* {pair ? (
        <div className="flex flex-col items-center space-y-3">
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWNative} pair={pair} />
        </div>
      ) : null} */}
    </Page>
  )
}
