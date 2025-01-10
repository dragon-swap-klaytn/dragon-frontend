import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { ButtonV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { CommitButton } from 'components/CommitButton'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ApprovalState } from 'hooks/useApproveCallback'
import { ReactNode, useMemo } from 'react'
import ApproveLiquidityTokens from 'views/AddLiquidityV3/components/ApproveLiquidityTokens'
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
  currentAllowanceA: CurrencyAmount<Currency> | undefined
  revokeACallback: () => Promise<SendTransactionResult | undefined>
  currencies: {
    CURRENCY_A?: Currency
    CURRENCY_B?: Currency
  }
  approveBCallback: () => Promise<SendTransactionResult | undefined>
  currentAllowanceB: CurrencyAmount<Currency> | undefined
  revokeBCallback: () => Promise<SendTransactionResult | undefined>
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
  currentAllowanceA,
  revokeACallback,
  currencies,
  approveBCallback,
  currentAllowanceB,
  revokeBCallback,
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

  const shouldShowApprovalGroup = useMemo(
    () =>
      (approvalA === ApprovalState.NOT_APPROVED ||
        approvalA === ApprovalState.PENDING ||
        approvalB === ApprovalState.NOT_APPROVED ||
        approvalB === ApprovalState.PENDING) &&
      isValid,
    [approvalA, approvalB, isValid],
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
          revokeACallback={revokeACallback}
          revokeBCallback={revokeBCallback}
          currencies={currencies}
          currentAllowanceA={currentAllowanceA}
          currentAllowanceB={currentAllowanceB}
          shouldShowApprovalGroup={shouldShowApprovalGroup}
        />
        <CommitButton
          variant={
            !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] ? 'danger' : 'primary'
          }
          onClick={onClick}
          disabled={
            !isValid ||
            attemptingTxn ||
            (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
            (approvalB !== ApprovalState.APPROVED && !depositBDisabled)
          }
        >
          {errorMessage || buttonText}
        </CommitButton>
      </div>
    )
  }

  return buttons
}
