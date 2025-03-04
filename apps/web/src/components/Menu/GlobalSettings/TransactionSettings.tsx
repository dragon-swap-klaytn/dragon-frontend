import { useTranslation } from '@pancakeswap/localization'
import { useUserSlippage, useUserTxTtl } from '@pancakeswap/utils/user'
import { useCallback, useMemo, useState } from 'react'
import { escapeRegExp } from 'utils'

import { ButtonV2, NumberFormat } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { SettingTitle } from 'components/Menu/GlobalSettings/SettingsModal'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
const MAX_SLIPPAGE = 100
const DEFAULT_TTL = 1
const MAX_TTL = 30 // 30 minutes

const SlippageTabs = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippage()
  const [ttl, setTtl] = useUserTxTtl()

  const [slippageInput, setSlippageInput] = useState('')

  const { t } = useTranslation()

  const slippageError = useMemo(() => {
    if (slippageInput !== '') {
      try {
        const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(slippageInput) * 100).toString())
        if (Number.isNaN(valueAsIntFromRoundedFloat) || valueAsIntFromRoundedFloat >= 10_000) {
          return SlippageError.InvalidInput
        }
      } catch {
        return SlippageError.InvalidInput
      }
    }
    if (userSlippageTolerance < 50) {
      return SlippageError.RiskyLow
    }
    if (userSlippageTolerance > 500) {
      return SlippageError.RiskyHigh
    }
    return null
  }, [slippageInput, userSlippageTolerance])

  const parseCustomSlippage = useCallback(
    (value: string) => {
      if (value === '' || inputRegex.test(escapeRegExp(value))) {
        setSlippageInput(value)

        try {
          const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
          if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 10_000) {
            setUserSlippageTolerance(valueAsIntFromRoundedFloat)
          }
        } catch (error) {
          console.error(error)
        }
      }
    },
    [setUserSlippageTolerance, setSlippageInput],
  )

  const parseCustomDeadline = useCallback(
    (value: string) => {
      try {
        const numberedValue = +value

        if (value === '') {
          setTtl(DEFAULT_TTL)
        } else if (!Number.isNaN(numberedValue)) {
          setTtl(numberedValue)
        }
      } catch (error) {
        console.error(error)
      }
    },
    [setTtl],
  )

  return (
    <>
      <SettingTitle
        title={t('Slippage Tolerance')}
        questionHelperText={t(
          'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.',
        )}
      />

      <div className="flex flex-wrap gap-2 mt-3">
        <ButtonV2
          variant={userSlippageTolerance === 10 ? 'secondary' : 'blank'}
          onClick={() => {
            setSlippageInput('')
            setUserSlippageTolerance(10)
          }}
        >
          0.1%
        </ButtonV2>
        <ButtonV2
          variant={userSlippageTolerance === 50 ? 'secondary' : 'blank'}
          onClick={() => {
            setSlippageInput('')
            setUserSlippageTolerance(50)
          }}
        >
          0.5%
        </ButtonV2>
        <ButtonV2
          variant={userSlippageTolerance === 100 ? 'secondary' : 'blank'}
          onClick={() => {
            setSlippageInput('')
            setUserSlippageTolerance(100)
          }}
        >
          1.0%
        </ButtonV2>
        <div className="items-center space-x-1 inline-flex">
          <NumberFormat
            className="text-on-surface w-20 text-sm bg-transparent border border-gray-700 rounded-[20px] px-4 h-10 text-right focus:outline-none"
            value={slippageInput}
            onChange={(e) => {
              if (e.currentTarget.validity.valid) {
                parseCustomSlippage(e.target.value.replace(/,/g, '.'))
              }
            }}
            thousandSeparator
            allowNegative={false}
            decimalScale={2}
            placeholder={(userSlippageTolerance / 100).toFixed(2)}
            pattern="^[0-9]*[.,]?[0-9]{0,2}$"
            isAllowed={(values) => {
              const { floatValue } = values
              return floatValue === undefined || floatValue <= MAX_SLIPPAGE
            }}
          />

          <span className="text-sm text-on-surface">%</span>
        </div>
      </div>
      {slippageError && (
        <p
          className={clsx(
            'mt-2 text-sm text-center',
            slippageError === SlippageError.InvalidInput ? 'text-red-400' : 'text-on-surface-brand',
          )}
        >
          {slippageError === SlippageError.InvalidInput
            ? t('Enter a valid slippage percentage')
            : slippageError === SlippageError.RiskyLow
            ? t('Your transaction may fail')
            : t('Your transaction may be frontrun')}
        </p>
      )}

      <div className="flex items-center justify-between py-3">
        <SettingTitle
          title={t('Tx deadline (mins)')}
          questionHelperText={t('Transactions are automatically canceled if they exceed the set time.')}
        />

        <NumberFormat
          className="text-on-surface w-16 text-sm bg-transparent border border-gray-700 rounded-[20px] px-4 h-10 text-right focus:outline-none"
          onChange={(e) => {
            parseCustomDeadline(e.target.value.replace(/,/g, ''))
          }}
          thousandSeparator
          allowNegative={false}
          decimalScale={0}
          placeholder={(ttl / 60).toString()}
          pattern="^[0-9]+$"
          isAllowed={(values) => {
            const { floatValue } = values
            return floatValue === undefined || (floatValue <= MAX_TTL && floatValue > 0)
          }}
        />
      </div>
    </>
  )
}

export default SlippageTabs
