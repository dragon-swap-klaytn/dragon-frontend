// @ts-ignore
import type { WalletProvider } from '@linenext/dapp-portal-sdk'
import {
  Address,
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

const KAIA_CHAINS = [1001, 8217]

// @ts-ignore
export class UnifiWalletConnector extends Connector<WalletProvider | undefined, any> {
  readonly id: string = 'unifiwallet'

  readonly name: string = 'UnifiWallet'

  readonly ready: boolean = true

  private walletProvider: WalletProvider | undefined = undefined

  private walletClient: WalletClient | undefined = undefined

  private account: Address | undefined = undefined

  public isSupportedBrowser: boolean = true

  private clientId: string =
    process.env.NEXT_PUBLIC_UNIFI_CLIENT_ID ||
    process.env.NEXT_PUBLIC_DAPP_PORTAL_CLIENT_ID ||
    'c7890211-c60d-4ec6-9a5c-4d58c61b312d'

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
  }

  async connect(_: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider()
      if (!provider) {
        throw new Error('Provider not found')
      }

      const chainId = await this.getChainId()
      if (!KAIA_CHAINS.includes(chainId)) {
        const chain = await this.switchChain(8217)
        if (!chain || !KAIA_CHAINS.includes(chainId)) {
          throw new Error('Chain not supported')
          // return { account: null, chain: { id: chainId, unsupported: true } }
        }
      }

      if (provider.on) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider.on('accountsChanged', (args: any) => this.onAccountsChanged(args))
        provider.on('networkChanged', (args: any) => this.onChainChanged(args))
        provider.on('disconnected', (args: any) => this.onAccountsChanged(args))
      }

      if (provider) {
        const account = await this.requestAccount()

        return { account, chain: { id: chainId, unsupported: false } }
      }

      return { account: null, chain: { id: chainId, unsupported: true } }
    } catch (error) {
      if ((error as ProviderRpcError).code === -32002) {
        throw new ResourceUnavailableRpcError(error as ProviderRpcError)
      }

      throw error
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getProvider() {
    if (!this.clientId) {
      throw new Error('Unifi client ID is not set.')
    }

    if (typeof window === 'undefined') {
      return undefined
    }

    if (this.walletProvider) {
      return this.walletProvider
    }

    try {
      const { default: UnifiSDK } = await import('@linenext/dapp-portal-sdk')

      const sdk = await UnifiSDK.init({
        chainId: '8217',
        clientId: this.clientId,
      })

      this.walletProvider = sdk.getWalletProvider()
      this.isSupportedBrowser = sdk.isSupportedBrowser()
    } catch (error) {
      console.error('Error initializing UnifiSDK:', error)
      throw new Error('UnifiSDK initialization failed')
    }

    return this.walletProvider
  }

  async disconnect() {
    const provider = (await this.getProvider()) as any
    if (!provider?.removeListener) {
      return
    }

    provider.removeListener('accountsChanged', this.onAccountsChanged)
    provider.removeListener('chainChanged', this.onChainChanged)
    provider.removeListener('disconnect', this.onDisconnect)
  }

  // Request accounts with permission (used during connection)
  async requestAccount() {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('connector not found error.')
    }

    const accounts = await provider.request({ method: 'kaia_requestAccounts' })
    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('No accounts found')
    }

    const account = accounts[0]
    this.account = account
    return account
  }

  async getAccount() {
    if (this.account) {
      return this.account
    }

    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('connector not found error.')
    }

    // Use kaia_accounts instead of kaia_requestAccounts to avoid triggering permission request
    const accounts = await provider.request({ method: 'kaia_accounts' })
    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('No accounts found')
    }

    const account = accounts[0]

    this.account = account

    return account
  }

  async getChainId() {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('connector not found error.')
    }

    // get Chain ID from provider
    const chainId = await provider.request({ method: 'kaia_chainId' }).then((id) => +String(id))
    return chainId
  }

  // @ts-ignore
  async getWalletClient(config?: { chainId?: number }): Promise<WalletClient> {
    if (this.walletClient) {
      return this.walletClient
    }

    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()])
    // @ts-ignore
    const chain = this.chains.find((x: { id: number | undefined }) => x.id === config?.chainId)

    if (!provider) {
      throw new Error('provider is required.')
    }

    const _walletClient = createWalletClient({
      // @ts-ignore
      account,
      chain,
      transport: custom(provider as any),
    } as WalletClientConfig)

    // Note: For USDT transfers/swaps via smart contract, you must include
    // `depositTokenAddress` and `depositAmount` in the transaction parameters
    // when calling `sendTransaction` or `kaia_sendTransaction`.
    // Example:
    // walletClient.sendTransaction({
    //   to: contractAddress,
    //   data: input,
    //   depositTokenAddress: '0xd07730da403d154737750808b3504a50d4023773',
    //   depositAmount: '100',
    //   ...
    // })

    this.walletClient = _walletClient

    // @ts-ignore
    return _walletClient
  }

  async isAuthorized(): Promise<boolean> {
    try {
      // Check if we already have a cached account without requesting new one
      if (this.account) {
        return true
      }

      const provider = await this.getProvider()
      if (!provider) {
        return false
      }

      // Check existing accounts without triggering permission request
      const accounts = await provider.request({ method: 'kaia_accounts' })
      return Boolean(accounts && Array.isArray(accounts) && accounts.length > 0)
    } catch {
      return false
    }
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

    this.walletProvider = undefined
    this.walletClient = undefined
    this.account = undefined

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
          nativeCurrency: { name: 'Kaia', decimals: 18, symbol: 'KAIA' },
          rpcUrls: {
            default: { http: ['https://public-en.node.kaia.io'] },
            public: { http: ['https://public-en.node.kaia.io'] },
          },
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

  async getErc20TokenBalanceWithDepositedBalance(params: {
    tokenAddress: string
    userAddress: string
  }): Promise<string> {
    const provider = await this.getProvider()
    if (!provider) throw new Error('Provider not found')
    return provider.request({
      method: 'kaia_getErc20TokenBalanceWithDepositedBalance',
      params: [params],
    }) as Promise<string>
  }
}
