import {
  ProviderRpcError,
  UserRejectedRequestError,
  WalletClientConfig,
  createWalletClient,
  custom,
  getAddress,
  type Chain,
} from 'viem'
import { Connector } from 'wagmi/connectors'
import KlipProvider, { KlipProviderOptions } from './interface'

export class KlipConnector extends Connector<KlipProvider, { chainId: number }> {
  readonly id = 'klip'

  readonly name = 'klip'

  readonly ready = false

  #provider?: KlipProvider

  constructor(config: { chains?: Chain[]; options: KlipProviderOptions }) {
    super({
      ...config,
      options: {
        ...config.options,
      },
    })
  }

  // eslint-disable-next-line no-empty-pattern
  async connect({}) {
    try {
      const provider = await this.getProvider()

      this.#setupListeners()

      const accounts = await provider?.enable()

      const account = accounts[0][0]

      const id = await this.getChainId()
      const unsupported = this.isChainUnsupported(id)

      return {
        account,
        chain: { id, unsupported },
      }
    } catch (error) {
      if (/user rejected/i.test((error as ProviderRpcError)?.message)) {
        throw new UserRejectedRequestError(error as Error)
      }
      throw error
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected override isChainUnsupported(chainId: number): boolean {
    return chainId !== 8217
  }

  async disconnect() {
    this.#removeListeners()
  }

  async getAccount() {
    const provider = await this.getProvider()
    const accounts = await provider?.request<string[]>({
      method: 'eth_accounts',
    })

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    return getAddress(accounts?.[0] as string)
  }

  async getChainId() {
    const provider = await this.getProvider()
    const chainId = provider?.chainId

    return Number(chainId)
  }

  async getProvider() {
    if (!this.#provider) {
      this.#provider = new KlipProvider({ ...this.options })
    }

    return this.#provider
  }

  // @ts-ignore
  async getWalletClient(config?: { chainId?: number }) {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()])
    const chain = this.chains.find((x) => x.id === config?.chainId)

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
      const account = await this.getAccount()

      return Boolean(account)
    } catch {
      return false
    }
  }

  #setupListeners() {
    if (!this.#provider) {
      return
    }

    this.#provider.on('accountsChanged', this.onAccountsChanged)
    this.#provider.on('chainChanged', this.onChainChanged)
    this.#provider.on('disconnect', this.onDisconnect)
    this.#provider.on('session_delete', this.onDisconnect)
    this.#provider.on('connect', this.onConnect)
  }

  #removeListeners() {
    if (!this.#provider) {
      return
    }
    this.#provider.removeListener('accountsChanged', this.onAccountsChanged)
    this.#provider.removeListener('chainChanged', this.onChainChanged)
    this.#provider.removeListener('disconnect', this.onDisconnect)
    this.#provider.removeListener('session_delete', this.onDisconnect)
    this.#provider.removeListener('connect', this.onConnect)
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      this.emit('disconnect')
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.emit('change', { account: getAddress(accounts[0]!) } as any)
    }
  }

  protected onChainChanged = (chainId: number | string) => {
    const id = Number(chainId)
    const unsupported = this.isChainUnsupported(id)
    this.emit('change', { chain: { id, unsupported } } as any)
  }

  protected onDisconnect = () => {
    this.emit('disconnect')
  }

  protected onConnect = () => {
    this.emit('connect', {} as any)
  }
}
