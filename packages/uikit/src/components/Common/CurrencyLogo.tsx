import { Currency } from "@pancakeswap/swap-sdk-core";
import { TokenLogo, ZERO_ADDRESS } from "@pancakeswap/uikit";
import { useMemo } from "react";

import getTokenIconSrcFromSs from "@pancakeswap/utils/getTokenIconSrcFromSs";

export function CurrencyLogo({
  currency,
  size = 24,
  address,
  className,
}: {
  currency?: Currency;
  size?: number;
  address?: string;
  className?: string;
}) {
  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) {
      return [getTokenIconSrcFromSs(ZERO_ADDRESS) || `/images/chains/${currency.chainId}.png`];
    }

    if (address) {
      const logoFromSs = getTokenIconSrcFromSs(address);

      if (logoFromSs) {
        return [logoFromSs];
      }
    }

    if (currency?.isToken) {
      const logoFromSs = getTokenIconSrcFromSs(currency?.wrapped?.address);
      if (logoFromSs) {
        return [logoFromSs];
      }
    }

    return [];
  }, [currency, address]);

  return <TokenLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} className={className} />;
}
