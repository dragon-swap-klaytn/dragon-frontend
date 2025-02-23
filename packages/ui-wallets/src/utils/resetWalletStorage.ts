import { WalletStorageKey } from '../consts'

export function resetWalletStorage() {
  if (!localStorage) return

  localStorage.removeItem(WalletStorageKey.WALLET)
  localStorage.removeItem(WalletStorageKey.CONNECTOR)
  localStorage.removeItem(WalletStorageKey.ADDRESS)
}
