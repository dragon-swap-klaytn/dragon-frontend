import { useHttpLocations } from "@pancakeswap/hooks";
import { Currency } from "@pancakeswap/sdk";
import { TokenLogo, ZERO_ADDRESS } from "@pancakeswap/uikit";
import { useMemo } from "react";

import getTokenIconSrcFromSs from "@pancakeswap/utils/getTokenIconSrcFromSs";
import { getCurrencyLogoUrls } from "./utils";

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
  const uriLocations = useHttpLocations(currency?.logoURI);

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

      const logoUrls = getCurrencyLogoUrls(currency);

      if (currency?.logoURI) {
        return [...uriLocations, ...logoUrls];
      }

      return [...logoUrls];
    }

    return [];
  }, [currency, uriLocations, address]);

  return <TokenLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} className={className} />;
}
