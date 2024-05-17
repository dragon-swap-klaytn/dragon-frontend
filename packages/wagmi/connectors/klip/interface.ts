// @ts-ignore
import { HttpConnection, JsonRpcProvider } from '@json-rpc-tools/provider'
// @ts-ignore
import { IEthereumProvider, RequestArguments } from 'eip1193-provider'
// @ts-ignore
import EventEmitter from 'eventemitter3'
// @ts-ignore
// eslint-disable-next-line lodash/import-scope
import cloneDeep from 'lodash.clonedeep'
// @ts-ignore
import Web3Utils from 'web3-utils'
// @ts-ignore
import platform from 'platform'
// @ts-ignore
import { getResult, prepare, request } from './customSdk.js'

const isSameStr = (a: string, b: string) => {
  return a === b || a.toLowerCase() === b.toLowerCase() || a.toUpperCase() === b.toUpperCase()
}

const isMobile = (): boolean => {
  const os = platform.os.family

  return isSameStr(os, 'IOS') || isSameStr(os, 'ANDROID')
}

const WalletErrors = {
  NOT_INSTALLED: 'not_installed',
  INTERNAL_ERROR: 'internal_error',
  POLLING_TIMEOUT: 'polling_timeout',
  INVALID_BODY: 'invalid_body',
  INVALID_PREPARE_TYPE: 'invalid_prepareType',
  UNSUPPORTED_METHOD: 'unsupported_method',
  EMPTY_ADDRESS: 'empty_address',
}

const mergeEmitterProp = (obj: any) => {
  const emitter: any = new EventEmitter()
  // eslint-disable-next-line no-return-assign, no-proto, no-param-reassign, no-sequences
  Object.entries(emitter.__proto__).reduce((acc, [k, v]) => ((acc[k] = v), acc), obj)

  // eslint-disable-next-line no-param-reassign
  obj._events = emitter._events
  // eslint-disable-next-line no-param-reassign
  obj._eventsCount = emitter._eventsCount
  return obj
}

export function PromiEvent(promiseOnly: any): any {
  let resolve
  let reject
  const promiseInstance = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  const eventEmitter = promiseOnly ? promiseInstance : mergeEmitterProp(promiseInstance)

  return {
    resolve,
    reject,
    eventEmitter,
  }
}

PromiEvent.resolve = function (value: any) {
  const promise = PromiEvent(true) // promiseOnly
  promise.resolve(value)
  return promise.eventEmitter
}

export const initPromiseEvent = () => {
  const _promiseEvent = PromiEvent(false)
  const { eventEmitter, resolve } = _promiseEvent

  eventEmitter.on('__update', (params: any) => {
    eventEmitter.emit(params._event, params.data)
  })

  eventEmitter.on('__finished', resolve)

  return {
    emitter: eventEmitter,
    update(eventParams: any) {
      eventEmitter.emit('__update', eventParams)
    },
    finish(eventParams: any) {
      eventEmitter.emit('__finished', eventParams)
    },
    error(error: Error, willThrow: boolean = false) {
      if (!willThrow) {
        this.finish({
          success: false,
          error,
        })
      }

      eventEmitter.emit('error', error)
    },
    displayQr(qrUri: string) {
      eventEmitter.emit('display_uri', qrUri)
    },
    receipt(receipt: any) {
      // this.finish({
      //     success: receipt.status,
      //     data: receipt,
      // });
      eventEmitter.emit('receipt', receipt)
    },
    txHash(txHash: string) {
      this.finish(txHash)
      eventEmitter.emit('transactionHash', txHash)
    },
  }
}

export const signerMethods = [
  'eth_requestAccounts',
  'eth_accounts',
  'eth_chainId',
  'eth_sendTransaction',
  'eth_sign',
  'personal_sign',
  'klay_requestAccounts',
  'klay_accounts',
  'klay_chainId',
  'klay_sendTransaction',
  'klay_sign',
]

export interface EthereumRpcConfig {
  infuraId?: string
  custom?: {
    [chainId: number]: string
  }
}

