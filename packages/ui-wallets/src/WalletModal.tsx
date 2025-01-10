import { usePreloadImages } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Image, Modal, ModalV2Props, SvgProps } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { atom, useAtom } from 'jotai'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'

export const KLIP_TIMEOUT = 5 * 60

const Qrcode = lazy(() => import('./components/QRCode'))

type LinkOfTextAndLink = string | { text: string; url: string }

type DeviceLink = {
  desktop?: LinkOfTextAndLink
  mobile?: LinkOfTextAndLink
}

type LinkOfDevice = string | DeviceLink

export type WalletConfigV2<T = unknown> = {
  id: T
  title: string
  icon: string | React.FC<React.PropsWithChildren<SvgProps>>
  connectorId?: T
  deepLink?: string
  installed?: boolean
  guide?: LinkOfDevice
  downloadLink?: LinkOfDevice
  mobileOnly?: boolean
  qrCode?: () => Promise<string>
  isNotExtension?: boolean
}

interface WalletModalV2Props<T = unknown> extends ModalV2Props {
  wallets: WalletConfigV2<T>[]
  login: (connectorId: T) => Promise<any>
  docLink: string
  docText: string
  onWalletConnectCallBack?: (walletTitle?: string) => void
}

export class WalletConnectorNotFoundError extends Error {}

export class WalletSwitchChainError extends Error {}

const errorAtom = atom<string>('')

const selectedWalletAtom = atom<WalletConfigV2<unknown> | null>(null)

export function useSelectedWallet<T>() {
  // @ts-ignore
  return useAtom<WalletConfigV2<T> | null>(selectedWalletAtom)
}

const MOBILE_DEFAULT_DISPLAY_COUNT = 8

export const walletLocalStorageKey = 'wallet'
export const addressLocalStorageKey = 'address'

const lastUsedWalletNameAtom = atom<string>('')

lastUsedWalletNameAtom.onMount = (set) => {
  const preferred = localStorage?.getItem(walletLocalStorageKey)
  if (preferred) {
    set(preferred)
  }
}

function sortWallets<T>(wallets: WalletConfigV2<T>[], lastUsedWalletName: string | null) {
  const sorted = [...wallets].sort((a, b) => {
    if (a.installed === b.installed) return 0
    return a.installed === true ? -1 : 1
  })

  if (!lastUsedWalletName) {
    return sorted
  }
  const foundLastUsedWallet = wallets.find((w) => w.title === lastUsedWalletName)
  if (!foundLastUsedWallet) return sorted
  return [foundLastUsedWallet, ...sorted.filter((w) => w.id !== foundLastUsedWallet.id)]
}

