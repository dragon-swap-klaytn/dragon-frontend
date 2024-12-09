import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType } from '@pancakeswap/sdk'
import { LegacyPair as Pair } from '@pancakeswap/smart-router/legacy-router'
import { AutoColumn, Flex, Modal, ModalV2, QuestionHelper, SearchIcon, Text } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { memo, useMemo, useState } from 'react'

import clsx from 'clsx'
import { RowBetween } from 'components/Layout/Row'
import { RoutingSettingsButton } from 'components/Menu/GlobalSettings/SettingsModal'
import { ONE_BIPS } from 'config/constants/exchange'
import { Field } from 'state/swap/actions'
import { warningSeverity } from 'utils/exchange'
import { DetailContent } from 'views/Swap/V3Swap/containers'
import { RouterViewer } from './RouterViewer'
import SwapRoute from './SwapRoute'

export const TradeSummary = memo(function TradeSummary({
  inputAmount,
  outputAmount,
  tradeType,
  slippageAdjustedAmounts,
  priceImpactWithoutFee,
  realizedLPFee,
  isMM = false,
}: {
  hasStablePair?: boolean
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  tradeType?: TradeType
  slippageAdjustedAmounts: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  priceImpactWithoutFee?: Percent
  realizedLPFee?: CurrencyAmount<Currency>
  isMM?: boolean
}) {
  const { t } = useTranslation()
  const isExactIn = tradeType === TradeType.EXACT_INPUT

  const severity = useMemo(() => warningSeverity(priceImpactWithoutFee), [priceImpactWithoutFee])

  return (
    // <AutoColumn style={{ padding: '0 24px' }}>
    <div className="flex flex-col space-y-2">
      <DetailContent
        title={isExactIn ? t('Minimum received') : t('Maximum sold')}
        questionHelperText={t(
          'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
        )}
        content={
          <span>
            {isExactIn
              ? `${formatAmount(slippageAdjustedAmounts[Field.OUTPUT], 4)} ${outputAmount?.currency?.symbol}`.trim() ||
                '-'
              : `${formatAmount(slippageAdjustedAmounts[Field.INPUT], 4)} ${inputAmount?.currency?.symbol}`.trim() ||
                '-'}
          </span>
        }
      />

      {priceImpactWithoutFee && (
        <DetailContent
          title={t('Price Impact')}
          questionHelperText={
            <div className="text-sm">
              <p>
                <b>{t('AMM')}</b>: {t('The difference between the market price and estimated price due to trade size.')}
              </p>
              {/* <p className="mt-4">
                <b>{t('MM')}</b>: {t('No slippage against quote from market maker.')}
              </p> */}
            </div>
          }
          content={
            isMM ? (
              <span>--</span>
            ) : (
              //         severity === 3 || severity === 4
              // ? theme.colors.failure
              // : severity === 2
              // ? theme.colors.warning
              // : severity === 1
              // ? theme.colors.text
              // : theme.colors.success};
              <span
                className={clsx({
                  'text-red-400': severity === 2 || severity === 3 || severity === 4,
                })}
              >
                {priceImpactWithoutFee
                  ? priceImpactWithoutFee.lessThan(ONE_BIPS)
                    ? '<0.01%'
                    : `${priceImpactWithoutFee.toFixed(2)}%`
                  : '-'}
              </span>
            )

            // <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
          }
        />

        // <RowBetween style={{ padding: '4px 0 0 0' }}>
        //   <RowFixed>
        //     <Text fontSize="14px" color="textSubtle">
        //       {t('Price Impact')}
        //     </Text>
        //     <QuestionHelper
        //       text={

        //       }
        //       ml="4px"
        //       placement="top"
        //     />
        //   </RowFixed>

        //   {isMM ? <Text color="textSubtle">--</Text> : <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />}
        // </RowBetween>
      )}

      {realizedLPFee && (
        <DetailContent
          title={t('Trading Fee')}
          questionHelperText={
            <div className="text-sm">
              <p>
                <b>{t('AMM')}</b>:{' '}
                {t(
                  'Fee ranging from 0.1% to 0.01% depending on the pool fee tier. You can check the fee tier by clicking the magnifier icon under the “Route” section.',
                )}
              </p>
              <a
                href={
                  isMM
                    ? 'https://docs.dgswap.io/products/market-maker-integration#fees'
                    : 'https://docs.dgswap.io/products/fees'
                }
                className="text-blue-400 mt-4 underline underline-offset-2 inline-block hover:opacity-70"
                target="_blank"
                rel="noreferrer"
              >
                {t('Fee Breakdown and Tokenomics')}
              </a>
              <p className="mt-4">
                <b>{t('MM')}</b>:{' '}
                {t(
                  'PancakeSwap does not charge any fees for trades. However, the market makers charge an implied fee of 0.05% - 0.25% (non-stablecoin) / 0.01% (stablecoin) factored into the quotes provided by them.',
                )}
              </p>
            </div>
          }
          content={<span>{`${formatAmount(realizedLPFee, 4)} ${inputAmount?.currency?.symbol}`}</span>}
        />

        // <RowBetween style={{ padding: '4px 0 0 0' }}>
        //   <RowFixed>
        //     <Text fontSize="14px" color="textSubtle">
        //       {t('Trading Fee')}
        //     </Text>
        //     <QuestionHelper
        //       text={
        //         <>
        //           <Text mb="12px">
        //             <Text bold display="inline-block">
        //               {t('AMM')}
        //             </Text>
        //             :{' '}
        //             {t(
        //               'Fee ranging from 0.1% to 0.01% depending on the pool fee tier. You can check the fee tier by clicking the magnifier icon under the “Route” section.',
        //             )}
        //           </Text>
        //           <Text mt="12px">
        //             <Link
        //               style={{ display: 'inline' }}
        //               ml="4px"
        //               external
        //               href={
        //                 isMM
        //                   ? 'https://docs.dgswap.io/products/market-maker-integration#fees'
        //                   : 'https://docs.dgswap.io/products/fees'
        //               }
        //             >
        //               {t('Fee Breakdown and Tokenomics')}
        //             </Link>
        //           </Text>
        //           <Text mt="10px">
        //             <Text bold display="inline-block">
        //               {t('MM')}
        //             </Text>
        //             :{' '}
        //             {t(
        //               'PancakeSwap does not charge any fees for trades. However, the market makers charge an implied fee of 0.05% - 0.25% (non-stablecoin) / 0.01% (stablecoin) factored into the quotes provided by them.',
        //             )}
        //           </Text>
        //         </>
        //       }
        //       ml="4px"
        //       placement="top"
        //     />
        //   </RowFixed>
        //   <Text fontSize="14px">{`${formatAmount(realizedLPFee, 4)} ${inputAmount?.currency?.symbol}`}</Text>
        // </RowBetween>
      )}
    </div>
  )
})

