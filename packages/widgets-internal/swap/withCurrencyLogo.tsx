import { BaseCurrency } from "@pancakeswap/swap-sdk-core";
import { Plus } from "@phosphor-icons/react";
import clsx from "clsx";
import { CSSProperties, ReactElement } from "react";

interface CurrencyLogoPropsType<T> {
  currency?: T;
  size?: number;
  style?: React.CSSProperties;
}

export function withCurrencyLogo<T extends BaseCurrency>(
  CurrencyLogo: (props: CurrencyLogoPropsType<T>) => ReactElement
) {
  return ({
    token,
    className,
    onCurrencySelect,
    isActive,
    isAdded,
    setImportToken,
    showImportView,
    size,
  }: {
    token: T;
    className?: string;
    style?: CSSProperties;
    onCurrencySelect?: (currency: T) => void;
    isActive: boolean;
    isAdded: boolean;
    setImportToken: (token: T) => void;
    showImportView: () => void;
    size?: number;
  }) => {
    return (
      <button
        type="button"
        className={clsx("flex items-center space-x-2 py-3 hover:opacity-70 justify-between", className)}
        onClick={() => {
          if (isActive) {
            onCurrencySelect?.(token);
          } else if (!isAdded) {
            if (setImportToken) {
              setImportToken(token);
            }
            showImportView();
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <CurrencyLogo currency={token} size={size} />

          <div className="text-ellipsis overflow-hidden flex items-center space-x-2">
            <span className="text-sm text-on-surface">{token.symbol}</span>
            <span className="text-gray-400 text-xs">{token.name}</span>
          </div>
        </div>

        {!isAdded && <Plus size={16} className="text-gray-200" />}

        {/* {children && children} */}
      </button>
    );
  };
}
