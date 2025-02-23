import { Currency, NATIVE, WNATIVE } from '@pancakeswap/sdk'
import { Card, MenuIconButton } from '@pancakeswap/uikit'

import { FeeAmount } from '@pancakeswap/v3-sdk'
import { PropsWithChildren, useCallback, useEffect, useMemo } from 'react'

import { Trans, useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import currencyId from 'utils/currencyId'

import { AppBody, AppHeader } from 'components/App'
import { atom, useAtom } from 'jotai'
import { styled } from 'styled-components'
import Page from 'views/Page'

import { usePreviousValue } from '@pancakeswap/hooks'
import { useCurrency } from 'hooks/Tokens'
import AddLiquidity from 'views/AddLiquidity'
import AddStableLiquidity from 'views/AddLiquidity/AddStableLiquidity'
import useStableConfig, { StableConfigContext } from 'views/Swap/hooks/useStableConfig'

import { ArrowClockwise, Plus } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useActiveChainId } from 'hooks/useActiveChainId'
import noop from 'lodash/noop'
import { resetMintState } from 'state/mint/actions'
import { useAddLiquidityV2FormDispatch } from 'state/mint/reducer'
import { safeGetAddress } from 'utils'

import { CurrencySelect } from 'components/CurrencySelect'
import { CommonBasesType } from 'components/SearchModal/types'
import { useBackTo } from 'hooks/use-back-to'
import { AprCalculator } from './components/AprCalculator'
import { V2Selector } from './components/V2Selector'
import StableFormView from './formViews/StableFormView'
import V2FormView from './formViews/V2FormView'
import V3FormView from './formViews/V3FormView'
import { useCurrencyParams } from './hooks/useCurrencyParams'
import { HandleFeePoolSelectFn, SELECTOR_TYPE } from './types'

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  max-width: 858px;
  width: 100%;
  z-index: 1;
`

/* two-column layout where DepositAmount is moved at the very end on mobile. */
export const ResponsiveTwoColumns = styled.div`
  display: grid;
  grid-column-gap: 32px;
  grid-row-gap: 16px;
  grid-template-columns: 1fr;

  grid-template-rows: max-content;
  grid-auto-flow: row;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr 1fr;
  }