export interface KlipTxParams {
  eventName: string
  body: any
}

export interface Receipt {
  blockNumber: number
  blockHash: string
  transactionHash: string

  from: string
  to: string
  value: string

  status?: boolean
}

export function getRpcUrl(chainId: number, rpc?: EthereumRpcConfig): string | undefined {
  let rpcUrl: string | undefined

  if (rpc && rpc.custom) {
    rpcUrl = rpc.custom[chainId]
  }

  return rpcUrl
}

export function filterValidArgs(args: RequestArguments): RequestArguments {
  const newParams: unknown[] = []

  if (args.params && Array.isArray(args.params)) {
    for (let i = 0; i < args.params.length; i++) {
      const param: any = args.params[i]
      const newParam: any = cloneDeep(param)

      if (typeof param === 'object') {
        for (const key in param) {
          if (param[key] !== null && param[key] !== undefined) {
            newParam[key] = param[key]
          }
        }

        newParams.push(newParam)
      } else {
        newParams.push(newParam)
      }
    }
  }

  return {
    method: args.method,
    params: newParams,
  }
}

export interface KlipProviderOptions {
  chainId: number
  methods?: string[]
  rpc?: EthereumRpcConfig
  others?: any
}

export interface KlipTxRequest {
  from: string
  to: string
  method: string
  data?: string
  value: string | number
  abi?: string
  params?: string
  klipOptions?: KlipTxParams
}

export interface KlipSignRequest {
  from: string
  message: string
}

export const KLIP_TIMEOUT = 5 * 60 * 1000

class KlipProvider implements IEthereumProvider {
  public events: any = new EventEmitter()

  private rpc: EthereumRpcConfig | undefined

  public chainId = 8217

  public methods = signerMethods

  public accounts: string[] = []

  public http: JsonRpcProvider | undefined

  public maxPollingCount: number

  public selectedAccount: string | null

  public siteName: string

  public displayQR?: (url: string, expireTime: number, onExpired: () => void, providerId: string) => void

  public dismissQR?: () => void

  public isKlip: boolean = true

  public timeout: number = KLIP_TIMEOUT

  private isRequestEnable = false

  constructor(opts?: KlipProviderOptions) {
    this.rpc = opts?.rpc
    this.chainId = opts?.chainId || this.chainId
    this.methods = opts?.methods ? [...opts?.methods, ...this.methods] : this.methods
    this.http = this.setProvider(this.chainId)
    this.maxPollingCount = 60 * 5
    this.selectedAccount = null

    this.siteName = opts?.others?.siteName ?? ''
    this.displayQR = opts?.others?.displayQR
    this.dismissQR = opts?.others?.dismissQR

    this.registerEventListeners()
  }