export function WalletModalV2<T = unknown>(props: WalletModalV2Props<T>) {
  const { wallets: _wallets, login, docLink, docText, onWalletConnectCallBack, isOpen, onDismiss } = props

  const [lastUsedWalletName] = useAtom(lastUsedWalletNameAtom)

  const wallets = useMemo(() => sortWallets(_wallets, lastUsedWalletName), [_wallets, lastUsedWalletName])
  const [, setSelected] = useSelectedWallet<T>()
  const [, setError] = useAtom(errorAtom)
  const { t } = useTranslation()

  const imageSources = useMemo(
    () => wallets.map((w) => w.icon).filter((icon) => typeof icon === 'string') as string[],
    [wallets],
  )

  usePreloadImages(imageSources.slice(0, MOBILE_DEFAULT_DISPLAY_COUNT))

  const [selected] = useSelectedWallet()
  const [error] = useAtom(errorAtom)
  const [qrCode, setQrCode] = useState<string | undefined>(undefined)

  const remainTimeIntervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const [remainTime, setRemainTime] = useState(KLIP_TIMEOUT)

  useEffect(() => {
    if (!qrCode || !selected || selected.id !== 'klip') {
      if (remainTimeIntervalIdRef.current) {
        clearInterval(remainTimeIntervalIdRef.current)
      }

      return
    }
    if (selected.id !== 'klip') return

    let _timeout = KLIP_TIMEOUT

    remainTimeIntervalIdRef.current = setInterval(() => {
      if (_timeout <= 0) {
        setQrCode(undefined)
        setSelected(null)
        clearInterval(remainTimeIntervalIdRef.current as NodeJS.Timeout)
      }

      setRemainTime(_timeout--)
    }, 1_000)
  }, [qrCode, selected, setSelected, setRemainTime])

  const connectWallet = (wallet: WalletConfigV2<T>) => {
    if (!wallet.connectorId) return

    setSelected(wallet)
    setError('')

    login(wallet.connectorId)
      .then((v) => {
        if (v) {
          localStorage?.setItem(walletLocalStorageKey, wallet.title)
          localStorage?.setItem(addressLocalStorageKey, v.account)

          try {
            onWalletConnectCallBack?.(wallet.title)
            onDismiss?.()
          } catch (e) {
            console.error(wallet.title, e)
          } finally {
            if (remainTimeIntervalIdRef.current) {
              clearInterval(remainTimeIntervalIdRef.current)
            }
          }
        }
      })
      .catch((err) => {
        if (err instanceof WalletConnectorNotFoundError) {
          setError(t('no provider found'))
        } else if (err instanceof WalletSwitchChainError) {
          setError(err.message)
        } else {
          setError(t('Error connecting, please authorize wallet to access.'))
        }
      })
  }

  return (
    <>
      <Modal title={t('Connect Wallet')} onDismiss={onDismiss}>
        <p className="text-sm text-on-surface">
          {t(
            'Start by connecting with one of the wallets below. Be sure to store your private keys or seed phrase securely. Never share them with anyone.',
          )}
        </p>

        <p className="text-sm text-on-surface mt-2">
          By connecting a wallet, you agree to Dragonswap{' '}
          <a href="/terms" className="font-bold underline underline-offset-2 hover:opacity-70">
            Terms of Service
          </a>
        </p>

        {qrCode && selected ? (
          <div className="flex flex-col items-center mt-4 space-y-4">
            <div className="flex items-center justify-center">
              <Suspense>
                <div className="w-72 h-72 rounded-xl overflow-hidden">
                  <Qrcode url={qrCode} image={typeof selected.icon === 'string' ? selected.icon : undefined} />
                </div>
              </Suspense>
            </div>

            {remainTime > 7 && (
              <p className="text-sm text-on-surface-brand text-center">{`${Math.floor(remainTime / 60)}:${String(
                remainTime % 60,
              ).padStart(2, '0')}`}</p>
            )}

            <button
              type="button"
              className="text-sm h-10 px-4 bg-neutral text-on-surface rounded-2xl self-end"
              onClick={() => {
                setQrCode(undefined)
                setSelected(null)
              }}
            >
              {t('Cancel')}
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col space-y-1">
            {wallets.map((wallet) => {
              const isImage = typeof wallet.icon === 'string'
              const Icon = wallet.icon

              return (
                <button
                  key={wallet.title}
                  type="button"
                  className={clsx('p-3 flex items-center justify-between rounded-xl text-on-surface hover:opacity-70', {
                    'bg-brand': selected?.id === wallet.id,
                    'bg-neutral': selected?.id !== wallet.id,
                  })}
                  onClick={() => {
                    if (wallet.installed === false && wallet.downloadLink) {
                      window.open(getDesktopLink(wallet.downloadLink))
                      return
                    }

                    connectWallet(wallet)
                    setQrCode(undefined)

                    if (isMobile) {
                      const ua = navigator.userAgent
                      const isOKApp = /OKApp/i.test(ua)

                      if (wallet.connectorId === 'okxwallet' && !isOKApp) {
                        window.open(wallet.deepLink)
                      } else if (wallet.deepLink && wallet.installed === false) {
                        window.open(wallet.deepLink)
                      }
                    } else if (wallet.qrCode) {
                      wallet.qrCode().then(
                        (uri) => {
                          setQrCode(uri)
                        },
                        () => {
                          // do nothing.
                        },
                      )
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-dropdown rounded-lg overflow-hidden">
                      {isImage ? (
                        <Image src={Icon as string} width={50} height={50} />
                      ) : (
                        <Icon width={24} height={24} color="textSubtle" />
                      )}
                    </div>

                    <span>{wallet.title}</span>
                  </div>

                  {wallet.installed === false && wallet.downloadLink && (
                    <div className="px-2 py-0.5 rounded-md bg-transparent border text-xs">{t('not installed')}</div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </Modal>
    </>
  )
}

const getDesktopLink = (linkDevice: LinkOfDevice) =>
  typeof linkDevice === 'string'
    ? linkDevice
    : typeof linkDevice.desktop === 'string'
    ? linkDevice.desktop
    : linkDevice.desktop?.url