`

const selectTypeAtom = atom(SELECTOR_TYPE.V3)

interface UniversalAddLiquidityPropsType {
  currencyIdA: string
  currencyIdB: string
  isV2?: boolean
  preferredSelectType?: SELECTOR_TYPE
  preferredFeeAmount?: FeeAmount
  isModal?: boolean
}

export function UniversalAddLiquidity({
  isV2,
  currencyIdA,
  currencyIdB,
  preferredSelectType,
  preferredFeeAmount,
  isModal = false,
}: UniversalAddLiquidityPropsType) {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()

  const dispatch = useAddLiquidityV2FormDispatch()

  useEffect(() => {
    if (!currencyIdA && !currencyIdB) {
      dispatch(resetMintState())
    }
  }, [dispatch, currencyIdA, currencyIdB])

  const router = useRouter()
  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const stableConfig = useStableConfig({
    tokenA: baseCurrency,
    tokenB: currencyB,
  })

  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  const [, , feeAmountFromUrl] = router.query.currency || []

  // fee selection from url
  const feeAmount: FeeAmount | undefined = useMemo(() => {
    return (
      preferredFeeAmount ||
      (feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
        ? parseFloat(feeAmountFromUrl)
        : undefined)
    )
  }, [preferredFeeAmount, feeAmountFromUrl])

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      }
      // prevent wnative + native
      const isNATIVEOrWNATIVENew =
        currencyNew?.isNative || (chainId !== undefined && currencyIdNew === WNATIVE[chainId]?.address)
      const isNATIVEOrWNATIVEOther =
        currencyIdOther !== undefined &&
        (currencyIdOther === NATIVE[chainId]?.symbol ||
          (chainId !== undefined && safeGetAddress(currencyIdOther) === WNATIVE[chainId]?.address))

      if (isNATIVEOrWNATIVENew && isNATIVEOrWNATIVEOther) {
        return [currencyIdNew, undefined]
      }

      return [currencyIdNew, currencyIdOther]
    },
    [chainId],
  )

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      if (idB === undefined) {
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              ...(idA ? { currency: [idA] } : {}),
            },
          },
          undefined,
          { shallow: true },
        )
      } else {
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              ...(idA ? { currency: [idA, idB] } : {}),
            },
          },
          undefined,
          { shallow: true },
        )
      }
    },
    [handleCurrencySelect, currencyIdB, router],
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              ...(idB ? { currency: [idB] } : {}),
            },
          },
          undefined,
          { shallow: true },
        )
      } else {
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              ...(idB ? { currency: [idA, idB] } : {}),
            },
          },
          undefined,
          { shallow: true },
        )
      }
    },
    [handleCurrencySelect, currencyIdA, router],
  )

  const [selectorType, setSelectorType] = useAtom(selectTypeAtom)

  const prevPreferredSelectType = usePreviousValue(preferredSelectType)

  useEffect(() => {
    if (!currencyIdA || !currencyIdB) return

    if (selectorType === SELECTOR_TYPE.V3 && preferredSelectType === SELECTOR_TYPE.V3) {
      return
    }

    // if fee selection from url, don't change the selector type to avoid keep selecting stable when url changes, e.g. toggle rate
    if (!stableConfig.stableSwapConfig && feeAmountFromUrl) return
    if (stableConfig.stableSwapConfig) {
      setSelectorType(SELECTOR_TYPE.STABLE)
    } else {
      setSelectorType(preferredSelectType || isV2 ? SELECTOR_TYPE.V2 : SELECTOR_TYPE.V3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currencyIdA,
    currencyIdB,
    feeAmountFromUrl,
    isV2,
    preferredSelectType,
    prevPreferredSelectType,
    setSelectorType,
    stableConfig.stableSwapConfig,
  ])

  const handleFeePoolSelect = useCallback<HandleFeePoolSelectFn>(
    ({ type, feeAmount: newFeeAmount }) => {
      setSelectorType(type)
      if (newFeeAmount) {
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              currency: [currencyIdA, currencyIdB, newFeeAmount.toString()],
            },
          },
          undefined,
          { shallow: true },
        )
      } else {
        router.replace(
          {
            pathname: router.pathname.replace('/v2', ''),
            query: {
              ...router.query,
              currency: [currencyIdA, currencyIdB],
            },
          },
          undefined,
          { shallow: true },
        )
      }
    },
    [currencyIdA, currencyIdB, router, setSelectorType],
  )

  const { saveBackToHref } = useBackTo()

  const handleSelectV2 = useCallback(() => {
    setSelectorType(SELECTOR_TYPE.V2)
    saveBackToHref()
    router.replace(
      {
        pathname: router.pathname,
        query: router.query,
      },
      `/v2/add/${currencyIdA}/${currencyIdB}`,
      { shallow: true },
    )
  }, [currencyIdA, currencyIdB, router, setSelectorType, saveBackToHref])

  useEffect(() => {
    if (preferredFeeAmount && !feeAmountFromUrl && selectorType === SELECTOR_TYPE.V3) {
      handleFeePoolSelect({ type: selectorType, feeAmount: preferredFeeAmount })
    }
  }, [preferredFeeAmount, feeAmountFromUrl, handleFeePoolSelect, selectorType])

  return (
    <div
      className={clsx('grid gap-4 grid-cols-1', {
        'md:grid-cols-2': selectorType === SELECTOR_TYPE.V3 || selectorType === SELECTOR_TYPE.STABLE,
        'p-5 md:p-8': !isModal,
      })}
    >
      {selectorType === SELECTOR_TYPE.V2 && (
        <>
          <div>
            <SectionTitle>{t('Choose Token Pair')}</SectionTitle>{' '}
            <div className="flex items-center space-x-3 mt-2">
              <CurrencySelect
                id="add-liquidity-select-tokena"
                selectedCurrency={baseCurrency}
                onCurrencySelect={handleCurrencyASelect}
                showCommonBases
                commonBasesType={CommonBasesType.LIQUIDITY}
                hideBalance
              />

              <Plus size={16} className="text-on-surface shrink-0" />

              <CurrencySelect
                id="add-liquidity-select-tokenb"
                selectedCurrency={quoteCurrency}
                onCurrencySelect={handleCurrencyBSelect}
                showCommonBases
                commonBasesType={CommonBasesType.LIQUIDITY}
                hideBalance
              />
            </div>
          </div>

          <DynamicSection disabled={!baseCurrency || !quoteCurrency} className="flex flex-col space-y-8">
            <V2Selector
              isStable={Boolean(stableConfig.stableSwapConfig)}
              selectorType={selectorType}
              handleFeePoolSelect={({ type }) => {
                // keep using state instead of replacing url in UniversalLiquidity
                handleFeePoolSelect({ type })
              }}
            />

            <AddLiquidity currencyA={baseCurrency || undefined} currencyB={quoteCurrency || undefined}>
              {(props) => <V2FormView {...props} />}
            </AddLiquidity>
          </DynamicSection>
        </>
      )}

      {selectorType === SELECTOR_TYPE.STABLE && (
        <StableConfigContext.Provider value={stableConfig}>
          <AddStableLiquidity currencyA={baseCurrency || undefined} currencyB={quoteCurrency || undefined}>
            {(props) => <StableFormView {...props} stableLpFee={stableConfig?.stableSwapConfig?.stableLpFee} />}
          </AddStableLiquidity>
        </StableConfigContext.Provider>
      )}

      {selectorType === SELECTOR_TYPE.V3 && (
        <V3FormView
          feeAmount={feeAmount}
          baseCurrency={baseCurrency || undefined}
          quoteCurrency={quoteCurrency || undefined}
          currencyIdA={currencyIdA}
          currencyIdB={currencyIdB}
          handleCurrencyASelect={handleCurrencyASelect}
          handleCurrencyBSelect={handleCurrencyBSelect}
          handleFeePoolSelect={handleFeePoolSelect}
          handleSelectV2={handleSelectV2}
        />
      )}
    </div>
  )
}

const SELECTOR_TYPE_T = {
  [SELECTOR_TYPE.STABLE]: (
    <h2 className="font-bold text-on-surface text-lg">
      <Trans>Add Stable Liquidity</Trans>
    </h2>
  ),
  [SELECTOR_TYPE.V2]: (
    <h2 className="font-bold text-on-surface text-lg">
      <Trans>Add V2 Liquidity</Trans>
    </h2>
  ),
  [SELECTOR_TYPE.V3]: (
    <h2 className="font-bold text-on-surface text-lg">
      <Trans>Add V3 Liquidity</Trans>
    </h2>
  ),
} as const satisfies Record<SELECTOR_TYPE, JSX.Element>

export function AddLiquidityV3Layout({
  showRefreshButton = false,
  handleRefresh,
  children,
}: {
  showRefreshButton?: boolean
  handleRefresh?: () => void
  children: React.ReactNode
}) {
  const { t } = useTranslation()

  const { backTo } = useBackTo()

  const [selectType] = useAtom(selectTypeAtom)
  const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams()

  const baseCurrency = useCurrency(currencyIdA)
  const quoteCurrency = useCurrency(currencyIdB)

  const title = SELECTOR_TYPE_T[selectType] || t('Add Liquidity')

  return (
    <Page>
      <AppBody
        maxWidth={clsx({ 'max-w-md': selectType === SELECTOR_TYPE.V2, 'max-w-4xl': selectType !== SELECTOR_TYPE.V2 })}
      >
        <AppHeader
          title={title}
          backTo={backTo}
          IconSlot={
            <>
              {selectType === SELECTOR_TYPE.V3 && (
                <AprCalculator
                  showQuestion
                  baseCurrency={baseCurrency}
                  quoteCurrency={quoteCurrency}
                  feeAmount={feeAmount}
                  className="mr-2"
                />
              )}

              {showRefreshButton && (
                <MenuIconButton onClick={handleRefresh || noop}>
                  <ArrowClockwise size={24} className="text-gray-50" weight="fill" />
                </MenuIconButton>
              )}
            </>
          }
        />
        {children}
      </AppBody>
    </Page>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs text-on-surface-brand">{children}</h3>
}

export function DynamicSection({
  children,
  disabled,
  className,
}: PropsWithChildren<{ disabled?: boolean; className?: string }>) {
  return (
    <div
      className={clsx('w-full', className, {
        'opacity-50 pointer-events-none': disabled,
      })}
    >
      {children}
    </div>
  )
}