  public async send(args: RequestArguments): Promise<any> {
    return this.request(filterValidArgs(args))
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public sendAsync(args: RequestArguments & { id?: number }, callback: Function): void {
    this.request(filterValidArgs(args))
      .then((res: any) => {
        if (res.error) {
          throw new Error(res.error)
        }

        if (callback) {
          callback(null, {
            id: args.id ?? 1,
            jsonrpc: '2.0',
            result: res,
          })
        }
      })
      .catch((error: Error) => {
        callback(
          {
            id: args.id ?? 1,
            jsonrpc: '2.0',
            error,
          },
          null,
        )
      })
  }

  public async request<T = unknown>(args: RequestArguments): Promise<T> {
    switch (args.method) {
      case 'eth_requestAccounts':
      case 'klay_requestAccounts':
        await this.enable()
        return this.accounts as any
      case 'eth_accounts':
      case 'klay_accounts':
        return this.accounts as any
      case 'eth_chainId':
      case 'klay_chainId':
        return this.chainId as any
      case 'eth_sendTransaction':
      case 'klay_sendTransaction':
        // eslint-disable-next-line no-case-declarations
        const params = (args.params || []) as unknown[]
        return (await this._sendKlipTx(params?.[0] as KlipTxRequest, params?.[1])) as any
      case 'eth_sign':
      case 'klay_sign':
      case 'personal_sign':
        return (await this._sendKlipSignRequest(
          ((args.params as string[]) || [])[0],
          ((args.params as string[]) || [])?.[1],
        )) as any
      default:
        break
    }

    if (typeof this.http === 'undefined') {
      throw new Error(`Cannot request JSON-RPC method (${args.method}) without provided rpc url`)
    }

    return this.http.request(args)
  }

  public enable(): Promise<any> {
    const eventBus = initPromiseEvent()

    if (this.isRequestEnable) {
      return eventBus.emitter
    }

    const prevAccount = localStorage.getItem('address') ?? ''

    // if address cached
    if (localStorage.getItem('wallet') === 'Klip' && prevAccount !== '') {
      this.accounts = [localStorage.getItem('address') ?? '']
      eventBus.finish([this.accounts])
    } else {
      this.isRequestEnable = true
      this._connect(eventBus).then((res: any) => {
        if (!res.success) {
          return eventBus.error(res.error, true)
        }

        this.isRequestEnable = false
        return eventBus.finish([this.accounts])
      })
    }

    return eventBus.emitter
  }

  public async disconnect(): Promise<any> {
    this.accounts = []
  }

  public on(event: any, listener: any): void {
    this.events.on(event, listener)
  }

  public once(event: string, listener: any): void {
    this.events.once(event, listener)
  }

  public removeListener(event: string, listener: any): void {
    this.events.removeListener(event, listener)
  }

  public off(event: string, listener: any): void {
    this.events.off(event, listener)
  }

  // ---------- Klip Original ----------------------------------------------- //
  // @ts-ignore
  private cancel(requestKey: string) {
    this.events.emit('cancelRequest', requestKey)
  }

  private async _connect(eventBus: any): Promise<any> {
    const prepareResult = await this._prepare('auth', {})

    if (!prepareResult.success) {
      return prepareResult
    }

    const pollingResult = await this._handleAfterPrepare(prepareResult, eventBus)

    if (!pollingResult.success) {
      return pollingResult
    }

    // eslint-disable-next-line camelcase
    const { klaytn_address } = pollingResult.data.result

    // eslint-disable-next-line camelcase
    this.accounts = [klaytn_address]
    this.selectedAccount = this.accounts[0]

    return {
      success: true,
      data: {
        account: this.accounts,
      },
    }
  }

  private async _prepare(type: string, body: object): Promise<any> {
    const siteName: string | Element | { content: string } = this.siteName || { content: '' }?.content || 'dpt'

    const res = await prepare[type]({
      type,
      ...body,
      bappName: siteName,
    })
      // eslint-disable-next-line @typescript-eslint/no-shadow
      .then((res: any) => {
        if (res.err) {
          throw res
        }

        return {
          status: 200,
          data: res,
        }
      })
      .catch((error: Error) => ({
        status: -1,
        error,
      }))

    if (res.status !== 200 || !res.data) {
      return {
        success: false,
        error: res.error,
      }
    }

    // eslint-disable-next-line camelcase
    const { request_key, status, expiration_time } = res.data

    // eslint-disable-next-line camelcase
    if ([request_key, status, expiration_time].includes(null)) {
      return {
        success: false,
        error: new Error(WalletErrors.INTERNAL_ERROR),
      }
    }

    return {
      success: true,
      data: {
        type,
        // eslint-disable-next-line camelcase
        requestKey: request_key,
        status,
        // eslint-disable-next-line camelcase
        expirationTime: expiration_time,
      },
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private async _pollingGetResult(requestKey: string, callback: Function): Promise<any> {
    return new Promise((resolve) => {
      let currentIndex = 0

      const polling = setInterval(async () => {
        if (currentIndex > this.maxPollingCount) {
          clearInterval(polling)
          resolve({
            success: false,
            error: new Error(WalletErrors.POLLING_TIMEOUT),
          })
        }

        const res = await getResult(requestKey)

        if (res && res.request_key === requestKey) {
          if (res.status === 'error') {
            clearInterval(polling)
            resolve({
              success: false,
              error: res.error,
            })
          }

          if (res.status === 'completed') {
            clearInterval(polling)
            resolve({
              success: true,
              data: res,
            })
          }

          if (res.status === 'canceled') {
            clearInterval(polling)
            resolve({
              success: false,
              error: new Error('user_canceled'),
            })
          }

          if (res.status === 'prepared') {
            currentIndex++
            return
          }
        }

        // eslint-disable-next-line no-unused-expressions
        callback && callback({ currentIndex, res })

        currentIndex++
      }, 1000)

      const onCancelRequest = (_requestKey: string) => {
        if (_requestKey !== requestKey) {
          return
        }

        clearInterval(polling)
        this.events.off('cancelRequest', onCancelRequest)

        resolve({
          success: false,
          error: new Error('request_canceled'),
        })
      }

      this.events.on('cancelRequest', onCancelRequest)
    })
  }

  private async _handleAfterPrepare(prepareResult: any, eventBus: any): Promise<any> {
    if (!prepareResult.success) {
      eventBus.error(prepareResult.error)
      return prepareResult
    }

    const { requestKey, expirationTime } = prepareResult.data

    eventBus.update({
      _event: 'requestKey',
      data: requestKey,
    })

    this._requestKlip(requestKey, expirationTime)
    this.events.emit('requestKey', requestKey)

    const pollingResult = await this._pollingGetResult(requestKey, (params: any) => {
      eventBus.update({
        _event: 'polling',
        data: params,
      })
    })

    if (this.dismissQR) {
      this.dismissQR()
    } else {
      try {
        // @ts-ignore
        // ;(global as any).updateWeb3ModalSessionPopup(false)
      } catch (e) {
        /* empty */
      }
    }

    return pollingResult
  }

  private _requestKlip(requestKey: string, expirationTime: number) {
    const qrUrl = `https://klipwallet.com/?target=a2a?request_key=${requestKey}`

    if (isMobile()) {
      request(requestKey)
    } else if (this.displayQR) {
      this.displayQR(qrUrl, expirationTime * 1000, this.disconnect, 'klip')
    } else {
      this.events.emit('display_uri', qrUrl)
      // @ts-ignore
      //   ;(global as any).updateWeb3ModalSessionPopup(true, {
      //     expireTime: expirationTime * 1000,
      //     url: qrUrl,
      //     provider: 'Klip',
      //     onExpired: () => {
      //       this.disconnect()
      //     },
      //   })
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private _getAvailablePrepareType(): string[] {
    return Object.keys(prepare)
  }

  private _sendKlipSignRequest(signer?: string, message?: string): Promise<string> {
    const eventBus = initPromiseEvent()

    if (!(message && signer)) {
      setTimeout(() => {
        eventBus.error(new Error(WalletErrors.INVALID_BODY))
      }, 500)

      return eventBus.emitter
    }

    const messageToSign = Web3Utils.isHex(message) ? Web3Utils.hexToUtf8(message) : message
    const eventName = 'signMessage'

    const body = {
      value: messageToSign,
      from: signer,
    }

    try {
      // eslint-disable-next-line consistent-return
      this._prepare(eventName, body).then(async (prepareResult) => {
        try {
          const pollingResult = await this._handleAfterPrepare(prepareResult, eventBus)

          if (pollingResult.status === 'canceled') {
            return eventBus.error(new Error('User Rejected Authentication'), true)
          }

          if (!pollingResult.success) {
            return eventBus.error(new Error(pollingResult.error), true)
          }

          if (pollingResult.success) {
            eventBus.finish(pollingResult.data.result.signature)
            return pollingResult.data.result.signature
          }
        } catch (e) {
          eventBus.error(e as Error)
        }
      })
    } catch (e) {
      eventBus.error(e as Error)
    }

    return eventBus.emitter
  }

  private _sendKlipTx(tx: KlipTxRequest, _eventBus: any) {
    const eventBus = _eventBus || initPromiseEvent()
    const types = this._getAvailablePrepareType()

    const isValidValue = (val?: string | number) => {
      return val && Number(val)
    }
    const eventName =
      tx.data && tx.data !== '0x' ? 'executeContract' : isValidValue(tx.value) ? 'sendKLAY' : 'sendToken'

    // eslint-disable-next-line no-param-reassign
    tx.value = Web3Utils.isHexStrict(tx.value) ? Web3Utils.hexToNumberString(tx.value) : tx.value

    if (eventName === 'sendKLAY') {
      // eslint-disable-next-line no-param-reassign
      tx.value = Web3Utils.fromWei(String(tx.value))
    }

    const klipOptions = tx.klipOptions || {
      eventName,
      body: {
        amount: tx.value,
        method: {
          abi: tx.abi,
          params: tx.params,
        },
      },
    }

    if (this.isRequestEnable) {
      return eventBus.emitter
    }

    if (!klipOptions.body) {
      setTimeout(() => {
        eventBus.error(new Error(WalletErrors.INVALID_BODY))
      }, 500)

      return eventBus.emitter
    }

    if (!klipOptions.eventName || !types.find((type: string) => type === klipOptions.eventName)) {
      setTimeout(() => {
        eventBus.error(new Error(WalletErrors.INVALID_PREPARE_TYPE))
      }, 500)

      return eventBus.emitter
    }

    const txParams = klipOptions.body
    const requestBody: any = {
      from: tx.from,
      to: tx.to,
      amount: txParams.amount,
    }

    if (klipOptions.eventName === 'sendToken') {
      requestBody.amount = txParams.method.amount
      requestBody.contract = txParams.method.contract
    }

    if (klipOptions.eventName === 'executeContract') {
      delete requestBody.amount

      requestBody.value = txParams.amount
      requestBody.abi = txParams.method.abi
      requestBody.params = txParams.method.params
      requestBody.encoded_function_call = tx.data
    }

    this.isRequestEnable = true

    // eslint-disable-next-line consistent-return
    this._prepare(klipOptions.eventName, requestBody)
      .then(async (prepareResult) => {
        const pollingResult = await this._handleAfterPrepare(prepareResult, eventBus)

        if (pollingResult.status === 'canceled') {
          return eventBus.error(new Error('User Rejected Transaction'), true)
        }

        if (!pollingResult.success) {
          return eventBus.error(new Error(pollingResult.error), true)
        }

        if (pollingResult.success) {
          const txHash = pollingResult.data.result.tx_hash

          eventBus.txHash(txHash)

          // @ts-ignore
          this.http
            .request({
              method: 'klay_getTransactionReceipt',
              params: [txHash],
            })
            .then((receipt: Receipt) => {
              eventBus.receipt(receipt)
            })
            .catch((error: Error) => {
              eventBus.error(error, true)
            })
        }
      })
      .finally(() => {
        this.isRequestEnable = false
      })

    return eventBus.emitter
  }

  // @ts-ignore
  setAccounts(accounts: string[]) {
    this.accounts = accounts.filter((x) => x.split('@')[1] === `eip155:${this.chainId}`).map((x) => x.split('@')[0])
    this.events.emit('accountsChanged', this.accounts)
  }

  // ---------- Private ----------------------------------------------- //

  private registerEventListeners() {
    this.events.on('chainChanged', (chainId: number) => this.setProvider(chainId))
  }

  private setProvider(chainId: number): JsonRpcProvider | undefined {
    const rpcUrl = getRpcUrl(chainId, this.rpc)
    if (typeof rpcUrl === 'undefined') return undefined
    this.http = new JsonRpcProvider(new HttpConnection(rpcUrl))
    return this.http
  }

  // @ts-ignore
  private setChainId(chains: string[]) {
    const compatible = chains.filter((x) => x.startsWith('eip155'))
    if (compatible.length) {
      this.chainId = Number(compatible[0].split(':')[1])
      this.events.emit('chainChanged', this.chainId)
    }
  }
}

export default KlipProvider
