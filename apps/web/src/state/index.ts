import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistStore } from 'redux-persist'
import farmsReducer from './farms'
import { updateVersion } from './global/actions'
import globalReducer from './global/reducer'
import notifications from './notifications/reducer'
import poolsReducer from './pools'
import transactions from './transactions/reducer'
import user from './user/reducer'

// eslint-disable-next-line import/no-mutable-exports
let store: ReturnType<typeof makeStore>

const rootReducer = combineReducers({
  global: globalReducer,
  farms: farmsReducer,
  pools: poolsReducer,
  user,
  transactions,
  notifications,
})

export function makeStore(preloadedState = undefined) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: process.env.NODE_ENV === 'development',
    preloadedState,
  })
}

export const initializeStore = (preloadedState: any = undefined) => {
  let _store = store ?? makeStore(preloadedState)

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = makeStore({
      ...store.getState(),
      ...preloadedState,
    })
    // Reset the current store
    store = undefined as any
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store

  // Create the store once in the client
  if (!store) {
    store = _store
  }

  return _store
}

store = initializeStore()

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>
export const useAppDispatch = () => useDispatch<AppDispatch>()

export default store

export const persistor = persistStore(store, undefined, () => {
  store.dispatch(updateVersion())
})

export function useStore(initialState) {
  return useMemo(() => initializeStore(initialState), [initialState])
}
