// @ts-ignore
import {
  Address,
  EIP1193Provider,
  ProviderRpcError,
  ResourceUnavailableRpcError,
  createWalletClient,
  custom,
  numberToHex,
  type WalletClient,
  type WalletClientConfig,
} from 'viem'

import { type Chain } from 'viem/chains'
import { Connector } from 'wagmi/connectors'
import { InjectedProviders } from 'wagmi/window'

declare global {
  interface Window {
    klaytn: any
    caver: any
  }
}

interface WindowProvider extends InjectedProviders, EIP1193Provider {
  providers?: WindowProvider[]
}

// @ts-ignore
export class KaikasConnector extends Connector<WindowProvider | undefined, any> {
  readonly id: string = 'kaikas'

  readonly name: string = 'Kaikas Wallet'

  readonly ready: boolean

  // Rome-ignore lint/correctness/noUnreachableSuper: <explanation>
  constructor({
    chains,
    options: options_,
  }: {
    chains?: Chain[]
    options?: any
  } = {}) {
    const options = {
      ...options_,
    }
    super({ chains, options })

    const provider = this.getProvider()

    this.ready = !!provider
  }

  async connect(_: { chainId?: number } = {}) {
    try {
      let account = []
      let id = 0

      const provider = await this.getProvider()

      if (provider.on) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider.on('accountsChanged', this.onAccountsChanged)
        provider.on('networkChanged', this.onChainChanged)
        provider.on('disconnected', this.onAccountsChanged)
      }

      if (typeof window.klaytn !== 'undefined') {
        // Kaikas user detected. You can now use the provider.
        account = await window.klaytn.enable()
        id = window.klaytn.networkVersion
      }

      return { account: account[0], chain: { id, unsupported: false } }
    } catch (error) {
      if ((error as ProviderRpcError).code === -32002) {
        throw new ResourceUnavailableRpcError(error as ProviderRpcError)
      }

      throw error
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getProvider() {
    return typeof window !== 'undefined' && (window?.caver?.currentProvider || window?.klaytn)
  }

  async disconnect() {
    const provider = await this.getProvider()
    if (!provider?.removeListener) {
      return
    }

    provider.removeListener('accountsChanged', this.onAccountsChanged)
    provider.removeListener('chainChanged', this.onChainChanged)
    provider.removeListener('disconnect', this.onDisconnect)
  }

  async getAccount() {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('connector not found error.')
    }

    const accounts = await window.caver.klay.getAccounts()
    return accounts[0]
  }

  async getChainId() {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('connector not found error.')
    }

    const chainId = await window.caver.klay.getId()
    return chainId
  }

  // @ts-ignore
  async getWalletClient(config?: { chainId?: number }): Promise<WalletClient> {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()])
    // @ts-ignore
    const chain = this.chains.find((x: { id: number | undefined }) => x.id === config?.chainId)

    if (!provider) {
      throw new Error('provider is required.')
    }

    // @ts-ignore
    return createWalletClient({
      // @ts-ignore
      account,
      chain,
      transport: custom(provider as any),
    } as WalletClientConfig)
  }

  async isAuthorized() {
    try {
      const provider = await this.getProvider()
      if (!provider) {
        throw new Error('Connector not founded')
      }
      const account = await this.getAccount()

      return Boolean(account)
    } catch {
      return false
    }
  }

  async watchAsset({
    address,
    decimals = 18,
    image,
    symbol,
  }: {
    address: Address
    decimals?: number
    image?: string
    symbol: string
  }) {
    const provider = await this.getProvider()
    if (!provider) throw new Error('Connector not founded')
    return provider.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          decimals,
          image,
          symbol,
        },
      },
    })
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      this.emit('disconnect')
    } else {
      this.emit('change', {
        account: accounts[0],
      } as any)
    }
  }

  protected onChainChanged = (chainId: number | string) => {
    const id = Number(chainId)
    const unsupported = this.isChainUnsupported(id)
    this.emit('change', { chain: { id, unsupported } } as any)
  }

  // eslint-disable-next-line class-methods-use-this
  protected override isChainUnsupported(chainId: number): boolean {
    return chainId !== 8217 && chainId !== 1001
  }

  protected onDisconnect = async (error: Error) => {
    if ((error as ProviderRpcError).code === 1013) {
      const provider = await this.getProvider()
      if (provider) {
        const isAuthorized = await this.getAccount()
        if (isAuthorized) {
          return
        }
      }
    }
    this.emit('disconnect')
  }

  // @ts-ignore
  // eslint-disable-next-line consistent-return
  protected switchChain = async (chainId: number) => {
    const provider = await this.getProvider()
    if (!provider) throw new Error('Connector not founded')
    const id = numberToHex(chainId)

    try {
      await Promise.all([
        provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: id }],
        }),
        new Promise<void>((res) =>
          this.on('change', ({ chain }) => {
            if (chain?.id === chainId) res()
          }),
        ),
      ])
      return (
        this.chains.find((x) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { name: 'Klay', decimals: 18, symbol: 'Klay' },
          rpcUrls: { default: { http: [''] }, public: { http: [''] } },
        }
      )
    } catch (error) {
      const chain = this.chains.find((x) => x.id === chainId)
      if (!chain) throw new Error('Chain not support this Connector')

      // Indicates chain is not added to provider
      if (
        (error as ProviderRpcError).code === 4902 ||
        // Unwrapping for MetaMask Mobile
        // https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719
        (error as ProviderRpcError<{ originalError?: { code: number } }>)?.data?.originalError?.code === 4902
      ) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: id,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls.public?.http[0] ?? ''],
                blockExplorerUrls: this.getBlockExplorerUrls(chain),
              },
            ],
          })

          const currentChainId = await this.getChainId()
          if (currentChainId !== chainId) throw new Error('User rejected switch after adding network.')

          return chain
        } catch (err) {
          throw new Error(err as string)
        }
      }
    }
  }

  // protected isUserRejectedRequestError(error: unknown) {
  //   return (error as ProviderRpcError).code === 4001
  // }
}
