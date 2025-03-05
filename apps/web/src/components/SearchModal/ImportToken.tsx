import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import { ButtonV2, CheckboxV2, ExternalLink, Notification } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { Warning } from '@phosphor-icons/react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useState } from 'react'
import { useCombinedInactiveList } from 'state/lists/hooks'
import { useAddUserToken } from 'state/user/hooks'
import { useUserAddedTokenMapFromLs } from 'state/user/hooks/useUserAddedTokens'
import { getBlockExploreLink } from 'utils'

interface ImportProps {
  tokens: Token[]
  handleCurrencySelect?: (currency: Currency) => void
}

function ImportToken({ tokens, handleCurrencySelect }: ImportProps) {
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()
  const [confirmed, setConfirmed] = useState(false)
  const addToken = useAddUserToken()

  // use for showing import source on inactive tokens
  const inactiveTokenList = useCombinedInactiveList()
  const { setUserAddedTokenMap } = useUserAddedTokenMapFromLs()

  // const { data: hasRiskToken } = useQuery(
  //   ['has-risks', tokens],
  //   async () => {
  //     const result = await Promise.all(tokens.map((token) => fetchRiskToken(token.address, token.chainId)))
  //     return result.some((r) => r.riskLevel >= TOKEN_RISK.MEDIUM)
  //   },
  //   {
  //     enabled: Boolean(tokens),
  //     refetchOnWindowFocus: false,
  //     refetchOnReconnect: false,
  //     refetchOnMount: false,
  //   },
  // )

  // const { targetRef, tooltip, tooltipVisible } = useTooltip(
  //   t('I have read the scanning result, understood the risk and want to proceed with token importing.'),
  // )

  const importHandler = useCallback(() => {
    tokens.forEach((token) => {
      const inactiveToken = chainId && inactiveTokenList?.[token.chainId]?.[token.address]
      let tokenToAdd = token
      if (inactiveToken) {
        tokenToAdd = new WrappedTokenInfo({
          ...token,
          logoURI: inactiveToken.token.logoURI,
          name: token.name || inactiveToken.token.name,
        })
      }
      addToken(tokenToAdd)
    })
    if (handleCurrencySelect) {
      handleCurrencySelect(tokens[0])
    }

    setUserAddedTokenMap((prev) => ({
      ...prev,
      ...tokens.reduce(
        (acc, token) => ({
          ...acc,
          [token.wrapped.address.toLowerCase()]: token,
        }),
        {},
      ),
    }))
  }, [addToken, chainId, handleCurrencySelect, inactiveTokenList, tokens, setUserAddedTokenMap])

  return (
    <div className="w-full">
      <Notification variant="warning" fullWidth>
        <p>
          {t(
            'Anyone can create tokens on {{network}} with any name, including creating fake versions of existing tokens and tokens that claim to represent projects that do not have a token.',
            {
              // network: chains.find((c) => c.id === chainId)?.name,
              network: 'Kaia',
            },
          )}
        </p>
        <p className="mt-2 font-bold">
          {t('If you purchase a fraudulent token, you may be exposed to permanent loss of funds.')}
        </p>
      </Notification>

      <div className="mt-4 flex flex-col space-y-4">
        {tokens.map((token) => {
          const list = token.chainId && inactiveTokenList?.[token.chainId]?.[token.address]?.list
          const address = token.address ? `${truncateHash(token.address)}` : null
          return (
            <div key={`importToken:${token.address}`} className="flex flex-col space-y-3">
              {!!token.chainId && (
                <div className="bg-neutral p-4 rounded-xl">
                  {list !== undefined ? (
                    <div className="flex items-center space-x-2 text-sm">
                      {list.logoURI && (
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                          <img src={list.logoURI} alt={list.name} />
                        </div>
                      )}

                      <span>
                        {t('via')} {list.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-yellow-300 text-xs">
                      <Warning size={12} weight="fill" />
                      <p>{t('Unknown Source')}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 justify-between mt-2 text-on-surface">
                    <div className="flex items-center space-x-3">
                      <CurrencyLogo currency={token} size={32} />

                      <div className="flex flex-col items-start text-ellipsis overflow-hidden text-sm">
                        <p>
                          {token.name} ({token.symbol})
                        </p>
                        <p>{address}</p>
                      </div>
                    </div>

                    <ExternalLink href={getBlockExploreLink(token.address, 'address')} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        <CheckboxV2
          id="import-token-checkbox"
          checked={confirmed}
          onChange={() => setConfirmed(!confirmed)}
          label={t('I understand')}
          labelClassName="text-on-surface"
        />

        {/* {hasRiskToken && (
          <div ref={targetRef}>
            <HelpIcon color="textSubtle" />
            {tooltipVisible && tooltip}
          </div>
        )} */}
      </div>

      <ButtonV2 className="mt-3" variant="primary" disabled={!confirmed} onClick={importHandler} fullWidth>
        {/* {hasRiskToken ? t('Proceed') : t('Import')} */}
        {t('Import')}
      </ButtonV2>
    </div>
  )
}

export default ImportToken
