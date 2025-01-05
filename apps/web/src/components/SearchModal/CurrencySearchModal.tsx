import { usePreviousValue } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { InjectedModalProps, Modal } from '@pancakeswap/uikit'
import Button from 'components/Common/Button'
import ImportToken from 'components/SearchModal/ImportToken'
import { useCallback, useState } from 'react'
import CurrencySearch from './CurrencySearch'
import Manage from './Manage'
import { CurrencyModalView } from './types'

export interface CurrencySearchModalProps extends InjectedModalProps {
  selectedCurrency?: Currency | null
  onCurrencySelect?: (currency: Currency) => void
  showCommonBases?: boolean
  commonBasesType?: string
  showSearchInput?: boolean
  tokensToShow?: Token[]
}

export default function CurrencySearchModal({
  onDismiss = () => null,
  onCurrencySelect,
  selectedCurrency,
  showCommonBases = true,
  commonBasesType,
  showSearchInput,
  tokensToShow,
}: CurrencySearchModalProps) {
  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.search)

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onDismiss?.()
      onCurrencySelect?.(currency)
    },
    [onDismiss, onCurrencySelect],
  )

  // for token import view
  const prevView = usePreviousValue(modalView)

  // used for import token flow
  const [importToken, setImportToken] = useState<Token | undefined>()

  const { t } = useTranslation()

  const config = {
    [CurrencyModalView.search]: { title: t('Select a Token'), onBack: undefined },
    [CurrencyModalView.manage]: { title: t('Manage Tokens'), onBack: () => setModalView(CurrencyModalView.search) },
    [CurrencyModalView.importToken]: {
      title: t('Import Tokens'),
      onBack: () =>
        setModalView(prevView && prevView !== CurrencyModalView.importToken ? prevView : CurrencyModalView.search),
    },
  }

  return (
    <Modal title={config[modalView].title} onDismiss={onDismiss} onBack={config[modalView].onBack}>
      <div className="overflow-y-auto w-full">
        {modalView === CurrencyModalView.search ? (
          <CurrencySearch
            onCurrencySelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
            showCommonBases={showCommonBases}
            commonBasesType={commonBasesType}
            showSearchInput={showSearchInput}
            showImportView={() => setModalView(CurrencyModalView.importToken)}
            setImportToken={setImportToken}
            tokensToShow={tokensToShow}
          />
        ) : modalView === CurrencyModalView.importToken && importToken ? (
          <ImportToken tokens={[importToken]} handleCurrencySelect={handleCurrencySelect} />
        ) : modalView === CurrencyModalView.manage ? (
          <Manage setModalView={setModalView} setImportToken={setImportToken} />
        ) : (
          <></>
        )}

        {modalView === CurrencyModalView.search && (
          <Button variant="subtle" onClick={() => setModalView(CurrencyModalView.manage)} className="mt-6" fullWidth>
            {t('Manage Tokens')}
          </Button>
        )}
      </div>
    </Modal>
  )
}
