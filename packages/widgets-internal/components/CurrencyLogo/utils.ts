import { ChainId } from "@pancakeswap/chains";
import { Currency, NATIVE, Token } from "@pancakeswap/sdk";
import { klaytnTokens } from "@pancakeswap/tokens";
import getTokenIconSrcFromSs from "@pancakeswap/utils/getTokenIconSrcFromSs";
import memoize from "lodash/memoize";
import { getAddress } from "viem";

const mapping: { [key: number]: string } = {
  [ChainId.KLAYTN]: "klaytn",
};

export const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (token && mapping[token.chainId]) {
      if (token.chainId === ChainId.KLAYTN) {
        return getTokenIconSrcFromSs(token.address);
      }

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
      if (chainId === ChainId.KLAYTN) {
        return getTokenIconSrcFromSs(address);
      }

      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${getAddress(
        address
      )}/logo.png`;
    }
    return null;
  },
  (address, chainId) => `${chainId}#${address}`
);

const chainName: { [key: number]: string } = {
  [ChainId.KLAYTN]: "klaytn",
};

export const getTokenListTokenUrl = (token?: Token) => {
  if (!token) return null;

  return Object.keys(chainName).includes(String(token.chainId))
    ? token.chainId === ChainId.KLAYTN
      ? getTokenIconSrcFromSs(token.address)
      : `/images/tokens/${`${chainName[token.chainId]}/`}${token.address}.png`
    : null;
};

const commonCurrencySymbols = [NATIVE[ChainId.KLAYTN], klaytnTokens.weth, klaytnTokens.usdt, klaytnTokens.fnsa].map(
  ({ symbol }) => symbol
);

export const getCommonCurrencyUrl = memoize(
  (currency?: Currency): string | undefined => getCommonCurrencyUrlBySymbol(currency?.symbol),
  (currency?: Currency) => `logoUrls#${currency?.chainId}#${currency?.symbol}`
);

export const getCommonCurrencyUrlBySymbol = memoize(
  (symbol?: string): string | undefined =>
    symbol && commonCurrencySymbols.includes(symbol) ? `/images/symbol/${symbol.toLocaleLowerCase()}.png` : undefined,
  (symbol?: string) => `logoUrls#symbol#${symbol}`
);

export const getCurrencyLogoUrls = memoize(
  (currency: Currency | undefined): string[] => {
    const logoUrl = currency ? getTokenListTokenUrl(currency.wrapped) : null;

    return [getCommonCurrencyUrl(currency), logoUrl].filter((url): url is string => !!url);
  },
  (currency: Currency | undefined) => `logoUrls#${currency?.chainId}#${currency?.wrapped?.address}`
);
