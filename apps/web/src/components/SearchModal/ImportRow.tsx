import { Currency, Token } from '@pancakeswap/sdk'
import { useIsTokenActive } from 'hooks/Tokens'
import { CSSProperties } from 'react'
import { useIsUserAddedTokenFromLs } from 'state/user/hooks/useUserAddedTokens'
import ImportTokenRow from './ImportTokenRow'

export default function ImportRow({
  token,
  style,
  onCurrencySelect,
  showImportView,
  setImportToken,
  className,
}: {
  token: Token
  style?: CSSProperties
  onCurrencySelect?: (currency: Currency) => void
  showImportView: () => void
  setImportToken: (token: Token) => void
  className?: string
}) {
  // check if already active on list or local storage tokens
  const { isAdded } = useIsUserAddedTokenFromLs(token)
  const isActive = useIsTokenActive(token)

  return (
    <ImportTokenRow
      style={style}
      token={token}
      onCurrencySelect={onCurrencySelect}
      showImportView={showImportView}
      setImportToken={setImportToken}
      isActive={isActive}
      isAdded={isAdded}
      className={className}
    />
  )
}
