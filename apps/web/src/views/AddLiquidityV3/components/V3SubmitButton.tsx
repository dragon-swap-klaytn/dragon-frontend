import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { ButtonV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { CommitButton } from 'components/CommitButton'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { isHiddenTokenAddress } from 'components/SearchModal/hiddenTokens'
import { isUnifiWalletManagedTokenAddress } from 'contexts/UnifiWalletContext'
import { ApprovalState } from 'hooks/useApproveCallback'
import { ReactNode, useMemo } from 'react'
import ApproveLiquidityTokens from 'views/AddLiquidityV3/components/ApproveLiquidityTokens'
import { useAccount } from 'wagmi'
import { SendTransactionResult } from 'wagmi/actions'
import { Field } from '../formViews/V3FormView/form/actions'

interface V3SubmitButtonProps {
  addIsUnsupported: boolean
  addIsWarning: boolean
  account?: string
  isWrongNetwork: boolean
  approvalA: ApprovalState
  approvalB: ApprovalState
  isValid: boolean
  showApprovalA: boolean
  approveACallback: () => Promise<SendTransactionResult | undefined>
  currencies: {
    CURRENCY_A?: Currency
    CURRENCY_B?: Currency
  }
  approveBCallback: () => Promise<SendTransactionResult | undefined>
  showApprovalB: boolean
  parsedAmounts: {
    CURRENCY_A?: CurrencyAmount<Currency>
    CURRENCY_B?: CurrencyAmount<Currency>
  }
  onClick: () => void | Promise<void>
  attemptingTxn: boolean
  errorMessage: ReactNode
  buttonText: string
  depositADisabled: boolean
  depositBDisabled: boolean
  className?: string
}

export function V3SubmitButton({
  addIsUnsupported,
  addIsWarning,
  account,
  isWrongNetwork,
  approvalA,
  approvalB,
  isValid,
  showApprovalA,
  approveACallback,
  currencies,
  approveBCallback,
  showApprovalB,
  parsedAmounts,
  onClick,
  attemptingTxn,
  errorMessage,
  buttonText,
  depositADisabled,
  depositBDisabled,
  className,
}: V3SubmitButtonProps) {
  const { t } = useTranslation()
  const { connector } = useAccount()
  const shouldShowApprovalGroup = useMemo(
    () =>
      (approvalA === ApprovalState.NOT_APPROVED ||
        approvalA === ApprovalState.PENDING ||
        approvalB === ApprovalState.NOT_APPROVED ||
        approvalB === ApprovalState.PENDING) &&
      isValid,
    [approvalA, approvalB, isValid],
  )

  const isUnifiWalletDisabled = useMemo(
    () =>
      connector?.id === 'unifiwallet' &&
      isUnifiWalletManagedTokenAddress(currencies.CURRENCY_A?.wrapped.address) &&
      isUnifiWalletManagedTokenAddress(currencies.CURRENCY_B?.wrapped.address),
    [connector, currencies],
  )

  const hiddenTokenSymbols = useMemo(() => {
    const tokenSymbols = [currencies.CURRENCY_A, currencies.CURRENCY_B]
      .filter((currency) => isHiddenTokenAddress(currency?.wrapped?.address))
      .map((currency) => currency?.symbol || 'Unknown')

    return Array.from(new Set(tokenSymbols))
  }, [currencies])

  const isHiddenTokenDisabled = hiddenTokenSymbols.length > 0

  const buttonDisabled = useMemo(
    () =>
      !isValid ||
      attemptingTxn ||
      (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
      (approvalB !== ApprovalState.APPROVED && !depositBDisabled) ||
      // Unifi Wallet currently doesn't support using multiple auto-deposited tokens together, so keep this button disabled for now.
      isUnifiWalletDisabled ||
      isHiddenTokenDisabled,
    [
      isValid,
      attemptingTxn,
      approvalA,
      approvalB,
      depositADisabled,
      depositBDisabled,
      isUnifiWalletDisabled,
      isHiddenTokenDisabled,
    ],
  )

  let buttons: ReactNode = null
  if (addIsUnsupported || addIsWarning) {
    buttons = (
      <ButtonV2 disabled variant="primary" onClick={() => {}} fullWidth className={className}>
        {t('Unsupported Asset')}
      </ButtonV2>
    )
  } else if (!account) {
    buttons = <ConnectWalletButton className={className} />
  } else if (isWrongNetwork) {
    buttons = <CommitButton className={className} />
  } else {
    buttons = (
      <div className={clsx('flex flex-col space-y-3 w-full', className)}>
        <ApproveLiquidityTokens
          approvalA={approvalA}
          approvalB={approvalB}
          showFieldAApproval={showApprovalA}
          showFieldBApproval={showApprovalB}
          approveACallback={approveACallback}
          approveBCallback={approveBCallback}
          currencies={currencies}
          shouldShowApprovalGroup={shouldShowApprovalGroup}
        />
        <CommitButton
          variant={
            !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] ? 'danger' : 'primary'
          }
          onClick={onClick}
          disabled={buttonDisabled}
          className="break-keep"
        >
          {isHiddenTokenDisabled
            ? t('This pool includes tokens whose supply is temporarily suspended: {{tokens}}', {
                tokens: hiddenTokenSymbols.join(', '),
              })
            : isUnifiWalletDisabled
            ? t('Pool not currently supported in Unifi Wallet')
            : errorMessage || buttonText}
        </CommitButton>
      </div>
    )
  }

  return buttons
}
