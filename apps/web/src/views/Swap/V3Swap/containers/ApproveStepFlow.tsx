import { useTranslation } from '@pancakeswap/localization'
import { Text, useTooltip } from '@pancakeswap/uikit'
import clsx from 'clsx'
import ExternalLink from 'components/Common/ExternalLink'
import { PropsWithChildren, useMemo } from 'react'
import { ConfirmModalState, PendingConfirmModalState } from '../types'

function StepsContainer({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center w-[100px] h-2 rounded-[4px] mx-auto overflow-hidden bg-surface-container-highest">
      {children}
    </div>
  )
}

function Step({ active, width }: { active: boolean; width: string }) {
  return (
    <div
      style={{ width }}
      className={clsx('h-full', {
        'bg-surface-orange': active,
        'bg-surface-disable': !active,
      })}
    />
  )
}

interface ApproveStepFlowProps {
  confirmModalState: ConfirmModalState
  pendingModalSteps: PendingConfirmModalState[]
}

export const ApproveStepFlow: React.FC<React.PropsWithChildren<ApproveStepFlowProps>> = ({
  confirmModalState,
  pendingModalSteps,
}) => {
  const { t } = useTranslation()
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <Text>
      {t(
        'If wallet require you to enter the number of tokens you want to approve, you could enter a number that is greater than or equal to the amount of tokens you are swapping.',
      )}
    </Text>,
    { placement: 'top' },
  )

  const stepWidth = useMemo(() => `${100 / pendingModalSteps.length}%`, [pendingModalSteps])
  const hideStepIndicators = useMemo(() => pendingModalSteps.length === 1, [pendingModalSteps])

  return (
    <div className="mt-7 flex flex-col items-center space-y-3">
      <p className="text-xs text-center text-gray-200">{t('Proceed in your wallet')}</p>

      {!hideStepIndicators && (
        <>
          <StepsContainer>
            {pendingModalSteps.length !== 3 && (
              <Step active={confirmModalState === ConfirmModalState.RESETTING_APPROVAL} width={stepWidth} />
            )}
            <Step active={confirmModalState === ConfirmModalState.APPROVING_TOKEN} width={stepWidth} />
            <Step active={confirmModalState === ConfirmModalState.APPROVE_PENDING} width={stepWidth} />
            <Step active={confirmModalState === ConfirmModalState.PENDING_CONFIRMATION} width={stepWidth} />
          </StepsContainer>
          {confirmModalState === ConfirmModalState.RESETTING_APPROVAL && (
            <ExternalLink href="https://docs.dgswap.io/products/faq#why-do-i-need-to-reset-approval-on-usdt-before-enabling-approving">
              <span>{t('Why resetting approval')}</span>
            </ExternalLink>
          )}
          {confirmModalState === ConfirmModalState.APPROVING_TOKEN && (
            <ExternalLink href="https://docs.dgswap.io/products/how-to-trade" className="text-on-surface-primary">
              <span>{t('Why')}</span>&nbsp;
              <span ref={targetRef} className="font-bold">
                &nbsp;
                {t('approving')}
              </span>
              &nbsp;
              <span>{t('this?')}</span>
              {tooltipVisible && tooltip}
            </ExternalLink>
          )}
        </>
      )}
    </div>
  )
}
