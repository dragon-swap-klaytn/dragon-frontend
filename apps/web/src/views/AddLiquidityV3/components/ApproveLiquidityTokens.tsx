import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { ButtonV2, Dots } from '@pancakeswap/uikit'
import { ApprovalState } from 'hooks/useApproveCallback'
import { Field } from 'state/mint/actions'
import { SendTransactionResult } from 'wagmi/actions'

interface ApproveLiquidityTokensProps {
  currencies: {
    [Field.CURRENCY_A]?: Currency
    [Field.CURRENCY_B]?: Currency
  }
  shouldShowApprovalGroup: boolean
  showFieldAApproval: boolean
  approveACallback: () => Promise<SendTransactionResult | undefined>
  approvalA: ApprovalState
  showFieldBApproval: boolean
  approveBCallback: () => Promise<SendTransactionResult | undefined>
  approvalB: ApprovalState
}

export default function ApproveLiquidityTokens({
  shouldShowApprovalGroup,
  showFieldAApproval,
  approvalA,
  approveACallback,
  currencies,
  showFieldBApproval,
  approvalB,
  approveBCallback,
}: ApproveLiquidityTokensProps) {
  const { t } = useTranslation()

  return shouldShowApprovalGroup ? (
    <div className="flex flex-col space-y-3 w-full">
      {showFieldAApproval && (
        <ButtonV2
          onClick={approveACallback}
          disabled={approvalA === ApprovalState.PENDING}
          fullWidth
          variant="primary"
          state={approvalA === ApprovalState.PENDING ? 'loading' : 'default'}
        >
          {approvalA === ApprovalState.PENDING ? (
            <Dots>{t('Enabling {{asset}}', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Dots>
          ) : (
            t('Enable {{asset}}', { asset: currencies[Field.CURRENCY_A]?.symbol })
          )}
        </ButtonV2>
      )}
      {showFieldBApproval && (
        <ButtonV2
          onClick={approveBCallback}
          disabled={approvalB === ApprovalState.PENDING}
          fullWidth
          variant="primary"
          state={approvalA === ApprovalState.PENDING ? 'loading' : 'default'}
        >
          {approvalB === ApprovalState.PENDING ? (
            <Dots>{t('Enabling {{asset}}', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Dots>
          ) : (
            t('Enable {{asset}}', { asset: currencies[Field.CURRENCY_B]?.symbol })
          )}
        </ButtonV2>
      )}
    </div>
  ) : null
}
