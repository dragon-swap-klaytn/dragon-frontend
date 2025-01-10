import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { ButtonV2, Dots, ExternalLink, Notification } from '@pancakeswap/uikit'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useMemo } from 'react'
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
  revokeACallback: () => Promise<SendTransactionResult | undefined>
  currentAllowanceA: CurrencyAmount<Currency> | undefined
  approvalA: ApprovalState
  showFieldBApproval: boolean
  approveBCallback: () => Promise<SendTransactionResult | undefined>
  revokeBCallback: () => Promise<SendTransactionResult | undefined>
  currentAllowanceB: CurrencyAmount<Currency> | undefined
  approvalB: ApprovalState
}

export default function ApproveLiquidityTokens({
  shouldShowApprovalGroup,
  showFieldAApproval,
  approvalA,
  approveACallback,
  revokeACallback,
  currentAllowanceA,
  currencies,
  showFieldBApproval,
  approvalB,
  approveBCallback,
  revokeBCallback,
  currentAllowanceB,
}: ApproveLiquidityTokensProps) {
  const { t } = useTranslation()

  const revokeANeeded = useMemo(() => {
    // return (
    //   showFieldAApproval &&
    //   currentAllowanceA?.greaterThan(0) &&
    //   currencies[Field.CURRENCY_A]?.chainId === ethereumTokens.usdt.chainId &&
    //   currencies[Field.CURRENCY_A]?.wrapped.address.toLowerCase() === ethereumTokens.usdt.address.toLowerCase()
    // )
    return false
  }, [])
  const revokeBNeeded = useMemo(() => {
    // return (
    //   showFieldBApproval &&
    //   currentAllowanceB?.greaterThan(0) &&
    //   currencies[Field.CURRENCY_B]?.chainId === ethereumTokens.usdt.chainId &&
    //   currencies[Field.CURRENCY_B]?.wrapped.address.toLowerCase() === ethereumTokens.usdt.address.toLowerCase()
    // )
    return false
  }, [])

  const anyRevokeNeeded = revokeANeeded || revokeBNeeded

  return shouldShowApprovalGroup ? (
    <div className="flex flex-col space-y-3 w-full">
      {anyRevokeNeeded && (
        <Notification variant="caution">
          <p className="text-sm mb-2">
            {t('USDT on Ethereum requires resetting approval when spending allowances are too low.')}
          </p>

          <ExternalLink
            href="https://docs.dgswap.io/products/pancakeswap-exchange/faq#why-do-i-need-to-reset-approval-on-usdt-before-enabling-approving"
            className="text-sm"
          >
            {t('Learn More')}
          </ExternalLink>
        </Notification>
      )}
      {showFieldAApproval &&
        (revokeANeeded ? (
          <ButtonV2
            onClick={revokeACallback}
            disabled={approvalA === ApprovalState.PENDING}
            fullWidth
            variant="primary"
            state={approvalA === ApprovalState.PENDING ? 'loading' : 'default'}
          >
            {approvalA === ApprovalState.PENDING ? (
              <Dots>{t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Dots>
            ) : (
              t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_A]?.symbol })
            )}
          </ButtonV2>
        ) : (
          <ButtonV2
            onClick={approveACallback}
            disabled={approvalA === ApprovalState.PENDING}
            fullWidth
            variant="primary"
            state={approvalA === ApprovalState.PENDING ? 'loading' : 'default'}
          >
            {approvalA === ApprovalState.PENDING ? (
              <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Dots>
            ) : (
              t('Enable %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })
            )}
          </ButtonV2>
        ))}
      {showFieldBApproval &&
        (revokeBNeeded ? (
          <ButtonV2
            onClick={revokeBCallback}
            disabled={approvalB === ApprovalState.PENDING}
            fullWidth
            variant="primary"
            state={approvalA === ApprovalState.PENDING ? 'loading' : 'default'}
          >
            {approvalB === ApprovalState.PENDING ? (
              <Dots>{t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Dots>
            ) : (
              t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_B]?.symbol })
            )}
          </ButtonV2>
        ) : (
          <ButtonV2
            onClick={approveBCallback}
            disabled={approvalB === ApprovalState.PENDING}
            fullWidth
            variant="primary"
            state={approvalA === ApprovalState.PENDING ? 'loading' : 'default'}
          >
            {approvalB === ApprovalState.PENDING ? (
              <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Dots>
            ) : (
              t('Enable %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })
            )}
          </ButtonV2>
        ))}
    </div>
  ) : null
}
