import { ChainId } from "@pancakeswap/chains";
import { Currency, NATIVE, Token } from "@pancakeswap/sdk";
import { bscTokens, ethereumTokens, klaytnTokens } from "@pancakeswap/tokens";
import memoize from "lodash/memoize";
import { getAddress } from "viem";

const mapping: { [key: number]: string } = {
  [ChainId.BSC]: "smartchain",
  [ChainId.ETHEREUM]: "ethereum",
  [ChainId.KLAYTN]: "klaytn",
};

export const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (token && mapping[token.chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[token.chainId]}/assets/${getAddress(
        token.address
      )}/logo.png`;
    }
    return null;
  },
  (t) => `${t?.chainId}#${t?.address}`
);

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => {
    if (address && chainId && mapping[chainId]) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${getAddress(
        address
      )}/logo.png`;
    }
    return null;
  },
  (address, chainId) => `${chainId}#${address}`
);

const chainName: { [key: number]: string } = {
  [ChainId.BSC]: "",
  [ChainId.ETHEREUM]: "eth",
  [ChainId.KLAYTN]: "klaytn",
};

export const getTokenListTokenUrl = (token: Token) =>
  Object.keys(chainName).includes(String(token.chainId))
    ? `/images/tokens/${token.chainId === ChainId.BSC ? "" : `${chainName[token.chainId]}/`}${token.address}.png`
    : null;

const commonCurrencySymbols = [
  ethereumTokens.usdt,
  ethereumTokens.usdc,
  bscTokens.cake,
  ethereumTokens.wbtc,
  ethereumTokens.weth,
  NATIVE[ChainId.BSC],
  bscTokens.busd,
  ethereumTokens.dai,
  NATIVE[ChainId.KLAYTN],
  klaytnTokens.weth,
  klaytnTokens.usdt,
  klaytnTokens.fnsa,
].map(({ symbol }) => symbol);

export const getCommonCurrencyUrl = memoize(
  (currency?: Currency): string | undefined => getCommonCurrencyUrlBySymbol(currency?.symbol),
  (currency?: Currency) => `logoUrls#${currency?.chainId}#${currency?.symbol}`
);

export const getCommonCurrencyUrlBySymbol = memoize(
  (symbol?: string): string | undefined =>
    symbol && commonCurrencySymbols.includes(symbol) ? `/images/symbol/${symbol.toLocaleLowerCase()}.png` : undefined,
  (symbol?: string) => `logoUrls#symbol#${symbol}`
);

export const getTokenLogoFromSs = (token?: Token) => {
  return token ? `https://api.swapscanner.io/v0/tokens/${getAddress(token.address).toLocaleLowerCase()}/icon` : null;
};

type GetLogoUrlsOptions = {
  useTrustWallet?: boolean;
};

export const getCurrencyLogoUrls = memoize(
  (currency: Currency | undefined, { useTrustWallet = true }: GetLogoUrlsOptions = {}): string[] => {
    const trustWalletLogo = getTokenLogoURL(currency?.wrapped);
    const logoUrl = currency ? getTokenListTokenUrl(currency.wrapped) : null;

    return [getCommonCurrencyUrl(currency), useTrustWallet ? trustWalletLogo : undefined, logoUrl].filter(
      (url): url is string => !!url
    );
  },
  (currency: Currency | undefined, options?: GetLogoUrlsOptions) =>
    `logoUrls#${currency?.chainId}#${currency?.wrapped?.address}#${options ? JSON.stringify(options) : ""}`
);
