import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ContainerV2, ExternalLink } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useMemo } from 'react'
import { safeGetAddress } from 'utils'
import { getBlockExploreLink, getBlockExploreName } from '../../../utils'

export default function AddressInputPanel({
  value,
  onChange,
}: {
  // the typed string value
  value: string
  // triggers whenever the typed value changes
  onChange: (value: string) => void
}) {
  const { chainId } = useActiveChainId()

  const { t } = useTranslation()
  const debouncedAddress = useDebounce(value, 500)
  const address = useMemo(() => safeGetAddress(debouncedAddress), [debouncedAddress])

  const handleInput = useCallback(
    (event) => {
      const input = event.target.value
      const withoutSpaces = input.replace(/\s+/g, '')
      onChange(withoutSpaces)
    },
    [onChange],
  )

  const error = Boolean(debouncedAddress.length > 0 && !address)
  return (
    <ContainerV2>
      <div className="flex items-center space-x-2 justify-between w-full">
        <h4 className="text-[13px] text-on-surface">{t('Recipient')}</h4>

        {address && chainId && (
          <ExternalLink href={getBlockExploreLink(address, 'address')} textSize="text-xs">
            {t('View on {{site}}', {
              site: getBlockExploreName(),
            })}
          </ExternalLink>
        )}

        {error && <span className="text-xs text-red-400">{t('Invalid address')}</span>}
      </div>

      <input
        type="text"
        className="recipient-address-input bg-transparent focus:outline-none w-full text-on-surface mt-2.5 text-sm"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={t('Wallet Address...')}
        pattern="^(0x[a-fA-F0-9]{40})$"
        onChange={handleInput}
        value={value}
      />
    </ContainerV2>
  )
}
