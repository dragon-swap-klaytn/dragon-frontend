import { useTranslation } from '@pancakeswap/localization'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useState } from 'react'
import { escapeRegExp } from 'utils'

import clsx from 'clsx'
import Button from 'components/Common/Button'
import NumberFormat from 'components/Common/NumberFormat'
import { SettingTitle } from 'components/Menu/GlobalSettings/SettingsModal'
import { useUserTransactionTTL } from 'state/user/hooks'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
const THREE_DAYS_IN_SECONDS = 60 * 60 * 24 * 3

const SlippageTabs = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippage()
  const [ttl, setTtl] = useUserTransactionTTL()
  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const { t } = useTranslation()

  const slippageInputIsValid =
    slippageInput === '' || (userSlippageTolerance / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (ttl / 60).toString() === deadlineInput

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && userSlippageTolerance < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && userSlippageTolerance > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  const parseCustomSlippage = (value: string) => {
    if (value === '' || inputRegex.test(escapeRegExp(value))) {
      setSlippageInput(value)

      try {
        const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
        if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
          setUserSlippageTolerance(valueAsIntFromRoundedFloat)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const parseCustomDeadline = (value: string) => {
    setDeadlineInput(value)

    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 60 && valueAsInt < THREE_DAYS_IN_SECONDS) {
        setTtl(valueAsInt)
      } else {
        deadlineError = DeadlineError.InvalidInput
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    // <Flex flexDirection="column">
    <>
      <SettingTitle
        title={t('Slippage Tolerance')}
        questionHelperText={t(
          'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.',
        )}
      />

      <div className="flex flex-wrap gap-2 mt-3">
        <Button
          variant={userSlippageTolerance === 10 ? 'secondary' : 'blank'}
          onClick={() => {
            setSlippageInput('')
            setUserSlippageTolerance(10)
          }}
        >
          0.1%
        </Button>
        <Button
          variant={userSlippageTolerance === 50 ? 'secondary' : 'blank'}
          onClick={() => {
            setSlippageInput('')
            setUserSlippageTolerance(50)
          }}
        >
          0.5%
        </Button>
        <Button
          variant={userSlippageTolerance === 100 ? 'secondary' : 'blank'}
          onClick={() => {
            setSlippageInput('')
            setUserSlippageTolerance(100)
          }}
        >
          1.0%
        </Button>
        {/* <Flex alignItems="center"> */}
        {/* <input className="border border-gray-700" /> */}
        <div className="items-center space-x-1 inline-flex">
          {/* <Box width="76px" mt="4px">
            <Input
              scale="sm"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]{0,2}$"
              placeholder={(userSlippageTolerance / 100).toFixed(2)}
              value={slippageInput}
              onBlur={() => {
                parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
              }}
              onChange={(event) => {
                if (event.currentTarget.validity.valid) {
                  parseCustomSlippage(event.target.value.replace(/,/g, '.'))
                }
              }}
              isWarning={!slippageInputIsValid}
              isSuccess={![10, 50, 100].includes(userSlippageTolerance)}
            />
          </Box> */}

          <NumberFormat
            // error={error ?? false}
            // disabled={disabled}
            // loading={inputLoading}
            className="text-white w-20 text-sm bg-transparent border border-gray-700 rounded-[20px] px-4 h-10 text-left focus:outline-none"
            value={slippageInput}
            onBlur={() => {
              parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
            }}
            onChange={(e) => {
              if (e.currentTarget.validity.valid) {
                parseCustomSlippage(e.target.value.replace(/,/g, '.'))
              }
            }}
            thousandSeparator
            allowNegative={false}
            decimalScale={2}
            placeholder={(userSlippageTolerance / 100).toFixed(2)}
            // pattern='[0-9]*[.,]?[0-9]{0,2}'
            pattern="^[0-9]*[.,]?[0-9]{0,2}$"
          />

          <span className="text-sm">%</span>
        </div>
      </div>
      {slippageError && (
        <p
          className={clsx(
            'mt-2 text-sm text-center',
            slippageError === SlippageError.InvalidInput ? 'text-red-400' : 'text-orange-400',
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
          questionHelperText={t('Your transaction will revert if it is left confirming for longer than this time.')}
        />

        <NumberFormat
          className="text-white w-16 text-sm bg-transparent border border-gray-700 rounded-[20px] px-4 h-10 text-left focus:outline-none"
          value={slippageInput}
          onBlur={() => {
            parseCustomDeadline((ttl / 60).toString())
          }}
          onChange={(e) => {
            if (e.currentTarget.validity.valid) {
              parseCustomDeadline(e.target.value)
            }
          }}
          thousandSeparator
          allowNegative={false}
          decimalScale={0}
          placeholder={(ttl / 60).toString()}
          pattern="^[0-9]+$"
        />
      </div>
    </>
  )
}

export default SlippageTabs
