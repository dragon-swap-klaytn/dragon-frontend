import { Currency } from "@pancakeswap/sdk";

import clsx from "clsx";
import { CurrencyLogo } from "./CurrencyLogo";

interface DoubleCurrencyLogoProps {
  margin?: string;
  size?: number;
  currency0?: Currency;
  currency1?: Currency;
}

export function DoubleCurrencyLogo({ currency0, currency1, size = 20, margin }: DoubleCurrencyLogoProps) {
  return (
    <div className={clsx("flex items-center space-x-2", margin)}>
      {currency0 && <CurrencyLogo currency={currency0} size={size} />}
      {currency1 && <CurrencyLogo currency={currency1} size={size} />}
    </div>
  );
}
