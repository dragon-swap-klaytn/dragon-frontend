import { Currency } from "@pancakeswap/sdk";
import { TokenLogo, ZERO_ADDRESS } from "@pancakeswap/uikit";
import { useMemo } from "react";

import getTokenIconSrc from "@pancakeswap/utils/getTokenIconSrc";

export function CurrencyLogo({
  currency,
  size = 24,
  address,
  className,
}: {
  currency?: Currency & {
    logoURI?: string | undefined;
  };
  size?: number;
  address?: string;
  className?: string;
}) {
  const srcs = useMemo(() => {
    if (currency?.isNative) {
      return [getTokenIconSrc(ZERO_ADDRESS)] as string[];
    }

    if (address) {
      const logoFromSs = getTokenIconSrc(address);
      if (logoFromSs) {
        return [logoFromSs];
      }
    }

    if (currency && "address" in currency) {
      const logoFromSs = getTokenIconSrc(currency.address);
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
