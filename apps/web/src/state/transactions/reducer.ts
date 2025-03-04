/* eslint-disable no-param-reassign */
import { Order } from '@gelatonetwork/limit-orders-lib'
import { createReducer } from '@reduxjs/toolkit'
import { LOCAL_STORAGE_KEYS } from 'defines/local-storage-keys'
import { confirmOrderCancellation, confirmOrderSubmission, saveOrder } from 'utils/localStorageOrders'
import { Hash } from 'viem'
import { resetUserState } from '../global/actions'
import {
  addTransaction,
  checkedTransaction,
  clearAllChainTransactions,
  clearAllTransactions,
  finalizeTransaction,
  NonBscFarmTransactionType,
  SerializableTransactionReceipt,
  TransactionType,
} from './actions'

const now = () => Date.now()

export interface TransactionDetails {
  hash: Hash
  approval?: { tokenAddress: string; spender: string }
  type?: TransactionType
  order?: Order
  summary?: string
  translatableSummary?: { text: string; data?: Record<string, string | number | undefined> }
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  nonBscFarm?: NonBscFarmTransactionType
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export type TransactionLsMap = Record<string, Record<TransactionType, TransactionDetails[]>>

export const initialState: TransactionState = {}
const MAX_TXS = 30

export default createReducer(initialState, (builder) =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        { payload: { chainId, from, hash, approval, summary, translatableSummary, claim, type, order } },
      ) => {
        if (transactions[chainId]?.[hash]) {
          throw Error('Attempted to add existing transaction.')
        }
        const txs = transactions[chainId] ?? {}
        txs[hash as Hash] = {
          hash: hash as Hash,
          approval,
          summary,
          translatableSummary,
          claim,
          from,
          addedTime: now(),
          type,
          order,
        }

        transactions[chainId] = txs

        if (type) {
          // use localstorage to remove redux persist dependency
          const recentTransactions = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEYS.recentTransactions) ?? '{}',
          ) as TransactionLsMap

          const loweredAccount = from.toLowerCase()

          const filteredTxs =
            recentTransactions[loweredAccount]?.[type]?.filter((tx: TransactionDetails) => tx.hash !== hash) ?? []

          const withNewTxs = [txs[hash], ...filteredTxs].slice(0, MAX_TXS)
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.recentTransactions,
            JSON.stringify({
              ...recentTransactions,
              [loweredAccount]: {
                ...recentTransactions[loweredAccount],
                [type]: withNewTxs,
              },
            }),
          )
        }

        if (order) saveOrder(chainId, from, order, true)
      },
    )
    .addCase(clearAllTransactions, () => {
      return {}
    })
    .addCase(clearAllChainTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, from, type, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()

      // use localstorage to remove redux persist dependency
      const loweredAccount = from.toLowerCase()
      const recentTransactions = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.recentTransactions) ?? '{}',
      ) as TransactionLsMap

      const filteredTx = recentTransactions[loweredAccount]?.[type]?.find(
        (_tx: TransactionDetails) => _tx.hash === hash,
      )
      if (filteredTx) {
        filteredTx.receipt = receipt
        filteredTx.confirmedTime = now()

        const txs = recentTransactions[loweredAccount][type]
        const txIndex = txs.findIndex((_tx: TransactionDetails) => _tx.hash === hash)
        const withUpdatedTx = [...txs.slice(0, txIndex), filteredTx, ...txs.slice(txIndex + 1)].slice(0, MAX_TXS)
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.recentTransactions,
          JSON.stringify({
            ...recentTransactions,
            [loweredAccount]: {
              ...recentTransactions[loweredAccount],
              [type]: withUpdatedTx,
            },
          }),
        )
      }

      if (tx.type === 'limit-order-submission') {
        confirmOrderSubmission(chainId, receipt.from, hash, receipt.status !== 0)
      } else if (tx.type === 'limit-order-cancellation') {
        confirmOrderCancellation(chainId, receipt.from, hash, receipt.status !== 0)
      }
    })
    .addCase(resetUserState, (transactions, { payload: { chainId, newChainId } }) => {
      if (!newChainId && transactions[chainId]) {
        transactions[chainId] = {}
      }
    }),
)
