import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import {
  ImageProps,
  TokenImage as UIKitTokenImage,
  TokenPairImage as UIKitTokenPairImage,
  TokenPairImageProps as UIKitTokenPairImageProps,
} from '@pancakeswap/uikit'
import getTokenIconSrc from '@pancakeswap/utils/getTokenIconSrc'

interface TokenPairImageProps extends Omit<UIKitTokenPairImageProps, 'primarySrc' | 'secondarySrc'> {
  primaryToken: Token
  secondaryToken: Token
}

export const tokenImageChainNameMapping = {
  [ChainId.KLAYTN]: 'klaytn/',
}

export const TokenPairImage: React.FC<React.PropsWithChildren<TokenPairImageProps>> = ({
  primaryToken,
  secondaryToken,
  ...props
}) => {
  return (
    <UIKitTokenPairImage
      primarySrc={getTokenIconSrc(primaryToken.address) || ''}
      secondarySrc={getTokenIconSrc(secondaryToken.address) || ''}
      {...props}
    />
  )
}

interface TokenImageProps extends ImageProps {
  token: Token
}

export const TokenImage: React.FC<React.PropsWithChildren<TokenImageProps>> = ({ token, ...props }) => {
  return <UIKitTokenImage src={getTokenIconSrc(token.address) || ''} {...props} />
}
