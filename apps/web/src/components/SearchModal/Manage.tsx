import { Token } from '@pancakeswap/sdk'
import { ModalBody } from '@pancakeswap/uikit'
import ManageTokens from './ManageTokens'
import { CurrencyModalView } from './types'

export default function Manage({
  setModalView,
  setImportToken,
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
}) {
  return (
    <ModalBody style={{ overflow: 'visible' }}>
      <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
    </ModalBody>
  )
}
