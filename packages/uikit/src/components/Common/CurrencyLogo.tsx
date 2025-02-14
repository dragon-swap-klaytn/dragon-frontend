import { Currency } from "@pancakeswap/swap-sdk-core";
import { useMemo } from "react";

import getTokenIconSrc from "@pancakeswap/utils/getTokenIconSrc";
import { ZERO_ADDRESS } from "../../tokens";
import { TokenLogo } from "../TokenLogo";

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
      return [getTokenIconSrc(ZERO_ADDRESS) || `/images/chains/${currency.chainId}.png`];
    }

    if (address) {
      const logoFromSs = getTokenIconSrc(address);

      if (logoFromSs) {
        return [logoFromSs];
      }
    }

    if (currency?.isToken) {
      const logoFromSs = getTokenIconSrc(currency?.wrapped?.address);
      if (logoFromSs) {
        return [logoFromSs];
      }
    }

    return [];
  }, [currency, address]);

  return <TokenLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} className={className} />;
}
