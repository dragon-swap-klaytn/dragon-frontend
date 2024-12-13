import { Currency, Token } from '@pancakeswap/sdk'
import { useIsTokenActive, useIsUserAddedToken } from 'hooks/Tokens'
import { CSSProperties } from 'react'
import { useCombinedInactiveList } from 'state/lists/hooks'
import ImportTokenRow from './ImportTokenRow'

export default function ImportRow({
  token,
  style,
  dim,
  onCurrencySelect,
  showImportView,
  setImportToken,
}: {
  token: Token
  style?: CSSProperties
  dim?: boolean
  onCurrencySelect?: (currency: Currency) => void
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  // check if token comes from list
  const inactiveTokenList = useCombinedInactiveList()
  const list = token?.chainId && inactiveTokenList?.[token.chainId]?.[token.address]?.list

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token)
  const isActive = useIsTokenActive(token)

  return (
    <ImportTokenRow
      style={style}
      token={token}
      dim={dim}
      onCurrencySelect={onCurrencySelect}
      showImportView={showImportView}
      setImportToken={setImportToken}
      list={list}
      isActive={isActive}
      isAdded={isAdded}
    />
  )
}
