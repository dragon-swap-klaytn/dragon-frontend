import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import {
  ArrowUpIcon,
  AutoColumn,
  BscScanIcon,
  Button,
  ColumnCenter,
  InjectedModalProps,
  Link,
  Modal,
  ModalProps,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import KlipProvider from '@pancakeswap/wagmi/connectors/klip/interface'
import { ConfirmationPendingContent, TransactionErrorContent } from '@pancakeswap/widgets-internal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { klipConnector } from 'utils/wagmi'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useAccount } from 'wagmi'
import AddToWalletButton, { AddToWalletTextOptions } from '../AddToWallet/AddToWalletButton'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 24px 0;
`

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const { t } = useTranslation()

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId)

  return (
    <Wrapper>
      <Section>
        <ConfirmedIcon>
          <ArrowUpIcon strokeWidth={0.5} width="90px" color="primary" />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify="center">
          <Text fontSize="20px">{t('Transaction Submitted')}</Text>
          {chainId && hash && (
            <Link external small href={getBlockExploreLink(hash, 'transaction', chainId)}>
              {t('View on %site%', {
                site: getBlockExploreName(chainId),
              })}
              {chainId === ChainId.BSC && <BscScanIcon color="primary" ml="4px" />}
            </Link>
          )}
          {currencyToAdd && (
            <AddToWalletButton
              variant="tertiary"
              mt="12px"
              width="fit-content"
              marginTextBetweenLogo="6px"
              textOptions={AddToWalletTextOptions.TEXT_WITH_ASSET}
              tokenAddress={token?.address}
              tokenSymbol={currencyToAdd.symbol}
              tokenDecimals={token?.decimals}
              tokenLogo={token instanceof WrappedTokenInfo ? token.logoURI : undefined}
            />
          )}
          <Button onClick={onDismiss} mt="20px">
            {t('Close')}
          </Button>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  title: string
  customOnDismiss?: () => void
  hash: string | undefined
  errorMessage?: string
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
}

const TransactionConfirmationModal: React.FC<
  React.PropsWithChildren<InjectedModalProps & ConfirmationModalProps & ModalProps>
> = ({
  title,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  errorMessage,
  hash,
  pendingText,
  content,
  currencyToAdd,
  ...props
}) => {
  const a2aProviderRef = useRef<KlipProvider | null>(null)

  const { chainId } = useActiveChainId()

  const { connector } = useAccount()

  const { isMobile } = useMatchBreakpoints()

  const [qrUri, setQrUri] = useState('')
  const [requestKey, setRequestKey] = useState('')

  const isA2AConnector = connector?.id === 'klip'

  const displayUriHandler = (uri) => {
    setQrUri(uri)
  }

  const requestKeyHandler = (key) => {
    setRequestKey(key)
  }

  useEffect(() => {
    if (isMobile || !isA2AConnector || qrUri) return

    let provider

    klipConnector.getProvider().then((klipProvider) => {
      if (!klipProvider) return
      a2aProviderRef.current = klipProvider

      provider = klipProvider
      provider.on('display_uri', displayUriHandler)
      provider.on('requestKey', requestKeyHandler)
    })

    // eslint-disable-next-line consistent-return
    return () => {
      if (provider) {
        provider?.off('display_uri', displayUriHandler)
        provider?.off('requestKey', requestKeyHandler)
      }
    }
  }, [isA2AConnector, qrUri, isMobile])

  useEffect(() => {
    return () => {
      if (a2aProviderRef.current && requestKey) {
        a2aProviderRef.current.events.emit('cancelRequest', requestKey)
        a2aProviderRef.current?.off('display_uri', displayUriHandler)
        a2aProviderRef.current?.off('requestKey', requestKeyHandler)
        a2aProviderRef.current = null
      }
    }
  }, [a2aProviderRef, requestKey])

  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss()
    }

    onDismiss?.()
  }, [customOnDismiss, onDismiss])

  if (!chainId) return null

  return (
    <Modal title={title} headerBackground="gradientCardHeader" {...props} onDismiss={handleDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent qrUri={qrUri} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={handleDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : errorMessage ? (
        <TransactionErrorContent message={errorMessage} onDismiss={handleDismiss} />
      ) : (
        content()
      )}
    </Modal>
  )
}

export default TransactionConfirmationModal
