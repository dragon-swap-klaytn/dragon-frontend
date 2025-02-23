import { useTranslation } from '@pancakeswap/localization'
import { Token } from '@pancakeswap/sdk'
import { InjectedModalProps, Modal } from '@pancakeswap/uikit'
import ImportToken from 'components/SearchModal/ImportToken'
import { useUnsupportedTokens } from 'hooks/Tokens'
import { useMemo } from 'react'
import { UnsupportedModal } from './UnsupportedModal'

interface Props extends InjectedModalProps {
  tokens: Token[]
  onCancel: () => void
  customOnDismiss?: () => void
}

const ImportTokenWarningModal: React.FC<React.PropsWithChildren<Props>> = ({
  tokens,
  onDismiss,
  onCancel,
  customOnDismiss,
}) => {
  const { t } = useTranslation()

  const unsupportedTokens = useUnsupportedTokens()

  const hasUnsupportedTokens = useMemo(() => {
    return tokens.some((token) => {
      return unsupportedTokens?.[token.address]
    })
  }, [tokens, unsupportedTokens])

  if (hasUnsupportedTokens) {
    return <UnsupportedModal onDismiss={onCancel} currencies={tokens} />
  }

  return (
    <Modal
      title={t('Import Token')}
      onDismiss={() => {
        if (customOnDismiss) customOnDismiss()
        onDismiss?.()
        onCancel()
      }}
    >
      <span className="text-on-surface">asasdfasdf</span>
      <ImportToken tokens={tokens} handleCurrencySelect={onDismiss} />
    </Modal>
  )
}

export default ImportTokenWarningModal
