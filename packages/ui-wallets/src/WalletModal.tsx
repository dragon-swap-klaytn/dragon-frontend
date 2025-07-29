import { usePreloadImages } from '@pancakeswap/hooks'
import { Trans, useTranslation } from '@pancakeswap/localization'
import { ConnectorId, ConnectorIds, Image, Modal, ModalV2Props, WalletId, WalletIds } from '@pancakeswap/uikit'
import { useWindowSize } from '@pancakeswap/uikit/hooks/useWindowSize'
import clsx from 'clsx'
import { atom, useAtom } from 'jotai'
import { Dispatch, SetStateAction, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { WalletStorageKey } from './consts'
import { LinkOfDevice, WalletConfigV2 } from './types'
import { resetWalletStorage } from './utils'

export class WalletConnectorNotFoundError extends Error {}
export class WalletSwitchChainError extends Error {}

export const QR_TIMEOUT = 5 * 60

const Qrcode = lazy(() => import('./components/QRCode'))
const errorAtom = atom<string>('')
const selectedWalletAtom = atom<WalletConfigV2 | null>(null)

export function useSelectedWallet(): [WalletConfigV2 | null, Dispatch<SetStateAction<WalletConfigV2 | null>>] {
  return useAtom(selectedWalletAtom)
}

const MOBILE_DEFAULT_DISPLAY_COUNT = 8
export const recentlyConnectedWalletIdsAtom = atom<WalletId[]>([])

recentlyConnectedWalletIdsAtom.onMount = (set) => {
  const preferred = localStorage?.getItem(WalletStorageKey.RECENTLY_CONNECTED)

  try {
    const parsed = preferred ? JSON.parse(preferred) : []
    set(parsed)
  } catch (e) {
    console.error('Failed to parse connected wallet ids from localStorage', e)
  }
}

function sortWallets(wallets: WalletConfigV2[], recentlyConnectedWalletIds: string[]) {
  const sorted = [...wallets].sort((a, b) => {
    if (!a.installed && b.installed) {
      return 1
    }

    if ((!a.installed && !b.installed) || (a.installed && b.installed)) {
      return a.title.localeCompare(b.title)
    }

    return -1
  })

  if (!recentlyConnectedWalletIds || recentlyConnectedWalletIds.length === 0) {
    return sorted
  }

  return sorted.sort((a, b) => {
    const aIndex = recentlyConnectedWalletIds.indexOf(a.id)
    const bIndex = recentlyConnectedWalletIds.indexOf(b.id)

    if (aIndex === -1 && bIndex === -1) {
      return 0
    }

    if (aIndex === -1) {
      return 1
    }

    if (bIndex === -1) {
      return -1
    }

    return aIndex - bIndex
  })
}

interface WalletModalV2Props extends ModalV2Props {
  wallets: WalletConfigV2[]
  login: (connectorId: ConnectorId) => Promise<any>
  onWalletConnectCallBack?: (walletTitle?: string) => void
  walletConnectNoQrCodeConnector: any
}

export function WalletModalV2(props: WalletModalV2Props) {
  const { i18n } = useTranslation()
  const {
    wallets: _wallets,
    login,
    onWalletConnectCallBack,
    onDismiss,
    walletConnectNoQrCodeConnector,
    ...rest
  } = props
  const [recentlyConnectedWalletIds] = useAtom(recentlyConnectedWalletIdsAtom)

  const wallets = useMemo(
    () => sortWallets(_wallets, recentlyConnectedWalletIds),
    [_wallets, recentlyConnectedWalletIds],
  )
  const [selected, setSelected] = useSelectedWallet()
  const [error, setError] = useAtom(errorAtom)
  const [qrCode, setQrCode] = useState<string | undefined>(undefined)
  const requestKeyRef = useRef<string | undefined>(undefined)
  const { t } = useTranslation()

  const imageSources = useMemo(
    () => wallets.map((w) => w.icon).filter((icon) => typeof icon === 'string') as string[],
    [wallets],
  )

  const init = useCallback(() => {
    setSelected(null)
    setQrCode(undefined)
    setError('')
    if (remainTimeIntervalIdRef.current) {
      clearInterval(remainTimeIntervalIdRef.current)
    }
    setRemainTime(QR_TIMEOUT)

    const klipWallet = wallets.find((w) => w.id === WalletIds.klip)
    const requestKey = requestKeyRef.current

    if (klipWallet && requestKey) {
      klipWallet.cancelRequest?.(requestKey)
    }

    requestKeyRef.current = undefined
  }, [setError, setQrCode, wallets, setSelected])

  useEffect(() => {
    return () => {
      init()
    }
  }, [init])

  const initLocalStorage = useCallback(() => {
    resetWalletStorage()
  }, [])

  const onDismissHandler = useCallback(() => {
    onDismiss?.()
    init()
    initLocalStorage()
  }, [onDismiss, init, initLocalStorage])

  usePreloadImages(imageSources.slice(0, MOBILE_DEFAULT_DISPLAY_COUNT))

  const remainTimeIntervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const [remainTime, setRemainTime] = useState(QR_TIMEOUT)

  useEffect(() => {
    if (!qrCode || !selected || !selected.qrCode) {
      if (remainTimeIntervalIdRef.current) {
        clearInterval(remainTimeIntervalIdRef.current)
      }

      return
    }

    let _timeout = QR_TIMEOUT

    remainTimeIntervalIdRef.current = setInterval(() => {
      if (_timeout <= 0) {
        setQrCode(undefined)
        setSelected(null)
        clearInterval(remainTimeIntervalIdRef.current as NodeJS.Timeout)
      }

      setRemainTime(_timeout--)
    }, 1_000)
  }, [qrCode, selected, setSelected, setRemainTime])

  const connectWithQrCode = useCallback(
    (wallet: WalletConfigV2) => {
      if (!wallet.qrCode) return

      setError('')

      wallet.qrCode().then(
        (uri) => {
          setSelected(wallet)
          setQrCode(uri as string)

          if (walletConnectNoQrCodeConnector) {
            const removeListeners = () => {
              walletConnectNoQrCodeConnector.removeListener('connect')
              walletConnectNoQrCodeConnector.removeListener('error')
            }

            walletConnectNoQrCodeConnector.addListener('connect', (res: any) => {
              const account = res?.account
              if (!account) {
                return
              }

              localStorage?.setItem(WalletStorageKey.WALLET, wallet.id)
              localStorage?.setItem(WalletStorageKey.CONNECTOR, ConnectorIds.walletConnect)
              localStorage?.setItem(WalletStorageKey.ADDRESS, account)

              setSelected(null)
              removeListeners()
              onDismiss?.()
            })
            walletConnectNoQrCodeConnector.addListener('error', (e: any) => {
              console.error('[walletConnectNoQrCodeConnector] connect error', e)
              setSelected(null)
              removeListeners()
            })
          }
        },
        () => {
          // do nothing.
        },
      )
    },
    [walletConnectNoQrCodeConnector, setQrCode, setSelected, setError, onDismiss],
  )

  const connectWallet = useCallback(
    (wallet: WalletConfigV2) => {
      login(wallet.connectorId)
        .then((v) => {
          requestKeyRef.current = undefined
          if (v) {
            localStorage?.setItem(WalletStorageKey.WALLET, wallet.id)
            localStorage?.setItem(WalletStorageKey.CONNECTOR, wallet.connectorId)
            localStorage?.setItem(WalletStorageKey.ADDRESS, v.account)

            try {
              onWalletConnectCallBack?.(wallet.title)
              onDismiss?.()
            } catch (e) {
              console.error(wallet.title, e)
            } finally {
              if (remainTimeIntervalIdRef.current) {
                clearInterval(remainTimeIntervalIdRef.current)
              }

              setSelected(null)
              setError('')
            }
          } else {
            init()
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
    },
    [init, login, onDismiss, onWalletConnectCallBack, setError, setSelected, t],
  )

  const walletOnClick = useCallback(
    (wallet: WalletConfigV2) => {
      setSelected(wallet)
      setError('')

      if (!isMobile && !wallet.installed && wallet.downloadLink) {
        window.open(getDesktopLink(wallet.downloadLink))
        return
      }

      if (isMobile) {
        switch (wallet.id) {
          case WalletIds.okxWallet: {
            const ua = navigator.userAgent
            const isOKApp = /OKApp/i.test(ua)

            if (isOKApp) {
              connectWallet(wallet)
              setQrCode(undefined)
            } else {
              window.open(wallet.deepLink)
            }

            break
          }
          case WalletIds.tokenpocket: {
            if (window.tokenpocket) {
              connectWallet(wallet)
              setQrCode(undefined)
            } else {
              window.location.href = wallet.deepLink ?? ''

              const clearTimers = () => {
                clearInterval(check)
                clearTimeout(timer)
              }

              const isHideWeb = () => {
                if (
                  ('webkitHidden' in document && document.webkitHidden) ||
                  ('hidden' in document && document.hidden)
                ) {
                  clearTimers()
                }
              }

              const check = setInterval(isHideWeb, 10)
              const redirectStore = () => {
                // eslint-disable-next-line
                if (window.confirm(t('Would you like to proceed to the app installation page?'))) {
                  window.open(wallet.downloadLink || '')
                }
              }

              const timer = setTimeout(redirectStore, 1_000)
            }
            break
          }
          case WalletIds.metamask: {
            if (window.ethereum) {
              connectWallet(wallet)
              setQrCode(undefined)
            } else {
              window.open(wallet.deepLink)
            }

            break
          }
          case WalletIds.kaiaWallet: {
            if (window.klaytn || window.caver) {
              connectWallet(wallet)
              setQrCode(undefined)
            } else {
              window.open(wallet.deepLink)
            }

            break
          }
          default: {
            connectWallet(wallet)
            setQrCode(undefined)
          }
        }
      } else {
        switch (wallet.id) {
          case WalletIds.tokenpocket: {
            if (window.tokenpocket) {
              connectWallet(wallet)
              setQrCode(undefined)
            } else if (wallet.qrCode) {
              connectWithQrCode(wallet)
            }

            break
          }
          case WalletIds.okxWallet: {
            if (window.okxwallet) {
              connectWallet(wallet)
              setQrCode(undefined)
            } else if (wallet.qrCode) {
              connectWithQrCode(wallet)
            }

            break
          }
          case WalletIds.klip: {
            connectWallet(wallet)
            setQrCode(undefined)

            if (wallet.qrCode) {
              wallet.qrCode().then(
                ([uri, _requestKey]) => {
                  setQrCode(uri)
                  requestKeyRef.current = _requestKey
                },
                () => {
                  // do nothing.
                },
              )
            }

            break
          }
          default: {
            connectWallet(wallet)
            setQrCode(undefined)
          }
        }
      }
    },
    [connectWallet, setQrCode, setSelected, t, connectWithQrCode, setError],
  )

  const { width } = useWindowSize()

  return (
    <Modal title={t('Connect Wallet')} onDismiss={onDismissHandler} {...rest}>
      {!(qrCode && selected) && (
        <p className="text-sm text-on-surface">
          {t(
            'Start by connecting with one of the wallets below. Be sure to store your private keys or seed phrase securely. Never share them with anyone.',
          )}
        </p>
      )}

      {qrCode && selected ? (
        <div className="flex flex-col items-center space-y-4">
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
            onClick={init}
          >
            {t('Cancel')}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col space-y-1 max-h-[300px] md:max-h-[80vh] overflow-y-auto">
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
                onClick={() => walletOnClick(wallet)}
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

                {wallet.installed === false && wallet.downloadLink ? (
                  <Badge title={t('not installed')} type="notInstalled" />
                ) : recentlyConnectedWalletIds.includes(wallet.id) ? (
                  <Badge title={width < 450 ? t('recently') : t('recently connected')} type="recentlyConnected" />
                ) : null}
              </button>
            )
          })}
        </div>
      )}

      <p
        className={clsx('text-sm text-on-surface mt-4', {
          hidden: qrCode && selected,
        })}
      >
        <Trans
          i18nKey="wallet-connect-terms"
          t={t}
          components={{
            href: (
              <a
                href={i18n.language === 'ko' ? '/ko/terms' : '/terms'}
                className="font-bold underline underline-offset-2 hover:opacity-70"
                target="_blank"
                rel="noreferrer noopener"
              >
                {t('Terms Of Service')}
              </a>
            ),
          }}
        />
      </p>

      <p
        className={clsx('text-sm text-red-400 mt-2', {
          hidden: !error,
        })}
      >
        {error}
      </p>
    </Modal>
  )
}

function Badge({ title, type }: { title: string; type: 'notInstalled' | 'recentlyConnected' }) {
  return (
    <span
      className={clsx('px-1.5 py-0.5 rounded-md bg-transparent border text-xs ml-1', {
        'text-red-400 border-red-400': type === 'notInstalled',
        'text-brand border-brand': type === 'recentlyConnected',
      })}
    >
      {title}
    </span>
  )
}

const getDesktopLink = (linkDevice: LinkOfDevice) =>
  typeof linkDevice === 'string'
    ? linkDevice
    : typeof linkDevice.desktop === 'string'
    ? linkDevice.desktop
    : linkDevice.desktop?.url
