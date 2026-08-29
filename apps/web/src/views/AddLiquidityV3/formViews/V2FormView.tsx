import { useTranslation } from '@pancakeswap/localization'
import { Pair, Percent } from '@pancakeswap/sdk'
import { ButtonV2, ExternalLink, Notification } from '@pancakeswap/uikit'
import { useIsExpertMode } from '@pancakeswap/utils/user'
import { ReactNode, useMemo } from 'react'

import { CommitButton } from 'components/CommitButton'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { isHiddenTokenAddress } from 'components/SearchModal/hiddenTokens'
import { CommonBasesType } from 'components/SearchModal/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { Field } from 'state/mint/actions'
import { getBlockExploreLink } from 'utils'
import { logGTMClickAddLiquidityEvent } from 'utils/customGTMEventTracking'
import { LP2ChildrenProps } from 'views/AddLiquidity'

import MaxDepositAmount from 'components/MaxDepositAmount'
import { SectionTitle } from 'views/AddLiquidityV3'
import ApproveLiquidityTokens from 'views/AddLiquidityV3/components/ApproveLiquidityTokens'

export default function V2FormView({
  formattedAmounts,
  addIsUnsupported,
  addIsWarning,
  shouldShowApprovalGroup,
  approveACallback,
  approvalA,
  approvalB,
  approveBCallback,
  showFieldBApproval,
  showFieldAApproval,
  currencies,
  buttonDisabled,
  onAdd,
  onPresentAddLiquidityModal,
  errorText,
  onFieldAInput,
  onFieldBInput,
  maxAmounts,
  isOneWeiAttack,
  pair,
}: LP2ChildrenProps) {
  const { account, isWrongNetwork } = useActiveWeb3React()
  const { t } = useTranslation()
  const expertMode = useIsExpertMode()
  const pairExplorerLink = useMemo(
    () => pair && getBlockExploreLink(Pair.getAddress(pair.token0, pair.token1), 'address'),
    [pair],
  )

  const hiddenTokenSymbols = useMemo(() => {
    const tokenSymbols = [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]]
      .filter((currency) => isHiddenTokenAddress(currency?.wrapped?.address))
      .map((currency) => currency?.symbol || 'Unknown')

    return Array.from(new Set(tokenSymbols))
  }, [currencies])

  const isHiddenTokenDisabled = hiddenTokenSymbols.length > 0
  const isSubmitDisabled = buttonDisabled || isHiddenTokenDisabled

  let buttons: ReactNode = null
  if (addIsUnsupported || addIsWarning) {
    buttons = (
      <ButtonV2 variant="subtle" disabled onClick={() => {}}>
        {t('Unsupported Asset')}
      </ButtonV2>
    )
  } else if (!account) {
    buttons = <ConnectWalletButton />
  } else if (isWrongNetwork) {
    buttons = <CommitButton />
  } else {
    buttons = (
      <div className="flex flex-col items-center space-y-4">
        <ApproveLiquidityTokens
          approvalA={approvalA}
          approvalB={approvalB}
          showFieldAApproval={showFieldAApproval}
          showFieldBApproval={showFieldBApproval}
          approveACallback={approveACallback}
          approveBCallback={approveBCallback}
          currencies={currencies}
          shouldShowApprovalGroup={shouldShowApprovalGroup}
        />
        {isOneWeiAttack ? (
          <Notification variant="caution">
            <p>
              {t(
                'Adding liquidity to this V2 pair is currently not available on DargonSwap UI. Please follow the instructions to resolve it using blockchain explorer.',
              )}
            </p>

            <div className="flex flex-col items-start space-y-0.5 mt-2">
              {/* <ExternalLink href="https://docs.dgswap.io/products/pancakeswap-exchange/faq#why-cant-i-add-liquidity-to-a-pair-i-just-created">
                {t('Learn more how to fix')}
              </ExternalLink> */}

              <ExternalLink href={pairExplorerLink || ''}>{t('View pool on explorer')}</ExternalLink>
            </div>
          </Notification>
        ) : null}

        <CommitButton
          variant={isSubmitDisabled ? 'danger' : 'primary'}
          onClick={() => {
            // eslint-disable-next-line no-unused-expressions
            expertMode ? onAdd() : onPresentAddLiquidityModal()
            logGTMClickAddLiquidityEvent()
          }}
          disabled={isSubmitDisabled}
        >
          {isHiddenTokenDisabled
            ? t('This pool includes tokens whose supply is temporarily suspended: {{tokens}}', {
                tokens: hiddenTokenSymbols.join(', '),
              })
            : errorText || t('Add')}
        </CommitButton>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <SectionTitle>{t('Deposit Amount')}</SectionTitle>

      <div className="mt-2 mb-4 flex flex-col space-y-3">
        <CurrencyInputPanel
          maxAmount={maxAmounts[Field.CURRENCY_A]}
          showUSDPrice
          onMax={() => {
            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
          }}
          onPercentInput={(percent) => {
            if (maxAmounts[Field.CURRENCY_A]) {
              onFieldAInput(maxAmounts[Field.CURRENCY_A]?.multiply(new Percent(percent, 100)).toExact() ?? '')
            }
          }}
          disableCurrencySelect
          value={formattedAmounts[Field.CURRENCY_A] ?? '0'}
          onUserInput={onFieldAInput}
          showQuickInputButton
          showMaxButton
          currency={currencies[Field.CURRENCY_A]}
          id="add-liquidity-input-tokena"
          showCommonBases
          commonBasesType={CommonBasesType.LIQUIDITY}
        />

        <CurrencyInputPanel
          showUSDPrice
          onPercentInput={(percent) => {
            if (maxAmounts[Field.CURRENCY_B]) {
              onFieldBInput(maxAmounts[Field.CURRENCY_B]?.multiply(new Percent(percent, 100)).toExact() ?? '')
            }
          }}
          onMax={() => {
            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
          }}
          maxAmount={maxAmounts[Field.CURRENCY_B]}
          disableCurrencySelect
          value={formattedAmounts[Field.CURRENCY_B] ?? '0'}
          onUserInput={onFieldBInput}
          showQuickInputButton
          showMaxButton
          currency={currencies[Field.CURRENCY_B]}
          id="add-liquidity-input-tokenb"
          showCommonBases
          commonBasesType={CommonBasesType.LIQUIDITY}
        />

        <MaxDepositAmount
          base={{
            currency: currencies[Field.CURRENCY_A],
            amount: +(formattedAmounts[Field.CURRENCY_A] ?? '0'),
            maxAmount: +(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '0'),
          }}
          quote={{
            currency: currencies[Field.CURRENCY_B],
            amount: +(formattedAmounts[Field.CURRENCY_B] ?? '0'),
            maxAmount: +(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '0'),
          }}
        />
      </div>

      {buttons}
    </div>
  )
}
