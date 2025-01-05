import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Dots } from '@pancakeswap/uikit'
import Button from 'components/Common/Button'
import ExternalLink from 'components/Common/ExternalLink'
import Notification from 'components/Common/Notification'
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
  approveACallback: () => Promise<SendTransactionResult>
  revokeACallback: () => Promise<SendTransactionResult>
  currentAllowanceA: CurrencyAmount<Currency> | undefined
  approvalA: ApprovalState
  showFieldBApproval: boolean
  approveBCallback: () => Promise<SendTransactionResult>
  revokeBCallback: () => Promise<SendTransactionResult>
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
          <Button
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
          </Button>
        ) : (
          <Button
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
          </Button>
        ))}
      {showFieldBApproval &&
        (revokeBNeeded ? (
          <Button
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
          </Button>
        ) : (
          <Button
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
          </Button>
        ))}
    </div>
  ) : null
}
