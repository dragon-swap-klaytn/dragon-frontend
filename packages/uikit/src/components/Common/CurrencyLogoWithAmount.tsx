import clsx from "clsx";
import { ReactNode } from "react";
import { CurrencyLogoWithSymbol, CurrencyLogoWithSymbolProps } from "./CurrencyLogoWithSymbol";

export function CurrencyLogoWithAmount({
  className,
  currencyA,
  currencyB,
  addressA,
  addressB,
  symbol,
  symbolClassName = "text-on-surface font-bold",
  amount,
  amountClassName = "text-on-surface",
  value,
  valueClassName = "text-on-surface-subtlest text-xs",
}: CurrencyLogoWithSymbolProps & {
  amount: ReactNode;
  amountClassName?: string;
  value?: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className={clsx("flex w-full space-x-2 justify-between", className)}>
      <CurrencyLogoWithSymbol
        currencyA={currencyA}
        currencyB={currencyB}
        addressA={addressA}
        addressB={addressB}
        symbol={symbol}
        symbolClassName={symbolClassName}
      />

      <div className="flex flex-col items-end space-y-1">
        <span className={amountClassName}>{amount}</span>
        {value && <span className={valueClassName}>{value}</span>}
      </div>
    </div>
  );
}
