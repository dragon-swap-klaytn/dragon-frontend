import { Currency, Token } from '@pancakeswap/swap-sdk-core'
import { CSSProperties } from 'react'
import TokenRowWithCurrencyLogo from './TokenRowWithCurrencyLogo'

interface ImportTokenRowProps {
  token: Token
  style?: CSSProperties
  onCurrencySelect?: (currency: Currency) => void
  isActive: boolean
  isAdded: boolean
  setImportToken: (token: Token) => void
  showImportView: () => void
  className?: string
}

const ImportTokenRow: React.FC<React.PropsWithChildren<ImportTokenRowProps>> = ({
  token,
  style,
  onCurrencySelect,
  isActive,
  isAdded,
  setImportToken,
  showImportView,
  className,
}) => {
  return (
    <TokenRowWithCurrencyLogo
      style={style}
      token={token}
      onCurrencySelect={onCurrencySelect}
      isActive={isActive}
      isAdded={isAdded}
      setImportToken={setImportToken as any}
      showImportView={showImportView}
      className={className}
    />
  )
}

export default ImportTokenRow