export interface AdvancedSwapDetailsProps {
  hasStablePair?: boolean
  pairs?: Pair[]
  path?: Currency[]
  priceImpactWithoutFee?: Percent
  realizedLPFee?: CurrencyAmount<Currency>
  slippageAdjustedAmounts?: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  tradeType?: TradeType
  isMM?: boolean
}

export const AdvancedSwapDetails = memo(function AdvancedSwapDetails({
  pairs,
  path,
  priceImpactWithoutFee,
  realizedLPFee,
  slippageAdjustedAmounts,
  inputAmount,
  outputAmount,
  tradeType,
  hasStablePair,
  isMM = false,
}: AdvancedSwapDetailsProps) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const showRoute = Boolean(path && path.length > 1)
  return (
    <AutoColumn gap="0px">
      {inputAmount && (
        <>
          <TradeSummary
            inputAmount={inputAmount}
            outputAmount={outputAmount}
            tradeType={tradeType}
            slippageAdjustedAmounts={slippageAdjustedAmounts}
            priceImpactWithoutFee={priceImpactWithoutFee}
            realizedLPFee={realizedLPFee}
            hasStablePair={hasStablePair}
            isMM={isMM}
          />
          {showRoute && (
            <>
              <RowBetween style={{ padding: '0 24px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Text fontSize="14px" color="textSubtle">
                    {t('MM Route')}
                  </Text>
                  <QuestionHelper
                    text={t(
                      'The Market Maker (MM) route is automatically selected for your trade to achieve the best price for your trade.',
                    )}
                    ml="4px"
                    placement="top"
                  />
                </span>
                <SwapRoute path={path} />
                <SearchIcon style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(true)} />
                <ModalV2 closeOnOverlayClick isOpen={isModalOpen} onDismiss={() => setIsModalOpen(false)}>
                  <Modal
                    title={
                      <Flex justifyContent="center">
                        {t('Route')}{' '}
                        <QuestionHelper
                          text={t(
                            'Route is automatically calculated based on your routing preference to achieve the best price for your trade.',
                          )}
                          ml="4px"
                          placement="top"
                        />
                      </Flex>
                    }
                    onDismiss={() => setIsModalOpen(false)}
                  >
                    <RouterViewer
                      isMM={isMM}
                      inputCurrency={inputAmount?.currency}
                      pairs={pairs}
                      path={path}
                      outputCurrency={outputAmount?.currency}
                    />
                    <Flex mt="3em" width="100%" justifyContent="center">
                      <RoutingSettingsButton />
                    </Flex>
                  </Modal>
                </ModalV2>
              </RowBetween>
            </>
          )}
        </>
      )}
    </AutoColumn>
  )
})
