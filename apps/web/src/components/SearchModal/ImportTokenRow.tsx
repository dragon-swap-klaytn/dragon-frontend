import { Currency, Token } from '@pancakeswap/swap-sdk-core'
import { CSSProperties } from 'react'
import TokenRowWithCurrencyLogo from './TokenRowWithCurrencyLogo'

interface ImportTokenRowProps {
  token: Token
  style?: CSSProperties
  dim?: boolean
  onCurrencySelect?: (currency: Currency) => void
  list: any
  isActive: boolean
  isAdded: boolean
  setImportToken: (token: Token) => void
  showImportView: () => void
}

const ImportTokenRow: React.FC<React.PropsWithChildren<ImportTokenRowProps>> = ({
  token,
  style,
  dim,
  list,
  onCurrencySelect,
  isActive,
  isAdded,
  setImportToken,
  showImportView,
}) => {
  return (
    <TokenRowWithCurrencyLogo
      style={style}
      token={token}
      dim={dim}
      list={list}
      onCurrencySelect={onCurrencySelect}
      isActive={isActive}
      isAdded={isAdded}
      setImportToken={setImportToken as any}
      showImportView={showImportView}
    />
  )
}

export default ImportTokenRow
