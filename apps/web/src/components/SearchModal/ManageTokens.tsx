import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ERC20Token, Token } from '@pancakeswap/sdk'
import { TrashSimple } from '@phosphor-icons/react'
import Button from 'components/Common/Button'
import SearchBar from 'components/Common/SearchBar'
import { CurrencyLogo } from 'components/Logo'
import ImportRow from 'components/SearchModal/ImportRow'
import { useTokens } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { RefObject, useCallback, useMemo, useRef, useState } from 'react'
import { useRemoveUserAddedToken } from 'state/user/hooks'
import useUserAddedTokens from 'state/user/hooks/useUserAddedTokens'
import { safeGetAddress } from 'utils'
import { CurrencyModalView } from './types'

export default function ManageTokens({
  setModalView,
  setImportToken,
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
}) {
  const { chainId } = useActiveChainId()

  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const searchTokens = useTokens(debouncedQuery)

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = safeGetAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  // all tokens for local list
  const userAddedTokens: Token[] = useUserAddedTokens()
  const removeToken = useRemoveUserAddedToken()

  const handleRemoveAll = useCallback(() => {
    if (chainId && userAddedTokens) {
      userAddedTokens.forEach((token) => {
        return removeToken(chainId, token.address)
      })
    }
  }, [removeToken, userAddedTokens, chainId])

  const searchedUserAddedTokens = useMemo(() => {
    return userAddedTokens
      .filter(
        (token) =>
          (token?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((token) => ({
        ...token,
        isAdded: true,
      }))
  }, [userAddedTokens, searchQuery])

  const unimportedTokens = useMemo(() => {
    return (
      searchTokens
        ?.filter(
          (token) =>
            !userAddedTokens.find((addedToken) => addedToken.address.toLowerCase() === token.address.toLowerCase()),
        )
        .map((token) => ({
          ...token,
          isAdded: false,
        })) ?? []
    )
  }, [searchTokens, userAddedTokens])

  return (
    <div className="flex flex-col">
      <SearchBar ref={inputRef as RefObject<HTMLInputElement>} value={searchQuery} onChange={handleInput} fullWidth />

      <div className="flex flex-col items-start w-full mt-4 px-2 max-h-[400px] overflow-y-auto">
        {[...unimportedTokens, ...searchedUserAddedTokens].map((token) =>
          token.isAdded ? (
            <div key={token.address} className="flex items-center space-x-2 justify-between w-full py-2">
              <button
                type="button"
                className="flex items-center space-x-2 hover:opacity-70 w-full justify-between"
                onClick={() => removeToken(chainId, token.address)}
              >
                <div className="flex items-center space-x-2">
                  <CurrencyLogo currency={token as any} size={20} />
                  <span className="text-sm text-on-surface-primary">{token.symbol}</span>
                  <span className="text-gray-400 text-xs">{token.name}</span>
                </div>

                <TrashSimple size={16} className="text-gray-200" />
              </button>
            </div>
          ) : (
            <ImportRow
              className="w-full"
              token={new ERC20Token(chainId, token.address, token.decimals, token.symbol, token.name)}
              showImportView={() => setModalView(CurrencyModalView.importToken)}
              setImportToken={setImportToken}
              style={{ height: 'fit-content' }}
            />
          ),
        )}
      </div>

      {userAddedTokens?.length > 0 ? (
        <div className="flex items-center space-x-2 justify-between px-2 mt-4">
          <span className="text-sm text-on-surface-primary">
            {userAddedTokens?.length} {userAddedTokens.length === 1 ? t('Imported Token') : t('Imported Tokens')}
          </span>

          {userAddedTokens.length > 0 && (
            <Button variant="subtle" onClick={handleRemoveAll} scale="sm">
              {t('Clear all')}
            </Button>
          )}
        </div>
      ) : !debouncedQuery && (userAddedTokens?.length || 0) === 0 ? (
        <p className="text-center py-4">{t('No imported tokens.')}</p>
      ) : !!debouncedQuery && (searchTokens?.length || 0) === 0 ? (
        <p className="text-center py-4">{t('No results found.')}</p>
      ) : (
        <></>
      )}
    </div>
  )
}
