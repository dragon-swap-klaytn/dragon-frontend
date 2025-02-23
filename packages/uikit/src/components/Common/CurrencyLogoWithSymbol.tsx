import { Currency } from "@pancakeswap/swap-sdk-core";
import clsx from "clsx";
import { ReactNode } from "react-markdown";
import { CurrencyLogo } from "./CurrencyLogo";

export type CurrencyLogoWithSymbolProps = {
  className?: string;
  logoSize?: number;
  currencyA?: Currency;
  currencyB?: Currency;
  addressA?: string;
  addressB?: string;
  symbol?: ReactNode;
  spaceX?: string;
  symbolClassName?: string;
  flex?: string;
};

export function CurrencyLogoWithSymbol({
  className,
  logoSize,
  currencyA,
  currencyB,
  addressA,
  addressB,
  symbol,
  spaceX = "space-x-2",
  symbolClassName = "text-on-surface text-sm font-bold",
  flex = "flex items-center",
}: CurrencyLogoWithSymbolProps) {
  return (
    <div className={clsx(flex, className, spaceX)}>
      <div className="flex items-center space-x-1">
        <CurrencyLogo currency={currencyA} address={addressA} size={logoSize} />

        {Boolean(currencyB || addressB) && <CurrencyLogo currency={currencyB} address={addressB} />}
      </div>

      <span className={symbolClassName}>{symbol}</span>
    </div>
  );
}
