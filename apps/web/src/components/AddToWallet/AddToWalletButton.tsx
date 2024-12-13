import { useTranslation } from '@pancakeswap/localization'
import {
  BinanceChainIcon,
  ButtonProps,
  CoinbaseWalletIcon,
  MetamaskIcon,
  OperaIcon,
  TokenPocketIcon,
  TrustWalletIcon,
} from '@pancakeswap/uikit'
import Button from 'components/Common/Button'
import KaikasIcon from 'components/Svg/KaiaWalletIcon'
import { useAccount } from 'wagmi'
import { canRegisterToken } from '../../utils/wallet'
import { BAD_SRCS } from '../Logo/constants'

export enum AddToWalletTextOptions {
  NO_TEXT,
  TEXT,
  TEXT_WITH_ASSET,
}

export interface AddToWalletButtonProps {
  tokenAddress?: string
  tokenSymbol?: string
  tokenDecimals?: number
  tokenLogo?: string
  textOptions?: AddToWalletTextOptions
}

const Icons = {
  // TODO: Brave
  Binance: BinanceChainIcon,
  'Coinbase Wallet': CoinbaseWalletIcon,
  Opera: OperaIcon,
  TokenPocket: TokenPocketIcon,
  'Trust Wallet': TrustWalletIcon,
  MetaMask: MetamaskIcon,
}

const getWalletText = (textOptions: AddToWalletTextOptions, tokenSymbol: string | undefined, t: any) => {
  return (
    textOptions !== AddToWalletTextOptions.NO_TEXT &&
    (textOptions === AddToWalletTextOptions.TEXT
      ? t('Add to Wallet')
      : t('Add %asset% to Wallet', { asset: tokenSymbol }))
  )
}

const getWalletIcon = (name?: string) => {
  const iconProps = {
    width: '16px',
  }

  if (name && Icons[name]) {
    const Icon = Icons[name]
    return <Icon {...iconProps} />
  }
  if (window?.ethereum?.isTrust) {
    return <TrustWalletIcon {...iconProps} />
  }
  if (window?.ethereum?.isCoinbaseWallet) {
    return <CoinbaseWalletIcon {...iconProps} />
  }
  if (window?.ethereum?.isTokenPocket) {
    return <TokenPocketIcon {...iconProps} />
  }
  if (window?.klaytn) {
    return <KaikasIcon {...iconProps} />
  }
  if (window?.ethereum?.isMetaMask) {
    return <MetamaskIcon {...iconProps} />
  }

  return <MetamaskIcon {...iconProps} />
}

const AddToWalletButton: React.FC<AddToWalletButtonProps & ButtonProps> = ({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  tokenLogo,
  textOptions = AddToWalletTextOptions.NO_TEXT,
}) => {
  const { t } = useTranslation()
  const { connector, isConnected } = useAccount()
  const isCanRegisterToken = canRegisterToken()

  if (connector && connector.name === 'Binance') return null
  if (!(connector && connector.watchAsset && isConnected)) return null
  if (!isCanRegisterToken) return null

  return (
    <Button
      variant="primary"
      className="flex items-center space-x-2 justify-center text-sm"
      onClick={() => {
        const image = tokenLogo ? (BAD_SRCS[tokenLogo] ? undefined : tokenLogo) : undefined
        if (!tokenAddress || !tokenSymbol) return
        connector.watchAsset?.({
          address: tokenAddress,
          symbol: tokenSymbol,
          image,
          // @ts-ignore
          decimals: tokenDecimals,
        })
      }}
    >
      <span>{getWalletText(textOptions, tokenSymbol, t)}</span>
      {getWalletIcon(connector?.name)}
    </Button>
  )
}

export default AddToWalletButton
